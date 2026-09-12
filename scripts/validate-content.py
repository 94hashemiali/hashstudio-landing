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
    for article, projects in re.findall(
        r"'([a-z0-9-]+)':\s*\{\s*projects:\s*\[([^\]]*)\]",
        graph_js,
    ):
        if article not in article_set:
            errors.append(f"content-graph unknown article: {article}")
        for slug in re.findall(r"'([a-z0-9-]+)'", projects):
            if slug not in project_set:
                errors.append(f"content-graph article {article} → missing project {slug}")

    for article, services in re.findall(
        r"'([a-z0-9-]+)':\s*\{\s*projects:\s*\[[^\]]*\]\s*,\s*services:\s*\[([^\]]*)\]",
        graph_js,
    ):
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

    print(f"articles={len(article_set)} projects={len(project_set)} services={len(service_set)}")
    print(f"errors={len(errors)} warnings={len(warnings)}")
    for item in errors[:60]:
        print(f"ERROR: {item}")
    for item in warnings[:20]:
        print(f"WARN: {item}")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
