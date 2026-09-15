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

## Project fit (Phase 13)

- Homepage: `#fit` (who we help) → `#service-fit` (one question → recommendation).
- Logic in `js/service-fit.js`. Canonical intents: `idea`, `existing`, `website`, `technical`, `unknown`.
- Labels local to module; proof from `HASH_PROJECTS`. Script order: projects-data → analytics → service-fit → home.
- Lead context stores `intent` + `service_slug` + `recommended_service` + `project_slug` (no PII).
- Contact validates query params, shows hint, may preselect project type; user choice wins.
- Events: `service_fit_started`, `service_fit_selected`, `service_fit_recommendation_viewed`, `service_fit_cta_click`.
- Validator checks HTML intents ↔ FIT_MAP and referenced service/project slugs.

## High-intent proposal pages (Phase 14)

- Data: `js/high-intent-data.js` → generated `/solutions/<slug>/`.
- Build step: `scripts/build-high-intent.py` (also `npm run build:high-intent`).
- Pages are proposal-style, not service clones. Current set: `product-redesign`, `corporate-website`, `mvp-launch`, `fintech-product`.
- Events: `high_intent_page_view`, `high_intent_cta_click`, `high_intent_project_click`.
- Contact CTA: `contact.html?service=<primary>&intent=<solutions-slug>`.
- Soft links from matching service pages; Service Fit guide via `/#service-fit`.

## Lead qualification (Phase 15)

- Contact shows calm context summary from `hashstudio_lead_context` (no slugs/PII).
- Prefills project type; adaptive message prompt; optional budget/timeline helper.
- Service Fit may link a matching `/solutions/<slug>/` without replacing service/project proof.
- Funnel events: `lead_context_applied`, `contact_context_viewed`, `contact_project_type_prefilled`, `contact_form_completed` (plus existing start/email).

## Intentional motion (Phase 17)

- Homepage-only polish: `css/home-motion.css` + `js/motion.js` (vanilla; no GSAP/Framer).
- IO reveal via `[data-hs-reveal]` / `[data-hs-stagger]`; hero load stagger; Service Fit press + result enter; portfolio lift; process sequential; button `:active` press.
- Always honors `prefers-reduced-motion: reduce` (instant show / no parallax). If IO missing, forces visible (no stuck `opacity: 0`).
- Project pages keep existing `.pd-reveal` in `project.js` — do not double-observe.
- Keep `home-motion.css` under 32KB (host trunc risk). Live motion only after `npm run verify:deploy` is green.

## Small-host deploy (Phase 18A)

Cheap shared hosts often **truncate at 32768 bytes** (File Manager / bad FTP ASCII).

| Rule | Detail |
|------|--------|
| Hard limit | Homepage-critical `.html/.css/.js` must be **&lt;32KB** — `npm run check:host-limits` |
| Home data | `js/projects-index.js` (slim). Full `js/projects-data.js` only on `projects.html` / build |
| Pack | `npm run pack:deploy` → `dist-deploy/` (no `desgin/`, no extracted dumps, skip PNG if `.webp` sibling) |
| Upload | **SFTP or FTP binary** — never File Manager for files &gt;20KB |
| Batch order | `index.html` → CSS trio + `home-motion.css` → `js/projects-index.js` + home scripts → webps → (optional) full `projects-data.js` |
| Verify | `npm run verify:deploy` until green |

## Deploy

Run `npm run build` before deploy (includes projects-index + host-limits).
Prefer uploading from `dist-deploy/` after `npm run pack:deploy`.
After host upload, run `npm run verify:deploy`.
