#!/usr/bin/env node
/**
 * Load Hash Studio JS data files and emit hydrated JSON for the Python builder.
 * Usage: node scripts/export-site-data.mjs [outfile]
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const outPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(ROOT, '.cache', 'site-data.json');

function loadScript(rel, sandbox) {
  const code = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  vm.runInNewContext(code, sandbox, { filename: rel });
}

const sandbox = { window: {}, console };
sandbox.window = sandbox;
sandbox.global = sandbox;
sandbox.this = sandbox;

// articles-data uses `(typeof window !== 'undefined' ? window : this)`
loadScript('js/articles-data.js', sandbox);
loadScript('js/projects-data.js', sandbox);
loadScript('js/services-data.js', sandbox);
loadScript('js/content-graph.js', sandbox);

const articles = sandbox.HASH_ARTICLES_BY_SLUG || {};
const projects = sandbox.HASH_PROJECTS || [];
const services = sandbox.HASH_SERVICES || [];
const graph = sandbox.HASH_CONTENT_GRAPH || {};

const articleIndex = {};
for (const [slug, a] of Object.entries(articles)) {
  articleIndex[slug] = {
    slug: a.slug,
    tag: a.tag || '',
    tagFilter: a.tagFilter || 'all',
    title: a.title || '',
    date: a.date || '',
    read: a.read || '',
    hero: a.hero || '',
    lead: a.lead || ''
  };
}

const payload = {
  articles: articleIndex,
  projects,
  services,
  graph: {
    articles: {},
    projects: {},
    services: {},
    topics: graph.topics || {},
    serviceLabels: graph.serviceLabels || {},
    solutionLabels: graph.solutionLabels || {}
  }
};

// Flatten graph via public API
for (const slug of Object.keys(articles)) {
  payload.graph.articles[slug] = graph.articleRel
    ? graph.articleRel(slug)
    : { projects: [], services: [], solutions: [], ctaTitle: '', ctaBody: '' };
}
for (const p of projects) {
  payload.graph.projects[p.slug] = graph.projectRel
    ? graph.projectRel(p.slug)
    : { articles: [], solutions: [] };
}
for (const s of services) {
  payload.graph.services[s.slug] = graph.serviceRel
    ? graph.serviceRel(s.slug)
    : { articles: [], solutions: [] };
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(payload), 'utf8');
process.stdout.write(
  `Exported ${projects.length} projects, ${services.length} services, ${Object.keys(articles).length} articles → ${path.relative(ROOT, outPath)}\n`
);
