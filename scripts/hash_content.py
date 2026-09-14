#!/usr/bin/env python3
"""Shared content loaders for Hash Studio build/validate scripts."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://hashstudio.ir"

SERVICE_LABELS = {
    "product": "طراحی محصول",
    "ui-ux": "طراحی UI/UX",
    "web": "توسعه وب",
    "mobile": "توسعه موبایل",
    "mvp": "راه‌اندازی MVP",
    "ai": "هوش مصنوعی",
    "seo": "سئو و رشد",
    "consulting": "مشاوره محصول",
}


def escape_html(value: Any) -> str:
    return (
        str(value)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def abs_url(path: str) -> str:
    path = str(path or "").lstrip("/")
    return f"{BASE}/{path}" if path else f"{BASE}/"


def article_url(slug: str) -> str:
    return f"{BASE}/article/{slug}/"


def project_url(slug: str) -> str:
    return f"{BASE}/project/{slug}/"


def service_url(slug: str) -> str:
    return f"{BASE}/service/{slug}/"


def solutions_url(slug: str) -> str:
    return f"{BASE}/solutions/{slug}/"


def load_articles() -> dict[str, dict[str, Any]]:
    text = (ROOT / "js/articles-data.js").read_text(encoding="utf-8")
    match = re.search(r"var BY_SLUG = (\{.*?\n\});", text, re.S)
    if not match:
        raise RuntimeError("Could not parse BY_SLUG from js/articles-data.js")
    data = json.loads(match.group(1))
    if not isinstance(data, dict) or not data:
        raise RuntimeError("articles BY_SLUG is empty or invalid")
    return data


def load_article_graph() -> dict[str, dict[str, Any]]:
    text = (ROOT / "js/content-graph.js").read_text(encoding="utf-8")
    block = re.search(r"var ARTICLES = \{(.*?)\n  \};", text, re.S)
    if not block:
        raise RuntimeError("Could not parse ARTICLES from content-graph.js")
    out: dict[str, dict[str, Any]] = {}
    for m in re.finditer(
        r"'([a-z0-9-]+)':\s*\{\s*"
        r"projects:\s*\[([^\]]*)\]\s*,\s*"
        r"services:\s*\[([^\]]*)\]\s*,\s*"
        r"(?:solutions:\s*\[([^\]]*)\]\s*,\s*)?"
        r"ctaTitle:\s*'((?:\\'|[^'])*)'\s*,\s*"
        r"ctaBody:\s*'((?:\\'|[^'])*)'",
        block.group(1),
    ):
        slug, projects, services, solutions, cta_title, cta_body = m.groups()
        out[slug] = {
            "projects": re.findall(r"'([a-z0-9-]+)'", projects),
            "services": re.findall(r"'([a-z0-9-]+)'", services),
            "solutions": re.findall(r"'([a-z0-9-]+)'", solutions or ""),
            "ctaTitle": cta_title.replace("\\'", "'"),
            "ctaBody": cta_body.replace("\\'", "'"),
        }
    if not out:
        raise RuntimeError("Parsed zero ARTICLES entries from content-graph.js")
    return out


def load_solution_labels() -> dict[str, str]:
    text = (ROOT / "js/content-graph.js").read_text(encoding="utf-8")
    block = re.search(r"var SOLUTION_LABELS = \{(.*?)\n  \};", text, re.S)
    if not block:
        return {}
    return {
        m.group(1): m.group(2).replace("\\'", "'")
        for m in re.finditer(
            r"'([a-z0-9-]+)':\s*'((?:\\'|[^'])*)'",
            block.group(1),
        )
    }


def load_topics() -> dict[str, dict[str, Any]]:
    text = (ROOT / "js/content-graph.js").read_text(encoding="utf-8")
    block = re.search(r"var TOPICS = \{(.*?)\n  \};", text, re.S)
    if not block:
        return {}
    out: dict[str, dict[str, Any]] = {}
    for m in re.finditer(
        r"'([a-z0-9-]+)':\s*\{\s*"
        r"label:\s*'((?:\\'|[^'])*)'\s*,\s*"
        r"service:\s*'([a-z0-9-]*)'\s*,\s*"
        r"solution:\s*'([a-z0-9-]*)'\s*,\s*"
        r"articles:\s*\[([^\]]*)\]\s*,\s*"
        r"projects:\s*\[([^\]]*)\]",
        block.group(1),
    ):
        slug, label, service, solution, articles, projects = m.groups()
        out[slug] = {
            "label": label.replace("\\'", "'"),
            "service": service,
            "solution": solution,
            "articles": re.findall(r"'([a-z0-9-]+)'", articles),
            "projects": re.findall(r"'([a-z0-9-]+)'", projects),
        }
    return out


def load_project_cards() -> dict[str, dict[str, str]]:
    """Minimal project fields for article proof cards."""
    text = (ROOT / "js/projects-data.js").read_text(encoding="utf-8")
    out: dict[str, dict[str, str]] = {}
    for m in re.finditer(
        r"\{\s*slug:\s*'([a-z0-9-]+)',\s*"
        r"name:\s*'((?:\\'|[^'])*)',\s*"
        r"title:\s*'((?:\\'|[^'])*)',\s*"
        r"lead:\s*'((?:\\'|[^'])*)',",
        text,
    ):
        slug, name, _title, lead = m.groups()
        # industry / services appear later in object
        blob_start = m.start()
        blob = text[blob_start : blob_start + 2500]
        industry_m = re.search(r"industry:\s*'((?:\\'|[^'])*)'", blob)
        services_m = re.search(r"services:\s*'((?:\\'|[^'])*)'", blob)
        hero = f"assets/images/home/projects/{slug}-shot.webp"
        if slug == "moniaz":
            hero = f"assets/images/home/projects/{slug}-s1.webp"
        out[slug] = {
            "slug": slug,
            "name": name.replace("\\'", "'"),
            "lead": lead.replace("\\'", "'"),
            "industry": (industry_m.group(1).replace("\\'", "'") if industry_m else ""),
            "services": (services_m.group(1).replace("\\'", "'") if services_m else ""),
            "hero": hero,
        }
    return out


def listing_fields(article: dict[str, Any]) -> dict[str, Any]:
    return {
        "slug": article["slug"],
        "tag": article.get("tag", ""),
        "tagFilter": article.get("tagFilter", "all"),
        "title": article.get("title", ""),
        "date": article.get("date", ""),
        "read": article.get("read", ""),
        "hero": article.get("hero", ""),
        "lead": article.get("lead", ""),
    }


def local_asset_path(ref: str) -> Path | None:
    if not ref or ref.startswith(("http://", "https://", "data:", "mailto:")):
        return None
    return ROOT / str(ref).lstrip("/")
