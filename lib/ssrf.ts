import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";

const blocked = new BlockList();

function blockV4(network: string, prefix: number) {
  blocked.addSubnet(network, prefix, "ipv4");
}
blockV4("0.0.0.0", 8);
blockV4("10.0.0.0", 8);
blockV4("100.64.0.0", 10);
blockV4("127.0.0.0", 8);
blockV4("169.254.0.0", 16);
blockV4("172.16.0.0", 12);
blockV4("192.0.0.0", 24);
blockV4("192.0.2.0", 24);
blockV4("192.168.0.0", 16);
blockV4("198.18.0.0", 15);
blockV4("198.51.100.0", 24);
blockV4("203.0.113.0", 24);
blockV4("224.0.0.0", 4);
blocked.addAddress("255.255.255.255", "ipv4");
blocked.addAddress("::", "ipv6");
blocked.addAddress("::1", "ipv6");
blocked.addSubnet("fc00::", 7, "ipv6");
blocked.addSubnet("fe80::", 10, "ipv6");

const HOST_DENY = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata",
  "metadata.google",
  "metadata.google.internal",
  "metadata.google.com",
  "instance-data",
]);

export class SsrfError extends Error {
  readonly code: string;
  constructor(code: string) {
    super("That URL can't be scanned.");
    this.name = "SsrfError";
    this.code = code;
  }
}

export type LookupFn = (hostname: string) => Promise<string[]>;

export async function defaultLookup(hostname: string): Promise<string[]> {
  const results = await lookup(hostname, { all: true, verbatim: true });
  return results.map((row) => row.address);
}

export function isBlockedIp(address: string): boolean {
  const mapped = address.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i);
  if (mapped?.[1]) return isBlockedIp(mapped[1]);
  const family = isIP(address);
  if (family === 4) return blocked.check(address, "ipv4");
  if (family === 6) return blocked.check(address, "ipv6");
  return true;
}

function hostnameDenied(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (!host) return true;
  if (HOST_DENY.has(host)) return true;
  if (
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".localdomain")
  ) {
    return true;
  }
  if (host.includes("metadata.google") || host === "169.254.169.254") return true;
  return false;
}

export async function assertPublicHttpUrl(input: string, lookupFn: LookupFn = defaultLookup): Promise<URL> {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new SsrfError("bad-url");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new SsrfError("bad-protocol");
  if (url.username || url.password) throw new SsrfError("credentials");
  if (url.port && url.port !== "80" && url.port !== "443") throw new SsrfError("bad-port");

  const host = url.hostname;
  if (hostnameDenied(host)) throw new SsrfError("denied-host");
  if (isIP(host)) {
    if (isBlockedIp(host)) throw new SsrfError("private-ip");
    return url;
  }
  if (!host.includes(".")) throw new SsrfError("denied-host");

  let addresses: string[];
  try {
    addresses = await lookupFn(host);
  } catch {
    throw new SsrfError("dns");
  }
  if (!addresses.length) throw new SsrfError("dns");
  for (const address of addresses) {
    if (isBlockedIp(address)) throw new SsrfError("private-dns");
  }
  return url;
}

export type SafeFetchInit = {
  timeoutMs: number;
  lookupFn?: LookupFn;
  fetchImpl?: typeof fetch;
  headers?: HeadersInit;
  maxRedirects?: number;
};

export async function safeFetch(input: string, init: SafeFetchInit): Promise<Response> {
  const fetchImpl = init.fetchImpl ?? fetch;
  const lookupFn = init.lookupFn ?? defaultLookup;
  let current = await assertPublicHttpUrl(input, lookupFn);
  const hops = init.maxRedirects ?? 3;

  for (let hop = 0; hop <= hops; hop++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), init.timeoutMs);
    try {
      const response = await fetchImpl(current.toString(), {
        redirect: "manual",
        signal: ctrl.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; EjectScan/0.2; +https://ejectfrom.com/scan)",
          Accept: "text/html,application/xhtml+xml,application/xml,*/*",
          ...Object.fromEntries(new Headers(init.headers).entries()),
        },
      });
      const location = response.headers.get("location");
      const redirected = response.status >= 300 && response.status < 400 && location;
      if (!redirected) return response;
      if (hop === hops) throw new SsrfError("redirects");
      const next = new URL(location, current).toString();
      current = await assertPublicHttpUrl(next, lookupFn);
    } finally {
      clearTimeout(timer);
    }
  }
  throw new SsrfError("redirects");
}
