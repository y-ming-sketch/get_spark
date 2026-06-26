#!/usr/bin/env python3
"""
Generate the OpenGraph + Twitter preview image for Spark.

Output:
  public/og-image.png   1200 x 630, cream background, Spark mark + wordmark + tagline.

Re-run with:  npm run og
"""
from __future__ import annotations
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "og-image.png"

W, H = 1200, 630
CREAM = (250, 249, 245, 255)        # #FAF9F5
CREAM_LINE = (221, 212, 189, 255)   # #DDD4BD
SPARK = (140, 21, 21, 255)          # #8C1515
INK = (27, 26, 22, 255)             # #1B1A16
INK_MUTED = (107, 101, 87, 255)     # #6B6557


def find_font(size: int, weight: str = "regular") -> ImageFont.FreeTypeFont:
    """
    Try common system font paths in order. Falls back to PIL's default.
    """
    candidates_regular = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/dejavu-sans-fonts/DejaVuSans.ttf",
        "/usr/share/fonts/TTF/DejaVuSans.ttf",
        "/Library/Fonts/Helvetica.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
    ]
    candidates_bold = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/dejavu-sans-fonts/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
        "/Library/Fonts/Helvetica Bold.ttf",
        "C:/Windows/Fonts/segoeuib.ttf",
    ]
    paths = candidates_bold if weight == "bold" else candidates_regular
    for p in paths:
        if Path(p).exists():
            try:
                return ImageFont.truetype(p, size)
            except OSError:
                continue
    return ImageFont.load_default()


def draw_spark_mark(size: int) -> Image.Image:
    """Render the 4-point Spark star centered on a transparent canvas."""
    scale = 4
    px = size * scale
    img = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    cx, cy = px / 2, px / 2
    r_long = (px / 2) * 0.92
    r_short = r_long * 0.18

    pts = []
    for i in range(8):
        angle = -math.pi / 2 + i * math.pi / 4
        r = r_long if i % 2 == 0 else r_short
        x = cx + r * math.cos(angle)
        y = cy + r * math.sin(angle)
        pts.append((x, y))
    draw.polygon(pts, fill=SPARK)

    return img.resize((size, size), Image.LANCZOS)


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    img = Image.new("RGBA", (W, H), CREAM)
    draw = ImageDraw.Draw(img)

    # ─── Subtle border for definition on light surfaces ───────────────────
    draw.rounded_rectangle(
        [(2, 2), (W - 3, H - 3)],
        radius=24,
        outline=CREAM_LINE,
        width=2,
    )

    # ─── Spark mark + wordmark ────────────────────────────────────────────
    mark_size = 96
    mark = draw_spark_mark(mark_size)
    mark_x, mark_y = 80, 80
    img.paste(mark, (mark_x, mark_y), mark)

    wordmark_font = find_font(56, "bold")
    draw.text(
        (mark_x + mark_size + 18, mark_y + 14),
        "Spark",
        font=wordmark_font,
        fill=INK,
    )

    # ─── Main headline ────────────────────────────────────────────────────
    headline_font = find_font(76, "bold")
    headline_lines = [
        "Local-first AI",
        "for code, trends",
        "& everything in between.",
    ]
    y = 250
    for line in headline_lines:
        draw.text((80, y), line, font=headline_font, fill=INK)
        y += 88

    # ─── Tagline strip at bottom ─────────────────────────────────────────
    tagline_font = find_font(28, "regular")
    chip_text = "Your key. Your files. Every device."
    tagline_color = INK_MUTED
    bbox = draw.textbbox((0, 0), chip_text, font=tagline_font)
    text_w = bbox[2] - bbox[0]
    chip_x = 80
    chip_y = H - 90

    # Accent line in Spark red to anchor the eye
    draw.rectangle(
        [(chip_x, chip_y - 6), (chip_x + 60, chip_y - 2)],
        fill=SPARK,
    )
    draw.text((chip_x, chip_y), chip_text, font=tagline_font, fill=tagline_color)

    # Powered-by pill on the right
    powered = "Powered by DeepSeek"
    powered_font = find_font(22, "regular")
    p_bbox = draw.textbbox((0, 0), powered, font=powered_font)
    p_w = p_bbox[2] - p_bbox[0]
    p_h = p_bbox[3] - p_bbox[1]
    pad_x, pad_y = 18, 10
    pill_w = p_w + pad_x * 2
    pill_h = p_h + pad_y * 2 + 6
    pill_x = W - 80 - pill_w
    pill_y = chip_y - 8
    draw.rounded_rectangle(
        [(pill_x, pill_y), (pill_x + pill_w, pill_y + pill_h)],
        radius=pill_h // 2,
        outline=CREAM_LINE,
        width=2,
        fill=CREAM,
    )
    draw.text(
        (pill_x + pad_x, pill_y + pad_y - 2),
        powered,
        font=powered_font,
        fill=INK_MUTED,
    )

    img.convert("RGB").save(OUT, "PNG", optimize=True)
    print(f"wrote {OUT.relative_to(ROOT)}  ({W}x{H})")


if __name__ == "__main__":
    main()
