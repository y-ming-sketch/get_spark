#!/usr/bin/env python3
"""
Generate the full Spark icon set from a single SVG-style spec.

Outputs:
  PWA icons:
    public/icons/icon-192.png
    public/icons/icon-384.png
    public/icons/icon-512.png
    public/icons/icon-512-maskable.png
    public/icons/apple-touch-icon.png  (180x180)
    public/icons/favicon-32.png
    public/icons/favicon-16.png

  Tauri icons:
    src-tauri/icons/32x32.png
    src-tauri/icons/128x128.png
    src-tauri/icons/128x128@2x.png
    src-tauri/icons/icon.png            (1024x1024)
    src-tauri/icons/Square30x30Logo.png (Windows store)
    src-tauri/icons/Square44x44Logo.png
    src-tauri/icons/Square71x71Logo.png
    src-tauri/icons/Square89x89Logo.png
    src-tauri/icons/Square107x107Logo.png
    src-tauri/icons/Square142x142Logo.png
    src-tauri/icons/Square150x150Logo.png
    src-tauri/icons/Square284x284Logo.png
    src-tauri/icons/Square310x310Logo.png
    src-tauri/icons/StoreLogo.png       (50x50)
    src-tauri/icons/icon.ico            (multi-res ICO)
    src-tauri/icons/icon.icns           (macOS)

Re-run with:  npm run icons
"""
from __future__ import annotations
import os
import struct
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_ICONS = ROOT / "public" / "icons"
TAURI_ICONS = ROOT / "src-tauri" / "icons"

# Spark brand colors
SPARK_RED = (140, 21, 21, 255)       # Stanford Cardinal #8C1515
CREAM = (250, 249, 245, 255)         # warm bg #FAF9F5

PUBLIC_ICONS.mkdir(parents=True, exist_ok=True)
TAURI_ICONS.mkdir(parents=True, exist_ok=True)


def draw_spark_mark(size: int, bg: tuple, fg: tuple, padding_ratio: float = 0.15) -> Image.Image:
    """Render the Spark 4-point star centered on a rounded background."""
    # Render at 4x then downscale for antialiasing
    scale = 4
    px = size * scale
    img = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Rounded square background
    radius = int(px * 0.22)
    draw.rounded_rectangle([(0, 0), (px - 1, px - 1)], radius=radius, fill=bg)

    # 4-point star (sparkle): two long cusps + two short cusps
    cx, cy = px / 2, px / 2
    pad = px * padding_ratio
    r_long = (px / 2) - pad        # outer reach
    r_short = r_long * 0.18        # waist

    # Points: N, NE-waist, E, SE-waist, S, SW-waist, W, NW-waist
    import math
    pts = []
    for i in range(8):
        angle = -math.pi / 2 + i * math.pi / 4  # start at top
        r = r_long if i % 2 == 0 else r_short
        x = cx + r * math.cos(angle)
        y = cy + r * math.sin(angle)
        pts.append((x, y))
    draw.polygon(pts, fill=fg)

    # Downscale with antialiasing
    return img.resize((size, size), Image.LANCZOS)


def make_maskable(size: int) -> Image.Image:
    """Maskable icon: leave 10% safe zone around edges (PWA spec)."""
    img = Image.new("RGBA", (size, size), SPARK_RED)
    inner = int(size * 0.65)
    mark = draw_spark_mark(inner, bg=(0, 0, 0, 0), fg=CREAM, padding_ratio=0.0)
    img.paste(mark, ((size - inner) // 2, (size - inner) // 2), mark)
    return img


def make_standard(size: int, transparent_bg: bool = False) -> Image.Image:
    """Standard icon: rounded red square with cream sparkle."""
    bg = (0, 0, 0, 0) if transparent_bg else SPARK_RED
    return draw_spark_mark(size, bg=bg, fg=CREAM, padding_ratio=0.18)


def save(img: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "PNG")
    print(f"  wrote {path.relative_to(ROOT)}  ({img.size[0]}x{img.size[1]})")


def write_ico(path: Path) -> None:
    """Write a multi-resolution Windows .ico (16, 32, 48, 64, 128, 256)."""
    sizes = [16, 32, 48, 64, 128, 256]
    images = [make_standard(s) for s in sizes]
    # Pillow handles ICO with sizes list
    images[0].save(path, format="ICO", sizes=[(s, s) for s in sizes], append_images=images[1:])
    print(f"  wrote {path.relative_to(ROOT)}  (multi-res ICO)")


def write_icns(path: Path) -> None:
    """Write a macOS .icns. Pillow supports ICNS write since 9.x."""
    # ICNS expects 16, 32, 64, 128, 256, 512, 1024
    sizes = [16, 32, 64, 128, 256, 512, 1024]
    # Pillow will pick from the base image's resized variants
    base = make_standard(1024)
    base.save(path, format="ICNS", sizes=[(s, s) for s in sizes])
    print(f"  wrote {path.relative_to(ROOT)}  (macOS ICNS)")


def main() -> None:
    print("Generating Spark icon set…")

    # ─── PWA icons ──────────────────────────────────────────────────────────
    print("\nPWA icons:")
    save(make_standard(192), PUBLIC_ICONS / "icon-192.png")
    save(make_standard(384), PUBLIC_ICONS / "icon-384.png")
    save(make_standard(512), PUBLIC_ICONS / "icon-512.png")
    save(make_maskable(512), PUBLIC_ICONS / "icon-512-maskable.png")
    save(make_standard(180), PUBLIC_ICONS / "apple-touch-icon.png")
    save(make_standard(32),  PUBLIC_ICONS / "favicon-32.png")
    save(make_standard(16),  PUBLIC_ICONS / "favicon-16.png")

    # ─── Tauri icons ────────────────────────────────────────────────────────
    print("\nTauri icons:")
    # Tauri's standard set
    save(make_standard(32),   TAURI_ICONS / "32x32.png")
    save(make_standard(128),  TAURI_ICONS / "128x128.png")
    save(make_standard(256),  TAURI_ICONS / "128x128@2x.png")
    save(make_standard(1024), TAURI_ICONS / "icon.png")

    # Windows Store tiles
    for s in (30, 44, 71, 89, 107, 142, 150, 284, 310):
        save(make_standard(s), TAURI_ICONS / f"Square{s}x{s}Logo.png")
    save(make_standard(50),   TAURI_ICONS / "StoreLogo.png")

    # Windows ICO + macOS ICNS
    print()
    write_ico(TAURI_ICONS / "icon.ico")
    write_icns(TAURI_ICONS / "icon.icns")

    print("\nDone.")


if __name__ == "__main__":
    main()
