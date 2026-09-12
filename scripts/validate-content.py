#!/usr/bin/env python3
"""Validate content graph integrity for Hash Studio.

Checks:
  - duplicate article/project/service slugs
  - content-graph references resolve
  - article related[] article cards resolve
  - required article fields

Usage:
  python3 scripts/validate-content.py
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def js_quoted_slugs(text: str, pattern: str) -> list[str]:
    return re.findall(pattern, text, flags=re.M)


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []

    articles_js = (ROOT / "js/articles-data.js").read_text(encoding="utf-8")
    projects_js = (ROOT / "js/projects-data.js").read_text(encoding="utf-8")
    graph_js = (ROOT / "js/content-graph.js").read_text(encoding="utf-8")

    article_slugs = js_quoted_slugs(articles_js, r'^  "([a-z0-9-]+)": \{')
    article_set = set(article_slugs)
    if len(article_slugs) != len(article_set):
        errors.append("duplicate article slugs in articles-data.js")

    project_slugs = js_quoted_slugs(projects_js, r"^\s+slug:\s*'([a-z0-9-]+)',\s*$")
    project_set = set(project_slugs)
    if len(project_slugs) != len(project_set):
        errors.append("duplicate project slugs in projects-data.js")

    service_set = {p.name for p in (ROOT / "service").iterdir() if p.is_dir()}
    services_js = (ROOT / "js/services-data.js").read_text(encoding="utf-8")
    service_data_slugs = js_quoted_slugs(services_js, r"^\s+slug:\s*'([a-z0-9-]+)',\s*$")
    if len(service_data_slugs) != len(set(service_data_slugs)):
        errors.append("duplicate service slugs in services-data.js")
    for slug in sorted(set(service_data_slugs) - service_set):
        errors.append(f"services-data slug missing folder: service/{slug}/")
    for slug in sorted(service_set - set(service_data_slugs)):
        errors.append(f"service folder missing services-data entry: {slug}")

    # Required project fields (top-level authored)
    for slug in sorted(project_set):
        idx = projects_js.find(f"slug: '{slug}'")
        if idx < 0:
            errors.append(f"project {slug}: not found in projects-data.js")
            continue
        window = projects_js[idx : idx + 1200]
        for needle in ("name:", "title:", "lead:", "industry:", "services:"):
            if needle not in window:
                errors.append(f"project {slug}: missing {needle.rstrip(':')}")

    # Required service fields
    for slug in sorted(set(service_data_slugs)):
        idx = services_js.find(f"slug: '{slug}'")
        if idx < 0:
            errors.append(f"service {slug}: not found in services-data.js")
            continue
        window = services_js[idx : idx + 1500]
        for needle in ("name:", "lead:", "titleLead:", "heroImage:"):
            if needle not in window:
                errors.append(f"service {slug}: missing {needle.rstrip(':')}")

    # Required fields on each article object
    for slug in sorted(article_set):
        # crude presence checks via nearby blob
        blob_match = re.search(
            rf'"{re.escape(slug)}"\s*:\s*\{{(.*?)\n  \}}',
            articles_js,
            re.S,
        )
        if not blob_match:
            warnings.append(f"could not isolate article blob: {slug}")
            continue
        blob = blob_match.group(1)
        for field in ('"title"', '"lead"', '"hero"', '"tagFilter"', '"author"'):
            if field not in blob:
                errors.append(f"article {slug}: missing {field}")

    # Related article cards inside articles
    for match in re.finditer(r'"related"\s*:\s*\[(.*?)\]', articles_js, re.S):
        for slug in re.findall(r'"slug":\s*"([a-z0-9-]+)"', match.group(1)):
            if slug not in article_set:
                errors.append(f"article related[] points to missing article: {slug}")

    # content-graph article → projects/services
    articles_block = re.search(r"var ARTICLES = \{(.*?)\n  \};", graph_js, re.S)
    graph_article_slugs: set[str] = set()
    if articles_block:
        graph_article_slugs = set(
            re.findall(r"'([a-z0-9-]+)':\s*\{", articles_block.group(1))
        )
    for slug in sorted(article_set - graph_article_slugs):
        errors.append(f"article missing content-graph entry: {slug}")
    for slug in sorted(graph_article_slugs - article_set):
        errors.append(f"content-graph unknown article: {slug}")

    for article, projects in re.findall(
        r"'([a-z0-9-]+)':\s*\{\s*projects:\s*\[([^\]]*)\]",
        graph_js,
    ):
        if article not in article_set:
            continue
        for slug in re.findall(r"'([a-z0-9-]+)'", projects):
            if slug not in project_set:
                errors.append(f"content-graph article {article} → missing project {slug}")

    for article, services in re.findall(
        r"'([a-z0-9-]+)':\s*\{\s*projects:\s*\[[^\]]*\]\s*,\s*services:\s*\[([^\]]*)\]",
        graph_js,
    ):
        if article not in article_set:
            continue
        for slug in re.findall(r"'([a-z0-9-]+)'", services):
            if slug not in service_set:
                errors.append(f"content-graph article {article} → missing service {slug}")

    # project → articles
    proj_block = re.search(r"var PROJECTS = \{(.*?)\n  \};", graph_js, re.S)
    if proj_block:
        for project, arts in re.findall(
            r"'([a-z0-9-]+)':\s*\{\s*articles:\s*\[([^\]]*)\]",
            proj_block.group(1),
        ):
            if project not in project_set:
                errors.append(f"content-graph unknown project: {project}")
            for slug in re.findall(r"'([a-z0-9-]+)'", arts):
                if slug not in article_set:
                    errors.append(f"content-graph project {project} → missing article {slug}")

    # service → articles
    svc_block = re.search(r"var SERVICES = \{(.*?)\n  \};", graph_js, re.S)
    if svc_block:
        for service, arts in re.findall(
            r"'([a-z0-9-]+)':\s*\{\s*articles:\s*\[([^\]]*)\]",
            svc_block.group(1),
        ):
            if service not in service_set:
                errors.append(f"content-graph unknown service: {service}")
            for slug in re.findall(r"'([a-z0-9-]+)'", arts):
                if slug not in article_set:
                    errors.append(f"content-graph service {service} → missing article {slug}")

    mark = "✓" if not errors else "✗"
    print(f"✓ {len(project_set)} projects validated")
    print(f"✓ {len(service_set)} services validated")
    print(f"✓ {len(article_set)} articles validated")
    print(f"{mark} {len(errors)} broken relationships / field errors")
    print(f"{'✓' if not warnings else '⚠'} {len(warnings)} warnings")
    for item in errors[:60]:
        print(f"ERROR: {item}")
    for item in warnings[:20]:
        print(f"WARN: {item}")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
