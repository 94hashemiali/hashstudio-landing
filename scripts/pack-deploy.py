#!/usr/bin/env python3
"""Build a slim upload tree for small hosts (Phase 18A).

Copies publishable files into dist-deploy/, skipping design sources,
extracted dumps, caches, and PNG siblings when a .webp exists.

Usage:
  python3 scripts/pack-deploy.py
  npm run pack:deploy
"""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dist-deploy"

SKIP_DIR_NAMES = {
    ".git",
    ".cache",
    "node_modules",
    "desgin",
    "design",
    "dist-deploy",
    ".cursor",
    ".idea",
    ".vscode",
    "agent-transcripts",
}

SKIP_SUFFIXES = {".map", ".DS_Store"}

# Path prefixes relative to ROOT to skip entirely
SKIP_PREFIXES = (
    "assets/images/extracted/",
    "desgin/",
)


def should_skip(rel: Path) -> bool:
    parts = set(rel.parts)
    if parts & SKIP_DIR_NAMES:
        return True
    posix = rel.as_posix()
    if any(posix.startswith(p) for p in SKIP_PREFIXES):
        return True
    if rel.suffix in SKIP_SUFFIXES or rel.name == ".DS_Store":
        return True
    # Skip PNG when sibling webp exists (home already references webp)
    if rel.suffix.lower() == ".png":
        webp = rel.with_suffix(".webp")
        if (ROOT / webp).is_file():
            return True
    return False


def main() -> int:
    index_js = ROOT / "js" / "projects-index.js"
    if not index_js.is_file():
        print("ERROR: js/projects-index.js missing — run: npm run build:projects-index")
        return 1

    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    copied = 0
    skipped = 0
    bytes_out = 0

    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        rel = path.relative_to(ROOT)
        if should_skip(rel):
            skipped += 1
            continue
        # Only ship site assets
        if rel.parts[0] in {
            "scripts",
            "content",
            "node_modules",
        }:
            skipped += 1
            continue
        if rel.name in {"package.json", "package-lock.json", "BUILD.md", "README.md"}:
            # Keep BUILD.md for operator; skip npm lock noise
            if rel.name != "BUILD.md":
                skipped += 1
                continue

        dest = OUT / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, dest)
        copied += 1
        bytes_out += dest.stat().st_size

    # Always include BUILD.md playbook
    if (ROOT / "BUILD.md").is_file():
        shutil.copy2(ROOT / "BUILD.md", OUT / "BUILD.md")

    mb = bytes_out / (1024 * 1024)
    print(f"pack:deploy → {OUT}")
    print(f"copied {copied} files ({mb:.1f} MiB), skipped {skipped}")
    print("Upload this folder via SFTP/FTP binary (not File Manager for >20KB files).")
    print("Then: npm run verify:deploy")
    return 0


if __name__ == "__main__":
    sys.exit(main())
