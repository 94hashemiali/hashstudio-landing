#!/usr/bin/env python3
"""Generate static service detail pages from js/services-data.js.

Usage:
  python3 scripts/build-services.py
  npm run build:services
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from render_services import generate_services  # noqa: E402


def export_site_data() -> Path:
    cache = ROOT / ".cache" / "site-data.json"
    result = subprocess.run(
        ["node", str(ROOT / "scripts" / "export-site-data.js")],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(
            "export-site-data.js failed:\n"
            f"{result.stdout}\n{result.stderr}".strip()
        )
    if result.stdout.strip():
        print(result.stdout.strip())
    if not cache.is_file():
        raise RuntimeError(f"Missing site data export: {cache}")
    return cache


def main() -> int:
    try:
        site_data = json.loads(export_site_data().read_text(encoding="utf-8"))
    except Exception as exc:  # noqa: BLE001
        print(f"BUILD FAILED — site data export: {exc}")
        return 1

    expected = len(site_data.get("services") or [])
    if expected == 0:
        print("BUILD FAILED — zero services in export")
        return 1

    try:
        count = generate_services(site_data, ROOT)
    except Exception as exc:  # noqa: BLE001
        print(f"BUILD FAILED — service generation: {exc}")
        return 1

    if count != expected:
        print(f"BUILD FAILED — wrote {count} pages, expected {expected}")
        return 1

    print(f"Generated {count} service pages → service/<slug>/index.html")
    return 0


if __name__ == "__main__":
    sys.exit(main())
