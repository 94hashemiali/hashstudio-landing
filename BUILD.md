# Build — Hash Studio

Vanilla static site. No framework. Content data → build → real HTML.

## Source of truth

| Content | Source file |
|---------|-------------|
| Articles (full) | `js/articles-data.js` |
| Articles (listing, generated) | `js/articles-index.js` |
| Projects | `js/projects-data.js` |
| Services | `js/services-data.js` |
| Relationships | `js/content-graph.js` |

Edit source data files, then run build. Do **not** hand-edit generated `article/`, `project/`, or `service/` HTML.

## Commands

```bash
npm run build            # validate → export data → generate all pages → sitemap → validate HTML
npm run build:content    # generate articles + projects + services
npm run sitemap
npm run validate         # generated HTML / SEO / canonicals
npm run validate:content # data integrity + relationships
npm run dev              # local server :8765
npm run serve            # static preview :3000
```

## Pipeline

1. `scripts/validate-content.py`
2. `node scripts/export-site-data.js` → `.cache/site-data.json` (hydrated projects/services)
3. `scripts/build-content.py` → articles + projects + services + `articles-index.js`
4. `scripts/generate-sitemap.py`
5. `scripts/validate-site.py`

## Generated output

| Path | Content |
|------|---------|
| `article/<slug>/index.html` | Full article |
| `project/<slug>/index.html` | Full case study |
| `service/<slug>/index.html` | Full service page |
| `js/articles-index.js` | Listing fields only |
| `sitemap.xml` | Canonical URLs only |

## URLs

| Type | Canonical |
|------|-----------|
| Article | `https://hashstudio.ir/article/<slug>/` |
| Project | `https://hashstudio.ir/project/<slug>/` |
| Service | `https://hashstudio.ir/service/<slug>/` |

Legacy query URLs (301 / client fallback):

- `article.html?slug=X` → `/article/X/`
- `project.html?slug=X` → `/project/X/`
- `service.html?slug=X` → `/service/X/`

Platform files: `vercel.json`, `_redirects`, `.htaccess`. Local fallbacks: `article.html`, `project.html`, `service.html`.

## Runtime JS

Detail pages ship progressive enhancement only (`article.js`, `project.js`). They do **not** load full datasets to render primary content.

Listing pages (`projects.html`, `services.html`, `blog.html`, home) still load the data files they need for filters/cards.

## Deploy

Run `npm run build` before deploy. Repo root is the static site.
