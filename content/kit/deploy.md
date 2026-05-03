---
title: "Deploy Guide"
slug: "deploy"
description: "Push your Next.js site live on a free host in 10 minutes. Cloudflare Pages, Vercel, Netlify, or GitHub Pages. Plus DNS cutover."
order: 3
icon: "03"
estimatedMinutes: 15
---

# Deploy Guide

Pick one of the four hosts below. **Cloudflare Pages** is our default recommendation. All four are free for any small-business site. The instructions are step by step.

After you deploy, scroll down to **Custom Domain** to point your real domain at your new site.

---

## Cloudflare Pages (recommended)

Free tier: unlimited bandwidth, 500 builds/month, 100k function invocations/day. No card.

### 1. Push your code to GitHub

If you don't have a GitHub account, sign up at github.com (free). Then in your project folder:

```bash
git init
git add -A
git commit -m "Initial commit"
gh repo create my-site --public --source=. --push
```

(That last line uses GitHub's CLI. If you don't have it, install with `brew install gh` on Mac, or use the GitHub website to manually create a new repo and follow the "push existing code" instructions.)

### 2. Connect Cloudflare Pages to the repo

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com). Sign in (or sign up — free, no card).
2. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Authorize Cloudflare to read your GitHub.
4. Pick your `my-site` repo.

### 3. Build settings

| Setting | Value |
|---|---|
| Framework preset | Next.js (Static HTML Export) |
| Build command | `npm run build` |
| Build output directory | `.next` |
| Root directory | (blank) |
| Node version | 20 |

If your site has API routes (forms, etc.), Cloudflare needs the OpenNext adapter. Add this to your `package.json` scripts:

```json
"build": "next build && @cloudflare/next-on-pages"
```

And add `@cloudflare/next-on-pages` to dev dependencies. The AI can do this for you. Just run **Prompt: Cloudflare Pages config**.

### 4. Deploy

Click **Save and Deploy**. First build takes ~2 minutes. Cloudflare gives you a `your-site.pages.dev` URL.

---

## Vercel

Free tier: 100GB bandwidth/month, 100 builds/day. Native Next.js support. Slightly stricter than Cloudflare but zero config.

### 1. Push to GitHub (same as above)

### 2. Connect Vercel

1. Go to [vercel.com/new](https://vercel.com/new). Sign in with GitHub.
2. Import your `my-site` repo.
3. Vercel auto-detects Next.js. Don't change anything.
4. Click **Deploy**.

90 seconds later, you have a `your-site.vercel.app` URL.

---

## Netlify

Free tier: 100GB bandwidth/month, 300 build minutes/month. Works fine for static-mostly sites.

### 1. Push to GitHub

### 2. Connect Netlify

1. [app.netlify.com/start](https://app.netlify.com/start) → "Import from GitHub".
2. Pick your `my-site` repo.
3. Build command: `npm run build`. Publish directory: `out` (with `output: "export"` in `next.config.mjs`) or `.next` (with the Netlify Next.js plugin auto-installed).
4. Click **Deploy site**.

Netlify Next.js plugin handles dynamic routes via Netlify Functions. If you have API routes, this is automatic.

---

## GitHub Pages

Free, but only supports fully static sites (no API routes, no on-demand rendering). If your site has a contact form or any dynamic logic, use one of the other three hosts.

### 1. Configure for static export

Add to your `next.config.mjs`:

```js
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath: "",
  trailingSlash: true,
};
export default nextConfig;
```

### 2. Build

```bash
npm run build
```

This creates an `out/` folder with static HTML.

### 3. Push the `out/` folder to a `gh-pages` branch

Easiest way: install `gh-pages`:

```bash
npm install -D gh-pages
```

Add to `package.json` scripts:

```json
"deploy": "next build && gh-pages -d out"
```

Run `npm run deploy`. GitHub Pages serves it at `your-username.github.io/my-site`.

---

## Custom Domain

Wherever you deployed, the steps are similar. Below is the exact flow for Cloudflare Pages. Vercel/Netlify/GitHub Pages have analogous UI.

### 1. Add the domain to your host

In Cloudflare Pages → your project → **Custom domains** → **Set up a custom domain** → enter `yourdomain.com`. Click through.

### 2. Update DNS at your registrar

Your registrar is wherever you bought your domain (Namecheap, GoDaddy, Google Domains, Cloudflare Registrar, etc.).

Cloudflare Pages will tell you the records to add. Typically:

| Type | Name | Value |
|---|---|---|
| `A` | `@` | The IP Cloudflare gives you |
| `CNAME` | `www` | `your-site.pages.dev` |

If your domain is registered through Cloudflare itself, the DNS records get added automatically. If through someone else, log into their dashboard, find the DNS settings, add those two records.

### 3. Wait for DNS to propagate (5–30 minutes)

Refresh `yourdomain.com` in your browser. When it loads your new site, you're done. Cloudflare auto-issues a free SSL certificate.

### 4. Set up redirects from www to apex (or apex to www, your call)

In Cloudflare Pages, the apex domain becomes canonical. The `www.` version 308-redirects to it automatically.

---

## After deploying

A few things to set up that take 5 minutes each but matter:

### Submit sitemap to Google

[search.google.com/search-console](https://search.google.com/search-console) → Add property → enter your domain → verify ownership (Cloudflare's DNS verification is the fastest path) → **Sitemaps** → submit `https://yourdomain.com/sitemap.xml`.

This tells Google where every page lives. Without it, you might lose 1–2 weeks of search traffic during the cutover.

### Set up redirects from your old URLs

If your old URLs were like `oldsite.com/about` and your new ones are `yourdomain.com/about`, Google will reindex automatically. But if URLs changed structure, you need 301s. **Prompt 7** in the prompts kit generates them.

### Cancel the old hosting subscription

Go to your Webflow / Framer / Wix / Squarespace billing page. Cancel. The moment you do, the math of the migration is locked in.

---

## When something breaks

The most common problem: a build error. Read the error log carefully. Usually it's a missing dependency or a typo. Paste the error into your AI and ask it to fix.

The second most common: DNS not propagating. Wait 30 minutes. Use [whatsmydns.net](https://whatsmydns.net) to check propagation worldwide.

If you get truly stuck and you're an Express customer, email hi@ejectfrom.com. We respond within 24 hours. For Concierge customers, your dedicated thread is open the whole time.
