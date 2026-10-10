import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ComplexityReport, CrawlSnapshot } from "./complexity";
import { agentsMarkdown, editingPlaybookMarkdown, lightweightEditorScript } from "./editor-guide";
import type { DeliveryPacket, Order } from "./orders";
import { simpleSiteScope, tierConfig } from "./pricing";

function textFromHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 8_000);
}

function slugFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "site";
  } catch {
    return "site";
  }
}

export function buildDelivery(order: Order, report: ComplexityReport, snapshot: CrawlSnapshot): DeliveryPacket {
  const llm = process.env.ANTHROPIC_API_KEY ? "queued" : "absent";
  const mode = llm === "queued" ? "queued" : "manual";
  const slug = slugFromUrl(snapshot.finalUrl || order.siteUrl || "site");
  const kitPath = order.token ? `/kit?token=${encodeURIComponent(order.token)}` : "/kit";
  const hostingSteps = [
    "Create a git repository from the files in this handoff.",
    "Push it to GitHub, GitLab, or a host you control.",
    "Connect Cloudflare Pages, Vercel, or Netlify and use their free tier if it fits the traffic.",
    "Set the build to the Next.js app once a person (or you, with the kit) has turned the content snapshot into pages.",
    "Point the domain only after you have reviewed a deployment. Eject does not cut DNS over automatically.",
  ];
  const offer = tierConfig(order.tier);
  const editorNote =
    "You edit this site by chatting with your own agent. AGENTS.md is the instruction file. scripts/chat-edit.mjs queues a sentence for that agent and does not call a model. scripts/editor.ts in the Eject repo is the optional CLI when ANTHROPIC_API_KEY is set.";

  const pages = snapshot.pages.slice(0, 12).map((page, index) => {
    let pathname = "home";
    try {
      pathname = new URL(page.url).pathname.replace(/^\//, "").replace(/\/$/, "") || "home";
    } catch {
      pathname = `page-${index + 1}`;
    }
    const safe = pathname.replace(/[^a-z0-9/_-]+/gi, "-").replace(/\//g, "__") || "home";
    return {
      path: `content/${safe}.md`,
      contents: `# ${safe}\n\nSource: ${page.url}\n\n${textFromHtml(page.html)}\n`,
    };
  });

  const tierNote =
    order.tier === "done_for_you"
      ? `Custom migration. We handle the migration for you, step by step.`
      : `Automated ($${offer.price}). The migration run is queued or manual depending on whether ANTHROPIC_API_KEY is set. Editing afterwards is yours.`;
  const readme = `# ${slug}\n\n## Edit it by chatting\n\nOpen this folder in Cursor, Claude, or ChatGPT. The agent follows AGENTS.md. You can also run \`node scripts/chat-edit.mjs "your change"\` to queue a sentence in edits/inbox.md.\n\n${tierNote}\n\n## What was automated\n\n- Public pages were fetched and scored.\n- Eligibility: ${report.eligibility}.\n- Assets look ${report.assetsPullable ? "pullable" : "hard to pull"} (${report.assetCount} found).\n- Rebuild ease: ${report.rebuildEase}.\n\n## What is reviewed\n\n${order.tier === "done_for_you" ? "A person builds and reviews the pages before you see them." : "The automated tier does not publish a preview by itself. A visual pass still happens before anything is called done."} PageSpeed gains are not measured or promised.\n\n## Commands\n\nFrom the Eject repository:\n\n\`\`\`sh\npnpm crawl ${snapshot.finalUrl} --max-pages=${simpleSiteScope.maxPages}\npnpm rebuild data/snapshots/${slug}\npnpm editor ./out/orders/${order.id}\n\`\`\`\n\n\`pnpm rebuild\` and \`pnpm editor\` need ANTHROPIC_API_KEY. Without that key, use AGENTS.md with your own agent.\n`;

  const hosting = `# Hosting\n\n${hostingSteps.map((step, index) => `${index + 1}. ${step}`).join("\n")}\n\nEject does not host the customer site and does not publish a preview URL on its own.\n`;
  const editor = `# Editor\n\n${editorNote}\n\nKit: ${kitPath}\n\nYour agent: read AGENTS.md in this folder.\n\nOptional CLI, from the Eject repo:\n\n\`\`\`sh\npnpm editor ./out/orders/${order.id}\n\`\`\`\n`;
  const notes = JSON.stringify(
    {
      orderId: order.id,
      tier: order.tier,
      eligibility: report.eligibility,
      referral: report.referral,
      platform: report.platform,
      pageCount: report.pageCount,
      assetsPullable: report.assetsPullable,
      rebuildEase: report.rebuildEase,
      migration: report.migration,
      costToServe: report.costToServe,
    },
    null,
    2,
  );

  return {
    mode,
    llm,
    assetsPullable: report.assetsPullable,
    rebuildEase: report.rebuildEase,
    hostingSteps,
    editor: {
      cli: `pnpm editor ./out/orders/${order.id}`,
      kitPath,
      note: editorNote,
    },
    repoFiles: [
      { path: "README.md", contents: readme },
      { path: "AGENTS.md", contents: agentsMarkdown() },
      {
        path: "EDITING.md",
        contents: editingPlaybookMarkdown({
          tierName: offer.name,
          handoffMinutes: simpleSiteScope.handoffMinutes,
          revisionRounds: simpleSiteScope.revisionRounds,
        }),
      },
      { path: "HOSTING.md", contents: hosting },
      { path: "EDITOR.md", contents: editor },
      { path: "scripts/chat-edit.mjs", contents: lightweightEditorScript() },
      { path: "notes.json", contents: notes },
      ...pages,
    ],
    note:
      mode === "queued"
        ? "ANTHROPIC_API_KEY is set. The model was not called during checkout. Run `pnpm deliver <orderId> --rebuild` locally, or follow the commands in the handoff README."
        : "ANTHROPIC_API_KEY is not set. The handoff is a content snapshot plus hosting and editor instructions. A visual rebuild stays manual.",
  };
}

export async function materializeDelivery(packet: DeliveryPacket, dir: string): Promise<string> {
  const root = path.resolve(dir);
  await mkdir(root, { recursive: true });
  for (const file of packet.repoFiles) {
    const target = path.resolve(root, file.path);
    if (target !== root && !target.startsWith(root + path.sep)) continue;
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, file.contents, "utf8");
  }
  return dir;
}

export function deliveryDirFor(orderId: string): string {
  return path.join(process.cwd(), "out", "orders", orderId);
}
