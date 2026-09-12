# Build — Hash Studio

Vanilla static site. No framework. Content data → Python build → real HTML.

## Source of truth

| Data | File |
|------|------|
| Articles (full) | `js/articles-data.js` |
| Article listing (generated) | `js/articles-index.js` |
| Projects | `js/projects-data.js` |
| Services | `js/services-data.js` |
| Relationships / CTAs | `js/content-graph.js` |

Edit **`js/articles-data.js`**, then run build. Do not hand-edit `article/<slug>/index.html` or `js/articles-index.js`.

## Commands

```bash
npm run build          # validate → generate articles → sitemap → validate HTML
npm run build:content  # articles only
npm run sitemap
npm run validate
npm run validate:content
npm run dev            # local server :8765
npm run serve          # static preview :3000
```

## Generated output

- `article/<slug>/index.html` — full article HTML (title, body, TOC, related, OG, JSON-LD)
- `js/articles-index.js` — listing fields only for blog / home / project / service cards
- `sitemap.xml` — canonical URLs only

## URL structure

| Type | Canonical |
|------|-----------|
| Article | `https://hashstudio.ir/article/<slug>/` |
| Project | `https://hashstudio.ir/project/<slug>/` |
| Service | `https://hashstudio.ir/service/<slug>/` |

Legacy query URLs redirect 301:

- `article.html?slug=X` → `/article/X/`
- `project.html?slug=X` → `/project/X/`
- `service.html?slug=X` → `/service/X/`

Redirect files:

- `vercel.json` — Vercel
- `_redirects` — Netlify / Cloudflare Pages
- `.htaccess` — Apache / LiteSpeed
- `article.html` / `project.html` / `service.html` — client fallback for local/dev

## Deploy

Repo root is the static site. Run `npm run build` before deploy so articles + sitemap are current. Host any static provider that serves `index.html` in folders and honors the redirect file for that platform.
