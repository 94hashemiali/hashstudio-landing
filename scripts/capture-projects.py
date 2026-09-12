#!/usr/bin/env python3
"""Capture above-the-fold screenshots and build layout skeletons."""
from __future__ import annotations

import subprocess
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets/images/home/projects"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PROFILE = Path(tempfile.gettempdir()) / "hashstudio-chrome-shots"

SITES = [
    ("zarafe", "https://zarafe.com/"),
    ("khosravani", "https://khosravani.com/"),
    ("moniaz", "https://moniaz.ir/"),
    ("shogir", "https://shogir.ir/"),
    ("vanilly", "https://vanilly.ir/"),
    ("pandoraland", "https://pandoraland.ir/"),
    ("madanicamp", "https://madanicamp.com/"),
    ("zivanplus", "https://zivanplus.com/"),
    ("golding", "https://golding.gold/"),
    ("zeissqom", "https://zeissqom.ir/"),
    ("tfec", "https://tfec.ir/home"),
    ("azinpart", "https://azinpart.ir/"),
    ("abryadak", "https://abryadak.com/"),
    ("shefaei", "https://shefaei.com/"),
    ("visionsam", "https://visionsam.com/"),
    ("dgservice", "https://dgservice.center/used"),
    ("crafty", "https://crafty.ir/"),
]

W, H = 1280, 720
SKEL_W, SKEL_H = 844, 440
COLS, ROWS = 28, 16


def capture(url: str, dest: Path) -> bool:
    raw = dest.with_suffix(".raw.png")
    cmd = [
        CHROME,
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-extensions",
        f"--user-data-dir={PROFILE}",
        "--window-size=1440,900",
        "--force-device-scale-factor=1",
        "--virtual-time-budget=10000",
        f"--screenshot={raw}",
        url,
    ]
    try:
        subprocess.run(cmd, check=True, timeout=45, capture_output=True)
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
        print("FAIL capture", url, exc)
        return False
    if not raw.exists():
        print("FAIL missing", url)
        return False
    im = Image.open(raw).convert("RGB")
    # crop above-the-fold, ignore any extra chrome
    cw, ch = im.size
    crop_h = min(ch, int(cw * 9 / 16))
    im = im.crop((0, 0, cw, crop_h)).resize((W, H), Image.Resampling.LANCZOS)
    im.save(dest, "WEBP", quality=82, method=6)
    raw.unlink(missing_ok=True)
    print("SHOT", dest.name, im.size)
    return True


def merge_cells(mask: list[list[bool]]) -> list[tuple[int, int, int, int]]:
    rows, cols = len(mask), len(mask[0])
    used = [[False] * cols for _ in range(rows)]
    rects = []
    for y in range(rows):
        for x in range(cols):
            if not mask[y][x] or used[y][x]:
                continue
            max_x = x
            while max_x + 1 < cols and mask[y][max_x + 1] and not used[y][max_x + 1]:
                max_x += 1
            max_y = y
            grow = True
            while grow and max_y + 1 < rows:
                if all(mask[max_y + 1][xx] and not used[max_y + 1][xx] for xx in range(x, max_x + 1)):
                    max_y += 1
                else:
                    grow = False
            for yy in range(y, max_y + 1):
                for xx in range(x, max_x + 1):
                    used[yy][xx] = True
            rects.append((x, y, max_x - x + 1, max_y - y + 1))
    return rects


def skeleton_from(shot: Path, dest: Path) -> None:
    im = Image.open(shot).convert("RGB").resize((SKEL_W, SKEL_H), Image.Resampling.LANCZOS)
    small = im.resize((COLS, ROWS), Image.Resampling.BOX)
    pixels = list(small.getdata())

    def lum(p):
        return 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]

    border = (
        [pixels[x] for x in range(COLS)]
        + [pixels[(ROWS - 1) * COLS + x] for x in range(COLS)]
        + [pixels[y * COLS] for y in range(ROWS)]
        + [pixels[y * COLS + COLS - 1] for y in range(ROWS)]
    )
    bg = sorted(lum(p) for p in border)[len(border) // 2]
    mask = []
    for y in range(ROWS):
        row = []
        for x in range(COLS):
            row.append(abs(lum(pixels[y * COLS + x]) - bg) > 16)
        mask.append(row)

    # always keep a header strip so it reads as a page
    for x in range(COLS):
        mask[0][x] = True
        mask[1][x] = True

    rects = merge_cells(mask)
    cell_w = SKEL_W / COLS
    cell_h = SKEL_H / ROWS
    pad = 3
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{SKEL_W}" height="{SKEL_H}" viewBox="0 0 {SKEL_W} {SKEL_H}" fill="none">',
        f'<rect width="{SKEL_W}" height="{SKEL_H}" rx="18" fill="#F3EEE6"/>',
        '<rect x="12" y="12" width="820" height="22" rx="8" fill="#E6E0D6"/>',
        '<circle cx="28" cy="23" r="4" fill="#D9D2C7"/>',
        '<circle cx="42" cy="23" r="4" fill="#D9D2C7"/>',
        '<circle cx="56" cy="23" r="4" fill="#D9D2C7"/>',
    ]
    for x, y, w, h in rects:
        rx = 12 + x * cell_w + pad
        ry = 12 + y * cell_h + pad + (18 if y == 0 else 0)
        rw = w * cell_w - pad * 2
        rh = h * cell_h - pad * 2
        if y == 0:
            rh = max(14, h * cell_h - 4)
            ry = 40
        if rw < 8 or rh < 8:
            continue
        radius = 10 if min(rw, rh) > 28 else 6
        fill = "#DDD6CB" if y <= 1 else "#E4DDD2"
        parts.append(
            f'<rect x="{rx:.1f}" y="{ry:.1f}" width="{rw:.1f}" height="{rh:.1f}" rx="{radius}" fill="{fill}"/>'
        )
    parts.append("</svg>")
    dest.write_text("\n".join(parts), encoding="utf-8")
    print("SKEL", dest.name)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    PROFILE.mkdir(parents=True, exist_ok=True)
    for slug, url in SITES:
        shot = OUT / f"{slug}-shot.webp"
        skel = OUT / f"{slug}-skeleton.svg"
        ok = capture(url, shot)
        if ok:
            skeleton_from(shot, skel)
        else:
            print("SKIP skeleton", slug)


if __name__ == "__main__":
    main()
