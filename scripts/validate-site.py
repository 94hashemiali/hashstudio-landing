#!/usr/bin/env python3
"""Lightweight site QA for Hash Studio static pages.

Checks:
  - missing title / meta description / canonical / H1
  - duplicate canonical URLs
  - invalid project/service slug folders
  - broken internal href targets (basic)
  - images missing width/height attributes (warn)
  - query canonicals on project pages

Usage:
  python3 scripts/validate-site.py
"""

from __future__ import annotations

import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)
DESC_RE = re.compile(
    r'<meta\s+[^>]*name=["\']description["\'][^>]*content=["\'](.*?)["\']',
    re.I | re.S,
)
DESC_RE2 = re.compile(
    r'<meta\s+[^>]*content=["\'](.*?)["\'][^>]*name=["\']description["\']',
    re.I | re.S,
)
CANON_RE = re.compile(
    r'<link\s+[^>]*rel=["\']canonical["\'][^>]*href=["\'](.*?)["\']',
    re.I | re.S,
)
CANON_RE2 = re.compile(
    r'<link\s+[^>]*href=["\'](.*?)["\'][^>]*rel=["\']canonical["\']',
    re.I | re.S,
)
H1_RE = re.compile(r"<h1\b", re.I)
HREF_RE = re.compile(r'\bhref=["\']([^"\'#]+)["\']', re.I)
IMG_RE = re.compile(r"<img\b[^>]*>", re.I)
WIDTH_RE = re.compile(r"\bwidth=", re.I)
HEIGHT_RE = re.compile(r"\bheight=", re.I)
SLUG_RE = re.compile(r"^[a-z0-9-]+$")


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def meta_desc(html: str) -> str | None:
    m = DESC_RE.search(html) or DESC_RE2.search(html)
    return m.group(1).strip() if m else None


def canonical(html: str) -> str | None:
    m = CANON_RE.search(html) or CANON_RE2.search(html)
    return m.group(1).strip() if m else None


def title(html: str) -> str | None:
    m = TITLE_RE.search(html)
    return re.sub(r"\s+", " ", m.group(1)).strip() if m else None


def resolve_href(page: Path, href: str, has_base_root: bool) -> Path | None:
    if href.startswith(("http://", "https://", "mailto:", "tel:", "data:", "javascript:")):
        return None
    href = href.split("?")[0].split("#")[0]
    if not href:
        return None
    if href.startswith("/"):
        target = ROOT / href.lstrip("/")
    elif has_base_root or not href.startswith("."):
        # Site pages use <base href="/"> so relative assets resolve from root
        target = ROOT / href
    else:
        target = (page.parent / href).resolve()
        try:
            target.relative_to(ROOT)
        except ValueError:
            return None
    if target.is_dir():
        index = target / "index.html"
        return index if index.exists() else target
    return target


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []
    canon_map: dict[str, list[str]] = defaultdict(list)

    project_dirs = [p for p in (ROOT / "project").iterdir() if p.is_dir()]
    service_dirs = [p for p in (ROOT / "service").iterdir() if p.is_dir()]

    for d in project_dirs:
        if not SLUG_RE.match(d.name):
            errors.append(f"invalid project slug folder: {d.name}")
        if not (d / "index.html").exists():
            errors.append(f"missing project index: project/{d.name}/index.html")

    for d in service_dirs:
        if not SLUG_RE.match(d.name):
            errors.append(f"invalid service slug folder: {d.name}")
        if not (d / "index.html").exists():
            errors.append(f"missing service index: service/{d.name}/index.html")

    html_files = sorted(ROOT.rglob("*.html"))
    skip_parts = {"node_modules", ".git"}

    for path in html_files:
        if any(part in skip_parts for part in path.parts):
            continue
        rel = str(path.relative_to(ROOT))
        html = read(path)
        has_base_root = bool(re.search(r'<base\s+[^>]*href=["\']/["\']', html, re.I))

        t = title(html)
        if not t:
            errors.append(f"{rel}: missing <title>")

        # Compatibility shells intentionally thin; skip strict SEO on them
        if rel in {"project.html", "service.html"}:
            continue

        d = meta_desc(html)
        if not d and rel != "404.html":
            warnings.append(f"{rel}: missing meta description")

        c = canonical(html)
        if c:
            canon_map[c].append(rel)
            if "project.html?slug=" in c or "service.html?slug=" in c:
                errors.append(f"{rel}: query canonical {c}")
            if rel.startswith("project/") and "/project/" not in c:
                errors.append(f"{rel}: canonical should be /project/{{slug}}/ → {c}")
        elif rel.endswith("index.html") or rel in {
            "index.html",
            "projects.html",
            "services.html",
            "about.html",
            "contact.html",
            "blog.html",
        }:
            if rel != "404.html":
                warnings.append(f"{rel}: missing canonical")

        if not H1_RE.search(html) and rel != "404.html":
            if 'data-field="name"' not in html and 'data-field="title"' not in html:
                warnings.append(f"{rel}: missing H1")

        for href in HREF_RE.findall(html):
            target = resolve_href(path, href, has_base_root)
            if target is None:
                continue
            if not target.exists():
                pretty = ROOT / href.lstrip("/").rstrip("/").split("?")[0]
                if pretty.is_dir() and (pretty / "index.html").exists():
                    continue
                errors.append(f"{rel}: broken link → {href}")

        for img in IMG_RE.findall(html):
            if "src=" not in img.lower():
                continue
            if not WIDTH_RE.search(img) or not HEIGHT_RE.search(img):
                warnings.append(f"{rel}: img missing width/height")

    for c, files in sorted(canon_map.items()):
        if len(files) > 1:
            errors.append(f"duplicate canonical {c}: {', '.join(files)}")

    print(f"Checked {len(html_files)} HTML files")
    print(f"projects={len(project_dirs)} services={len(service_dirs)}")
    print(f"errors={len(errors)} warnings={len(warnings)}")
    for item in errors[:80]:
        print(f"ERROR: {item}")
    if len(errors) > 80:
        print(f"... {len(errors) - 80} more errors")
    for item in warnings[:40]:
        print(f"WARN: {item}")
    if len(warnings) > 40:
        print(f"... {len(warnings) - 40} more warnings")

    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
