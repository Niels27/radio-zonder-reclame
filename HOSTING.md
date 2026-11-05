# Radio Zonder Reclame - Hosting & Deployment Guide

## Current Setup

- **Hosting**: GitHub Pages at `https://niels27.github.io/radio-zonder-reclame/`
- **Deploy**: Auto-deploy via `.github/workflows/deploy.yml` on push to `main` (lint + station data validation run first)
- **Stream health**: `.github/workflows/stations-check.yml` checks every stream weekly (see `docs/STATIONS.md`)

---

## Step 1: Choose a Domain Name (~€5-10/year)

### .nl domains
- **Renewal price**: €8-15/year depending on registrar
- SIDN (the .nl registry) base price is €4.25/year, registrars add markup
- Cheapest long-term: [mijn.host](https://mijn.host) (~€5/year), [Vimexx](https://www.vimexx.nl), [TransIP](https://www.transip.nl)
- `radiozonderreclame.nl` is the obvious choice — check availability at [sidn.nl](https://www.sidn.nl)

### Cheaper alternatives if .nl is taken or too expensive
| Domain | Typical price | Example |
|--------|--------------|---------|
| `.nl` | €5-10/year | radiozonderreclame.nl |
| `.site` | €1-3/year | radiozonderreclame.site |
| `.online` | €2-5/year | radiozonderreclame.online |
| `.radio` | ~€15/year | zonderreclame.radio |

**Recommendation**: Go for `radiozonderreclame.nl` — it's professional, memorable, and Dutch users trust `.nl`. At ~€8/year it's well within your budget.

### Where to buy
- **Cloudflare Registrar** (recommended): at-cost pricing, no markup, no upsells. ~€8/year for .nl. You'll be using Cloudflare anyway (see Step 2), so this keeps everything in one place.
- **Alternative**: Buy anywhere, then point nameservers to Cloudflare.

---

## Step 2: Host on Cloudflare Pages (Free)

Cloudflare Pages is the best option for your use case:

| Feature | Free tier |
|---------|-----------|
| Bandwidth | **Unlimited** |
| Requests | **Unlimited** |
| Sites | Unlimited |
| Builds | 500/month |
| Custom domains | 100 per project |
| SSL/HTTPS | Automatic & free |
| Global CDN | 300+ edge locations |
| DDoS protection | Included |

This handles hundreds to thousands of users with zero issues. Even tens of thousands would be fine — it's a static site served from a global CDN.

### Setup Steps

1. **Create Cloudflare account** at [dash.cloudflare.com](https://dash.cloudflare.com)

2. **Connect your GitHub repo**:
   - Go to **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
   - Select `Niels27/radio-zonder-reclame`
   - Build settings:
     - **Build command**: `npm run build`
     - **Build output directory**: `dist`
     - **Node.js version**: 20 (set via environment variable `NODE_VERSION=20`)

3. **Add your custom domain**:
   - In your Pages project → **Custom domains** → **Set up a custom domain**
   - Enter `radiozonderreclame.nl` (or whatever you bought)
   - Cloudflare handles DNS and SSL automatically

4. **Update vite.config.js** — change base path from `/radio-zonder-reclame/` to `/`:
   ```js
   base: '/',
   ```
   This is needed because you'll no longer be in a subdirectory.

5. **Keep GitHub Pages running** as a backup/staging if you want, or disable it.

---

## Step 3: Development → Production Workflow

### Your workflow after setup:

```
Edit code locally
    ↓
npm run dev          (test at http(s)://127.0.0.1:4178/radio-zonder-reclame/)
    ↓
git add + commit
    ↓
git push             (triggers auto-deploy)
    ↓
~1 min later → live at radiozonderreclame.nl
```

### Cloudflare Pages gives you extras for free:

- **Preview deployments**: Every branch/PR gets its own URL (e.g., `fix-bug.radio-zonder-reclame.pages.dev`) so you can test before merging
- **Instant rollback**: One click to roll back to any previous deployment
- **Build logs**: See exactly what happened during build

### Recommended git workflow:

```bash
# Working on a fix
git checkout -b fix/audio-bug
# ... make changes ...
git push -u origin fix/audio-bug
# → Preview deploy at: fix-audio-bug.your-project.pages.dev

# Happy with it? Merge to main
git checkout main
git merge fix/audio-bug
git push
# → Auto-deploys to radiozonderreclame.nl
```

For solo development, pushing straight to `main` is fine too. The preview deploys are just a nice safety net for bigger changes.

---

## Step 4: Analytics & User Metrics (Free)

### Option A: Cloudflare Web Analytics (Recommended — easiest)

Built into Cloudflare, free, privacy-friendly, no cookies, GDPR compliant.

**Setup**: Cloudflare dashboard → your site → **Web Analytics** → Enable → Add the script tag to `index.html`:
```html
<!-- Cloudflare Web Analytics -->
<script defer src='https://static.cloudflareinsights.com/beacon.min.js'
  data-cf-beacon='{"token": "your-token-here"}'></script>
```

**What you get**:
- Page views & unique visitors
- Top pages, referrers, countries
- Device types, browsers, OS
- Core Web Vitals (performance metrics)
- No cookie banner needed

### Option B: Umami (More detailed, still free)

[Umami Cloud](https://umami.is) free tier: 10k events/month, 3 websites. Self-hosted is unlimited and free.

**What you get** (on top of Cloudflare analytics):
- Custom events (e.g., "played station X", "switched to YouTube during ad")
- User sessions and flow
- Real-time dashboard
- UTM campaign tracking

**Setup**: Add a single `<script>` tag to `index.html`, then optionally track custom events:
```js
// Track custom events (optional)
umami.track('station-play', { station: 'NPO Radio 2' });
umami.track('ad-break-switch', { switchTo: 'youtube' });
```

### Recommendation

Start with **Cloudflare Web Analytics** — it's zero config once you're on Cloudflare, gives you the visitor/traffic metrics you need, and has no impact on performance. Add Umami later if you want custom event tracking.

---

## Step 5: Google Indexing

Once your site is live on the custom domain:

1. **Google Search Console**: Go to [search.google.com/search-console](https://search.google.com/search-console), add your domain, verify via Cloudflare DNS
2. **Submit sitemap**: Your site is an SPA so create a simple `public/sitemap.xml`:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>https://radiozonderreclame.nl/</loc>
       <lastmod>2026-02-18</lastmod>
       <priority>1.0</priority>
     </url>
   </urlset>
   ```
3. **Meta tags**: `index.html` already has description/Open Graph tags; add `og:url` with the new domain.
4. **robots.txt** in `public/`:
   ```
   User-agent: *
   Allow: /
   Sitemap: https://radiozonderreclame.nl/sitemap.xml
   ```

---

## Cost Summary

| Item | Cost |
|------|------|
| Domain (`.nl`) | ~€8/year |
| Hosting (Cloudflare Pages) | **Free** |
| SSL/HTTPS | **Free** |
| CDN (global) | **Free** |
| Analytics (Cloudflare) | **Free** |
| DDoS protection | **Free** |
| **Total** | **~€8/year** |

---

## Quick Start Checklist

- [ ] Buy domain at Cloudflare Registrar (or elsewhere + point nameservers)
- [ ] Create Cloudflare Pages project, connect GitHub repo
- [ ] Change `base` in `vite.config.js` from `/radio-zonder-reclame/` to `/`
- [ ] Update `homepage` in `package.json` to new domain
- [ ] Add custom domain in Cloudflare Pages settings
- [ ] Enable Cloudflare Web Analytics
- [ ] Add `og:url` and a sitemap
- [ ] Submit to Google Search Console
- [ ] Push to main → verify live at your domain
