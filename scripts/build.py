#!/usr/bin/env python3
"""Full production build for Hash Studio static site.

Steps:
  1. validate content (relationships + required fields)
  2. generate static article pages + articles-index.js
  3. generate sitemap.xml
  4. validate generated HTML / SEO / assets

Usage:
  python3 scripts/build.py
  npm run build
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def run(label: str, script: str) -> None:
    print(f"\n==> {label}", flush=True)
    result = subprocess.run(
        [sys.executable, "-u", str(ROOT / "scripts" / script)],
        cwd=ROOT,
    )
    if result.returncode != 0:
        print(f"\nBUILD FAILED at: {label}", flush=True)
        sys.exit(result.returncode)
    print(f"OK: {label}", flush=True)


def main() -> None:
    print("Hash Studio build", flush=True)
    run("validate content", "validate-content.py")
    run("generate static content (articles/projects/services)", "build-content.py")
    run("generate sitemap", "generate-sitemap.py")
    run("validate site", "validate-site.py")
    print("\n✓ Build succeeded", flush=True)


if __name__ == "__main__":
    main()
