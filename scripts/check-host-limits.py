#!/usr/bin/env python3
"""Fail when homepage-critical text assets exceed small-host trunc limit (32KB).

Usage:
  python3 scripts/check-host-limits.py
  npm run check:host-limits
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HARD = 32768
SOFT = 28672

# Must stay under HARD so File Manager / flaky FTP cannot truncate homepage.
HOMEPAGE_CRITICAL = [
    "index.html",
    "css/tokens.css",
    "css/reset.css",
    "css/base.css",
    "css/home.css",
    "css/home-sections.css",
    "css/home-responsive.css",
    "css/home-motion.css",
    "js/projects-index.js",
    "js/articles-index.js",
    "js/studio-info.js",
    "js/analytics.js",
    "js/service-fit.js",
    "js/motion.js",
    "js/home.js",
    "js/studio-chrome.js",
    "js/main.js",
]

# Still shipped; warn if over HARD (upload via SFTP binary only).
LARGE_OK_WARN = [
    "js/projects-data.js",
    "js/articles-data.js",
]


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []

    print(f"Small-host limits: hard={HARD} soft={SOFT}\n")

    for rel in HOMEPAGE_CRITICAL:
        path = ROOT / rel
        if not path.is_file():
            errors.append(f"missing: {rel}")
            print(f"FAIL  missing {rel}")
            continue
        size = path.stat().st_size
        if size >= HARD:
            errors.append(f"{rel}: {size} >= {HARD} (trunc risk)")
            print(f"FAIL  {rel}: {size} bytes (>= {HARD})")
        elif size >= SOFT:
            warnings.append(f"{rel}: {size} near limit ({HARD})")
            print(f"WARN  {rel}: {size} bytes (soft {SOFT})")
        else:
            print(f"OK    {rel}: {size} bytes")

    print()
    for rel in LARGE_OK_WARN:
        path = ROOT / rel
        if not path.is_file():
            continue
        size = path.stat().st_size
        if size >= HARD:
            warnings.append(
                f"{rel}: {size} bytes — upload SFTP/FTP binary only (not File Manager)"
            )
            print(f"WARN  {rel}: {size} bytes (binary upload only)")
        else:
            print(f"OK    {rel}: {size} bytes")

    print()
    print(f"{'✓' if not warnings else '⚠'} {len(warnings)} warnings")
    print(f"{'✓' if not errors else '✗'} {len(errors)} errors")
    for item in errors:
        print(f"ERROR: {item}")
    for item in warnings:
        print(f"WARN: {item}")

    if errors:
        print(
            "\nShrink homepage-critical assets under 32KB "
            "(small-host File Manager truncates at 32768)."
        )
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
