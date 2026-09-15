#!/usr/bin/env python3
"""Compare critical local assets vs live host sizes.

Detects truncated uploads (e.g. Content-Length exactly 32768 / 40960).

Usage:
  python3 scripts/verify-deploy.py
  python3 scripts/verify-deploy.py --base https://hashstudio.ir
  npm run verify:deploy
"""

from __future__ import annotations

import argparse
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_BASE = "https://hashstudio.ir"

# Exact power-of-two sizes often seen when FTP/panel truncates mid-file
TRUNC_HINTS = {16384, 32768, 40960, 49152, 65536}

CRITICAL = [
    "index.html",
    "css/home.css",
    "css/home-sections.css",
    "css/home-responsive.css",
    "css/home-motion.css",
    "css/tokens.css",
    "css/reset.css",
    "css/base.css",
    "css/project.css",
    "css/article.css",
    "css/service-detail.css",
    "js/projects-index.js",
    "js/articles-index.js",
    "js/home.js",
    "js/main.js",
    "js/motion.js",
    "js/service-fit.js",
    "js/analytics.js",
    "js/content-graph.js",
    "js/studio-chrome.js",
    "projects.html",
    "services.html",
    "blog.html",
    "contact.html",
    "about.html",
]

# Large datasets: homepage works without them; warn on mismatch (SFTP binary only)
LARGE_OPTIONAL = [
    "js/projects-data.js",
    "js/articles-data.js",
]


def fetch_size(url: str, timeout: float = 30.0) -> tuple[int | None, str | None]:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "HashStudio-DeployVerify/1.0"},
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = resp.read()
            return len(data), None
    except urllib.error.HTTPError as exc:
        return None, f"HTTP {exc.code}"
    except Exception as exc:  # noqa: BLE001
        return None, str(exc)


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify live deploy file sizes")
    parser.add_argument("--base", default=DEFAULT_BASE, help="Live origin URL")
    parser.add_argument(
        "--tolerance",
        type=int,
        default=0,
        help="Allowed byte under-size vs local (default 0)",
    )
    args = parser.parse_args()
    base = args.base.rstrip("/")

    errors: list[str] = []
    warnings: list[str] = []
    ok = 0
    skipped = 0

    print(f"Verifying deploy against {base}\n")

    # Local trunc-risk preview (small-host)
    print("Local trunc-risk (hard limit 32768):")
    for rel in (
        "index.html",
        "css/home.css",
        "css/home-sections.css",
        "css/home-responsive.css",
        "css/home-motion.css",
        "js/projects-index.js",
        "js/home.js",
        "js/motion.js",
    ):
        lp = ROOT / rel
        if not lp.is_file():
            continue
        sz = lp.stat().st_size
        mark = "OK" if sz < 32768 else "RISK"
        print(f"  {mark:4} {sz:6}  {rel}")
    print()

    for rel in CRITICAL:
        local_path = ROOT / rel
        if not local_path.is_file():
            skipped += 1
            print(f"SKIP  {rel} (not in repo yet)")
            continue

        local_size = local_path.stat().st_size
        url = f"{base}/{rel}"
        live_size, err = fetch_size(url)
        if err or live_size is None:
            errors.append(f"{rel}: fetch failed ({err})")
            print(f"FAIL  {rel}: fetch failed ({err})")
            continue

        if live_size in TRUNC_HINTS and live_size != local_size:
            msg = (
                f"{rel}: live={live_size} local={local_size} "
                f"— looks truncated/stale at {live_size} bytes"
            )
            errors.append(msg)
            print(f"FAIL  {msg}")
            continue

        if live_size < local_size - args.tolerance:
            hint = ""
            if live_size in TRUNC_HINTS and live_size < local_size:
                hint = f" — looks truncated at {live_size} bytes"
            msg = f"{rel}: live={live_size} local={local_size}{hint}"
            errors.append(msg)
            print(f"FAIL  {msg}")
            continue

        if live_size > local_size:
            warnings.append(f"{rel}: live={live_size} larger than local={local_size}")
            print(f"WARN  {rel}: live={live_size} local={local_size}")
        else:
            ok += 1
            print(f"OK    {rel}: {live_size} bytes")

    print("\nLarge optional (warn only — SFTP binary):")
    for rel in LARGE_OPTIONAL:
        local_path = ROOT / rel
        if not local_path.is_file():
            continue
        local_size = local_path.stat().st_size
        url = f"{base}/{rel}"
        live_size, err = fetch_size(url)
        if err or live_size is None:
            warnings.append(f"{rel}: fetch failed ({err})")
            print(f"WARN  {rel}: fetch failed ({err})")
            continue
        if live_size in TRUNC_HINTS and live_size != local_size:
            warnings.append(
                f"{rel}: live={live_size} local={local_size} — trunc/stale; upload binary"
            )
            print(f"WARN  {rel}: live={live_size} local={local_size} (trunc?)")
            continue
        if live_size < local_size - args.tolerance:
            warnings.append(f"{rel}: live={live_size} local={local_size}")
            print(f"WARN  {rel}: live={live_size} local={local_size}")
            continue
        ok += 1
        print(f"OK    {rel}: {live_size} bytes")

    print()
    print(f"✓ {ok} files match")
    if skipped:
        print(f"○ {skipped} skipped (missing locally)")
    print(f"{'✓' if not warnings else '⚠'} {len(warnings)} warnings")
    print(f"{'✓' if not errors else '✗'} {len(errors)} errors")
    for item in errors[:40]:
        print(f"ERROR: {item}")
    for item in warnings[:20]:
        print(f"WARN: {item}")

    if errors:
        print(
            "\nSmall-host tip: File Manager often truncates at 32768 bytes.\n"
            "Re-upload FAIL files via SFTP/FTP **binary** from dist-deploy/ "
            "(npm run pack:deploy), then: npm run verify:deploy"
        )
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
