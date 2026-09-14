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
    graph_project_slugs: set[str] = set()
    if proj_block:
        for project, arts in re.findall(
            r"['\"]?([a-z0-9-]+)['\"]?:\s*\{\s*articles:\s*\[([^\]]*)\]",
            proj_block.group(1),
        ):
            graph_project_slugs.add(project)
            if project not in project_set:
                errors.append(f"content-graph unknown project: {project}")
            for slug in re.findall(r"['\"]([a-z0-9-]+)['\"]", arts):
                if slug not in article_set:
                    errors.append(f"content-graph project {project} → missing article {slug}")
    for slug in sorted(project_set - graph_project_slugs):
        warnings.append(f"project missing content-graph articles entry: {slug}")

    # service → articles
    svc_block = re.search(r"var SERVICES = \{(.*?)\n  \};", graph_js, re.S)
    if svc_block:
        for service, arts in re.findall(
            r"['\"]?([a-z0-9-]+)['\"]?:\s*\{\s*articles:\s*\[([^\]]*)\]",
            svc_block.group(1),
        ):
            if service not in service_set:
                errors.append(f"content-graph unknown service: {service}")
            for slug in re.findall(r"['\"]([a-z0-9-]+)['\"]", arts):
                if slug not in article_set:
                    errors.append(f"content-graph service {service} → missing article {slug}")

    # solution set from high-intent data (top-level page slugs only)
    hi_js = (ROOT / "js/high-intent-data.js").read_text(encoding="utf-8")
    solution_set = set(re.findall(r"^    slug:\s*'([a-z0-9-]+)',\s*$", hi_js, flags=re.M))
    if not solution_set:
        errors.append("high-intent-data.js: no top-level solution slugs found")
    solution_dirs = {
        d.name for d in (ROOT / "solutions").iterdir() if d.is_dir()
    } if (ROOT / "solutions").is_dir() else set()
    for slug in sorted(solution_set - solution_dirs):
        errors.append(f"solution missing generated page: solutions/{slug}/")
    for slug in sorted(solution_dirs - solution_set):
        errors.append(f"orphan solution folder: solutions/{slug}/")

    # article → solutions
    for article, projects, services, solutions in re.findall(
        r"'([a-z0-9-]+)':\s*\{\s*"
        r"projects:\s*\[([^\]]*)\]\s*,\s*"
        r"services:\s*\[([^\]]*)\]\s*,\s*"
        r"solutions:\s*\[([^\]]*)\]",
        graph_js,
    ):
        if article not in article_set:
            continue
        for slug in re.findall(r"'([a-z0-9-]+)'", solutions):
            if slug not in solution_set:
                errors.append(f"content-graph article {article} → missing solution {slug}")
        seen_p = re.findall(r"'([a-z0-9-]+)'", projects)
        if len(seen_p) != len(set(seen_p)):
            errors.append(f"content-graph article {article}: duplicate project refs")
        seen_s = re.findall(r"'([a-z0-9-]+)'", services)
        if len(seen_s) != len(set(seen_s)):
            errors.append(f"content-graph article {article}: duplicate service refs")
        seen_sol = re.findall(r"'([a-z0-9-]+)'", solutions)
        if len(seen_sol) != len(set(seen_sol)):
            errors.append(f"content-graph article {article}: duplicate solution refs")

    # project → solutions
    if proj_block:
        for project, arts, solutions in re.findall(
            r"['\"]?([a-z0-9-]+)['\"]?:\s*\{\s*"
            r"articles:\s*\[([^\]]*)\]\s*,\s*"
            r"solutions:\s*\[([^\]]*)\]",
            proj_block.group(1),
        ):
            for slug in re.findall(r"['\"]([a-z0-9-]+)['\"]", solutions):
                if slug not in solution_set:
                    errors.append(f"content-graph project {project} → missing solution {slug}")

    # service → solutions
    if svc_block:
        for service, arts, solutions in re.findall(
            r"['\"]?([a-z0-9-]+)['\"]?:\s*\{\s*"
            r"articles:\s*\[([^\]]*)\]\s*,\s*"
            r"solutions:\s*\[([^\]]*)\]",
            svc_block.group(1),
        ):
            for slug in re.findall(r"['\"]([a-z0-9-]+)['\"]", solutions):
                if slug not in solution_set:
                    errors.append(f"content-graph service {service} → missing solution {slug}")

    # TOPICS integrity (internal cluster layer — no /topics/ pages)
    topics_block = re.search(r"var TOPICS = \{(.*?)\n  \};", graph_js, re.S)
    if not topics_block:
        errors.append("content-graph missing TOPICS cluster map")
    else:
        topic_entries = list(
            re.finditer(
                r"'([a-z0-9-]+)':\s*\{\s*"
                r"label:\s*'((?:\\'|[^'])*)'\s*,\s*"
                r"service:\s*'([a-z0-9-]*)'\s*,\s*"
                r"solution:\s*'([a-z0-9-]*)'\s*,\s*"
                r"articles:\s*\[([^\]]*)\]\s*,\s*"
                r"projects:\s*\[([^\]]*)\]",
                topics_block.group(1),
            )
        )
        if not topic_entries:
            errors.append("content-graph TOPICS parsed empty")
        for m in topic_entries:
            topic, _label, service, solution, articles, projects = m.groups()
            if service and service not in service_set:
                errors.append(f"topic {topic}: unknown service {service}")
            if solution and solution not in solution_set:
                errors.append(f"topic {topic}: unknown solution {solution}")
            art_list = re.findall(r"'([a-z0-9-]+)'", articles)
            proj_list = re.findall(r"'([a-z0-9-]+)'", projects)
            if len(art_list) != len(set(art_list)):
                errors.append(f"topic {topic}: duplicate article refs")
            if len(proj_list) != len(set(proj_list)):
                errors.append(f"topic {topic}: duplicate project refs")
            for slug in art_list:
                if slug not in article_set:
                    errors.append(f"topic {topic}: missing article {slug}")
            for slug in proj_list:
                if slug not in project_set:
                    errors.append(f"topic {topic}: missing project {slug}")
            if len(art_list) < 2:
                warnings.append(f"topic {topic}: thin article cluster ({len(art_list)})")
            if len(proj_list) < 2:
                warnings.append(f"topic {topic}: thin project cluster ({len(proj_list)})")

    # service seo fields
    for slug in sorted(service_set):
        # crude check: seo block near slug in services-data
        pass
    services_js = (ROOT / "js/services-data.js").read_text(encoding="utf-8")
    for slug in sorted(service_set):
        if f"slug: '{slug}'" not in services_js and f'slug: "{slug}"' not in services_js:
            continue
        # find seo after this slug
        m = re.search(
            rf"slug:\s*['\"]{re.escape(slug)}['\"][\s\S]{{0,400}}?seo:\s*\{{",
            services_js,
        )
        if not m:
            warnings.append(f"service {slug}: missing seo {{ title, description, primaryIntent }}")

    mark = "✓" if not errors else "✗"
    print(f"✓ {len(project_set)} projects validated")
    print(f"✓ {len(service_set)} services validated")
    print(f"✓ {len(article_set)} articles validated")
    print(f"✓ {len(solution_set)} solutions validated")
    print(f"{mark} {len(errors)} broken relationships / field errors")
    print(f"{'✓' if not warnings else '⚠'} {len(warnings)} warnings")
    for item in errors[:60]:
        print(f"ERROR: {item}")
    for item in warnings[:20]:
        print(f"WARN: {item}")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
