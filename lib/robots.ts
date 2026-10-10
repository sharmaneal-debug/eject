import { safeFetch, type LookupFn } from "./ssrf";

export type RobotsRules = {
  allows(pathname: string): boolean;
};

const ALLOW_ALL: RobotsRules = { allows: () => true };

type Group = { agents: string[]; allow: string[]; disallow: string[] };

function pathMatches(pathname: string, rule: string): boolean {
  if (!rule) return false;
  const endAnchored = rule.endsWith("$");
  const body = endAnchored ? rule.slice(0, -1) : rule;
  if (!body.includes("*") && !endAnchored) return pathname.startsWith(body);
  const pattern =
    "^" +
    body.replace(/[.+?^{}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") +
    (endAnchored ? "$" : "");
  return new RegExp(pattern).test(pathname);
}

function parseGroups(body: string): Group[] {
  const groups: Group[] = [];
  let current: Group | null = null;
  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const field = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (field === "user-agent") {
      if (!current || current.allow.length > 0 || current.disallow.length > 0) {
        current = { agents: [], allow: [], disallow: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      continue;
    }
    if (!current) continue;
    if (field === "allow") current.allow.push(value);
    if (field === "disallow") current.disallow.push(value);
  }
  return groups;
}

function selectGroups(groups: Group[], userAgent: string): Group[] {
  const needle = userAgent.toLowerCase();
  let best = 0;
  for (const group of groups) {
    for (const agent of group.agents) {
      if (agent !== "*" && needle.includes(agent) && agent.length > best) best = agent.length;
    }
  }
  if (best > 0) {
    return groups.filter((group) => group.agents.some((agent) => agent !== "*" && needle.includes(agent) && agent.length === best));
  }
  return groups.filter((group) => group.agents.includes("*"));
}

/** Product crawler name used when a robots.txt group is more specific than `*`. */
export const CRAWL_ROBOTS_AGENT = "EjectScan";

export function parseRobots(body: string, userAgent = CRAWL_ROBOTS_AGENT): RobotsRules {
  const head = body.slice(0, 800);
  if (/<!doctype|<html[\s>]/i.test(head)) return ALLOW_ALL;
  const chosen = selectGroups(parseGroups(body), userAgent);
  return {
    allows(pathname: string) {
      const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
      let bestAllow = -1;
      let bestDisallow = -1;
      for (const group of chosen) {
        for (const rule of group.allow) {
          if (rule && pathMatches(path, rule) && rule.length > bestAllow) bestAllow = rule.length;
        }
        for (const rule of group.disallow) {
          if (!rule) continue;
          if (pathMatches(path, rule) && rule.length > bestDisallow) bestDisallow = rule.length;
        }
      }
      if (bestDisallow < 0) return true;
      return bestAllow >= bestDisallow;
    },
  };
}

export class RobotsError extends Error {
  constructor() {
    super("That site's robots.txt disallows a scan.");
    this.name = "RobotsError";
  }
}

export async function loadRobots(
  origin: string,
  deps: { lookupFn?: LookupFn; fetchImpl?: typeof fetch } = {},
  userAgent = CRAWL_ROBOTS_AGENT,
): Promise<RobotsRules> {
  try {
    const response = await safeFetch(new URL("/robots.txt", origin).toString(), {
      timeoutMs: 6_000,
      lookupFn: deps.lookupFn,
      fetchImpl: deps.fetchImpl,
      headers: { Accept: "text/plain,*/*" },
    });
    if (!response.ok) {
      await response.body?.cancel();
      return ALLOW_ALL;
    }
    const type = response.headers.get("content-type") ?? "";
    if (/html/i.test(type)) {
      await response.body?.cancel();
      return ALLOW_ALL;
    }
    const text = (await response.text()).slice(0, 500_000);
    return parseRobots(text, userAgent);
  } catch {
    return ALLOW_ALL;
  }
}
