#!/usr/bin/env python3
"""Generate sitemap.xml from project/service folders + article data.

Usage:
  python3 scripts/generate-sitemap.py
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "sitemap.xml"
BASE = "https://hashstudio.ir"


def article_slugs() -> list[str]:
    text = (ROOT / "js/articles-data.js").read_text(encoding="utf-8")
    seen: set[str] = set()
    out: list[str] = []
    for match in re.finditer(r'"slug":\s*"([a-z0-9-]+)"', text):
        slug = match.group(1)
        if slug in seen:
            continue
        seen.add(slug)
        out.append(slug)
    return out


def main() -> None:
    projects = sorted(p.name for p in (ROOT / "project").iterdir() if p.is_dir())
    services = sorted(p.name for p in (ROOT / "service").iterdir() if p.is_dir())
    articles = article_slugs()

    urls = [
        f"{BASE}/",
        f"{BASE}/projects.html",
        f"{BASE}/services.html",
        f"{BASE}/about.html",
        f"{BASE}/blog.html",
        f"{BASE}/contact.html",
    ]
    urls.extend(f"{BASE}/project/{slug}/" for slug in projects)
    urls.extend(f"{BASE}/service/{slug}/" for slug in services)
    urls.extend(f"{BASE}/article.html?slug={slug}" for slug in articles)

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for url in urls:
        lines.append("  <url>")
        lines.append(f"    <loc>{url}</loc>")
        lines.append("  </url>")
    lines.append("</urlset>")
    lines.append("")

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {OUT} ({len(urls)} URLs)")
    print(f"  projects={len(projects)} services={len(services)} articles={len(articles)}")


if __name__ == "__main__":
    main()
