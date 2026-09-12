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


def js_top_slugs(path: Path) -> list[str]:
    """Parse top-level `slug: 'x',` lines from a JS data file."""
    if not path.exists():
        return []
    text = path.read_text(encoding="utf-8")
    seen: set[str] = set()
    out: list[str] = []
    for match in re.finditer(r"^\s+slug:\s*'([a-z0-9-]+)',\s*$", text, re.M):
        slug = match.group(1)
        if slug in seen:
            continue
        seen.add(slug)
        out.append(slug)
    return out


def article_slugs() -> list[str]:
    text = (ROOT / "js/articles-data.js").read_text(encoding="utf-8")
    seen: set[str] = set()
    out: list[str] = []
    # Top-level article entries use 4-space indent; related links are deeper.
    for match in re.finditer(r'^    "slug":\s*"([a-z0-9-]+)"', text, re.M):
        slug = match.group(1)
        if slug in seen:
            continue
        seen.add(slug)
        out.append(slug)
    return out


def main() -> None:
    folder_projects = sorted(p.name for p in (ROOT / "project").iterdir() if p.is_dir())
    folder_services = sorted(p.name for p in (ROOT / "service").iterdir() if p.is_dir())
    data_projects = js_top_slugs(ROOT / "js/projects-data.js")
    data_services = js_top_slugs(ROOT / "js/services-data.js")
    articles = article_slugs()

    for slug in sorted(set(folder_projects) - set(data_projects)):
        print(f"WARN: project folder without data entry: {slug}")
    for slug in sorted(set(data_projects) - set(folder_projects)):
        print(f"WARN: projects-data slug without folder: {slug}")
    for slug in sorted(set(folder_services) - set(data_services)):
        print(f"WARN: service folder without data entry: {slug}")
    for slug in sorted(set(data_services) - set(folder_services)):
        print(f"WARN: services-data slug without folder: {slug}")

    projects = sorted(set(folder_projects) & set(data_projects)) or folder_projects
    services = sorted(set(folder_services) & set(data_services)) or folder_services

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

    seen: set[str] = set()
    unique_urls: list[str] = []
    for url in urls:
        if url in seen:
            continue
        seen.add(url)
        unique_urls.append(url)

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for url in unique_urls:
        lines.append("  <url>")
        lines.append(f"    <loc>{url}</loc>")
        lines.append("  </url>")
    lines.append("</urlset>")
    lines.append("")

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {OUT} ({len(unique_urls)} URLs)")
    print(f"  projects={len(projects)} services={len(services)} articles={len(articles)}")


if __name__ == "__main__":
    main()
