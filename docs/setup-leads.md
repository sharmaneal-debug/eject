# Lead capture in Google Sheets (free, 5 minutes)

We log every scan, every intake submission, and every paid customer to a Google Sheet. No service account, no Google Cloud project, no API key — just a sheet plus ~30 lines of Apps Script.

## 1. Create the sheet

1. Go to [sheets.new](https://sheets.new) (creates a new Google Sheet under your account).
2. Rename the file: **Eject — leads**.
3. Create three tabs (rename "Sheet1" then add new sheets):
   - `scans` — every URL someone pastes into the homepage
   - `intake` — every intake-form submission
   - `paid` — every successful Stripe checkout
4. Header rows (paste these as row 1 of each tab):

**`scans`** (row 1):
```
ts	url	hostname	platform	pageCount	monthlyCostEstimate	annualCostEstimate	durationMs	userAgent	referer	source
```

**`intake`** (row 1):
```
ts	name	email	siteUrl	platform	tier	pages	cmsItems	notes	userAgent	referer	source
```

**`paid`** (row 1):
```
ts	tier	siteUrl	email	name	stripeSessionId	amountPaid	currency	kickoffEmailSent	kickoffEmailError	source
```

(Paste each line into row 1 — the columns separate by tab automatically.)

## 2. Paste the Apps Script

1. In the sheet: **Extensions** → **Apps Script**. Opens a script editor in a new tab.
2. Delete the default `function myFunction() {}`.
3. Paste this exactly:

```javascript
// Eject — lead capture endpoint
// One web app, three tabs. Picks tab by `event` field.
//
// To deploy: Deploy → New deployment → Type: Web app
//   Execute as: Me
//   Who has access: Anyone
// Copy the URL it gives you. Paste into Vercel as LEADS_WEBHOOK_URL.

const TAB_BY_EVENT = {
  scan_completed: "scans",
  intake_submitted: "intake",
  checkout_paid: "paid",
  checkout_started: "paid",
  newsletter_signup: "intake",
};

const COLUMNS = {
  scans: ["ts", "url", "hostname", "platform", "pageCount", "monthlyCostEstimate", "annualCostEstimate", "durationMs", "userAgent", "referer", "source"],
  intake: ["ts", "name", "email", "siteUrl", "platform", "tier", "pages", "cmsItems", "notes", "userAgent", "referer", "source"],
  paid: ["ts", "tier", "siteUrl", "email", "name", "stripeSessionId", "amountPaid", "currency", "kickoffEmailSent", "kickoffEmailError", "source"],
};

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    const tabName = TAB_BY_EVENT[payload.event];
    if (!tabName) {
      return jsonResponse({ ok: false, error: "unknown event: " + payload.event });
    }
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tabName);
    if (!sheet) {
      return jsonResponse({ ok: false, error: "missing tab: " + tabName });
    }
    const cols = COLUMNS[tabName];
    const data = payload.data || {};
    const row = cols.map((c) => {
      if (c === "ts") return payload.ts || new Date().toISOString();
      if (c === "source") return payload.source || "";
      return data[c] !== undefined ? data[c] : "";
    });
    sheet.appendRow(row);
    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doGet() {
  return jsonResponse({ ok: true, message: "Eject leads endpoint" });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Save the project (⌘S). Name it **Eject Leads**.

## 3. Deploy as a web app

1. Top-right: **Deploy** → **New deployment**.
2. Click the gear icon (left of "Select type") → choose **Web app**.
3. Settings:
   - Description: `Eject leads v1`
   - Execute as: **Me** (your email)
   - Who has access: **Anyone** (it's an unauthenticated webhook; the URL is the secret)
4. Click **Deploy**. Google will ask you to authorize. Click through. The first time, Google warns "Google hasn't verified this app" — click **Advanced** → **Go to Eject Leads (unsafe)** (it's your own script, this warning is generic).
5. Copy the **Web app URL** — looks like `https://script.google.com/macros/s/AKfycb…/exec`.

## 4. Paste into Vercel

In Vercel project → **Settings** → **Environment Variables**:

```
LEADS_WEBHOOK_URL=https://script.google.com/macros/s/AKfycb…/exec
```

Tick all three environments (Production, Preview, Development). Redeploy.

## 5. Test

After redeploy, do any of these on the live site:
- Paste a URL into the homepage scanner → should add a row to `scans`
- Fill the intake form → should add a row to `intake`
- Run a Stripe test checkout → should add a row to `paid`

Latency: ~1–2 seconds per row. The Apps Script web app is rate-limited by Google to ~6 requests per second per script. Plenty of headroom for our volume.

## 6. (Optional) Slack notifications

If you want a Slack ping every time someone pays, add this to the bottom of the Apps Script:

```javascript
function notifySlack(message) {
  const url = PropertiesService.getScriptProperties().getProperty("SLACK_WEBHOOK_URL");
  if (!url) return;
  UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ text: message }),
  });
}
```

Then in `doPost`, after the `appendRow`:

```javascript
if (payload.event === "checkout_paid") {
  notifySlack(`💰 ${data.tier} ($${data.amountPaid}) — ${data.email} — ${data.siteUrl}`);
}
```

In Apps Script: **Project Settings** → **Script Properties** → add `SLACK_WEBHOOK_URL` with your Slack incoming webhook URL.

## What we capture per row

- **scans** — every homepage URL paste, including platform detected, estimated cost, page count
- **intake** — every form fill on `/migrate`
- **paid** — every successful Stripe checkout, including session ID for reconciliation

You can filter / sort / pivot in Sheets to track conversion: scans → intake → paid. Day 1 KPI: scan-to-paid conversion rate. If it's < 1%, the funnel needs work; > 5% means the offer is hot.

## Updating the script later

If you redeploy: **Deploy** → **Manage deployments** → pencil icon on the existing one → **New version**. Keeps the same URL.

If you create a brand-new deployment instead, you'll get a new URL and have to update Vercel env again. Always edit the existing one to avoid that.

## Cost

$0/month. Google Apps Script has a free quota of 6 hours of script execution per day per account. Each row write is ~50ms; you'd need to log ~430,000 events per day to hit the cap.
