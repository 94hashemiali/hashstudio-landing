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
2. `scripts/build-content.py` → articles + `articles-index.js`
3. `scripts/build-projects.py` → `project/<slug>/index.html` (via Node export of hydrated project data)
4. `scripts/build-services.py` → `service/<slug>/index.html`
5. `scripts/generate-sitemap.py`
6. `scripts/validate-site.py`

Project source of truth: `js/projects-data.js` (do not hand-edit generated project HTML).

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

## Conversion & attribution (Phase 10)

Provider-neutral layer: `js/analytics.js` → `window.HashAnalytics`.

| Concern | Behavior |
|---------|----------|
| Events | `cta_click`, `project_view`, `service_view`, `article_view`, `external_project_click`, form funnel, FAQ, outbound |
| CTA markup | `data-cta` + `data-cta-location` (+ optional slug attrs) |
| Attribution | first/last UTM + referrer + landing path in `localStorage` key `hashstudio_attribution` (`last_page_path` mirrors `last_landing_path`) |
| Lead context | project/service/article path in `sessionStorage`; also inferred from same-origin referrer on `/contact.html` |
| Contact | still `mailto:` — attribution block appended only when useful |
| Privacy | never track name/email/phone/company/message; nested objects dropped |

Connect a provider later:

```js
window.HASH_ANALYTICS_PROVIDER = {
  track: function (event, props) { /* forward */ }
};
```

If no provider is set, tracking is a silent no-op.

## SEO growth (Phase 11)

- Service pages use optional `seo.title` / `seo.description` / `seo.primaryIntent` from `js/services-data.js`.
- Relationships stay in `js/content-graph.js` (service ↔ article ↔ project).
- Internal planning file (not public): `content/seo-roadmap.json`.
- Homepage ships `Organization` + `WebSite` JSON-LD.
- `robots.txt` disallows legacy `project.html` / `service.html` / `article.html`.
- Site validation warns on duplicate titles/descriptions, sitemap gaps, and weak inbound links.

## Positioning & conversion (Phase 12)

- Homepage hierarchy: hero → fit → proof → services → process → principles → credibility → discovery → CTA.
- Service pages: optional `fitFor` / `fitTitle` in `js/services-data.js`.
- Project closing CTA is case-aware; contact copy reduces brief friction.
- CTA `service-fit-selector` maps to `service_fit_selector_click` in `js/analytics.js`.

## Deploy

Run `npm run build` before deploy. Repo root is the static site.
