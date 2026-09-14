#!/usr/bin/env python3
"""Generate high-intent /for/<slug>/ pages from js/high-intent-data.js.

Usage:
  python3 scripts/build-high-intent.py
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from render_high_intent import generate_high_intent, load_high_intent_pages  # noqa: E402


def main() -> int:
    try:
        expected = len(load_high_intent_pages())
        count = generate_high_intent(ROOT)
    except Exception as exc:  # noqa: BLE001
        print(f"BUILD FAILED — high-intent generation: {exc}")
        return 1

    if count != expected or count == 0:
        print(f"BUILD FAILED — wrote {count} pages, expected {expected}")
        return 1

    print(f"Generated {count} high-intent pages → for/<slug>/index.html")
    return 0


if __name__ == "__main__":
    sys.exit(main())
