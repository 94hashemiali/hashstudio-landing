#!/usr/bin/env python3
"""Full production build for Hash Studio static site.

Steps:
  1. validate content
  2. generate articles
  3. generate projects
  4. generate services
  5. generate high-intent pages
  6. generate sitemap
  7. validate generated site

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
    run("generate articles", "build-content.py")
    run("generate projects", "build-projects.py")
    print("\n==> generate projects-index", flush=True)
    result = subprocess.run(
        ["node", str(ROOT / "scripts" / "build-projects-index.js")],
        cwd=ROOT,
    )
    if result.returncode != 0:
        print("\nBUILD FAILED at: generate projects-index", flush=True)
        sys.exit(result.returncode)
    print("OK: generate projects-index", flush=True)
    run("generate services", "build-services.py")
    run("generate high-intent pages", "build-high-intent.py")
    run("generate sitemap", "generate-sitemap.py")
    run("validate site", "validate-site.py")
    run("check host limits", "check-host-limits.py")
    print("\n✓ Build succeeded", flush=True)


if __name__ == "__main__":
    main()
