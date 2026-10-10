import { crawlSite } from "../lib/http-crawl";
import { analyzeSnapshot } from "../lib/complexity";

const url = process.argv[2];
if (!url) {
  console.error("usage: tsx scripts/pipeline-score.ts <url>");
  process.exit(2);
}

async function main() {
  const started = Date.now();
  const snapshot = await crawlSite(url);
  const crawledMs = Date.now() - started;
  const report = analyzeSnapshot(snapshot, { tier: "automated", amountUsd: 99 });
  const scoredMs = Date.now() - started - crawledMs;
  console.log(
    JSON.stringify(
      {
        url,
        crawledMs,
        scoredMs,
        eligibility: report.eligibility,
        referral: report.referral,
        reasons: report.reasons,
        platform: report.platform,
        platformLabel: report.platformLabel,
        pageCount: report.pageCount,
        crawledPageCount: report.crawledPageCount,
        assetCount: report.assetCount,
        assetBytes: report.assetBytes,
        assetsPullable: report.assetsPullable,
        formCount: report.formCount,
        rebuildEase: report.rebuildEase,
        animationSignals: report.animationSignals,
        migrationHours: report.migration.totalHours,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : "score failed";
  console.error(message);
  process.exit(/couldn't read that website/i.test(message) ? 3 : 1);
});
