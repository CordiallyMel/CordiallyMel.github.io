"""Render the social preview card for the portfolio."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "og.png"
FONT_CANDIDATES = {
    "serif-bold": [
        "C:/Windows/Fonts/georgiab.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
        "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
    ],
    "sans-bold": [
        "C:/Windows/Fonts/segoeuib.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    ],
    "sans": [
        "C:/Windows/Fonts/segoeui.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
    ],
}


def font(role: str, size: int) -> ImageFont.FreeTypeFont:
    for candidate in FONT_CANDIDATES[role]:
        path = Path(candidate)
        if path.is_file():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def build() -> None:
    width, height = 1200, 630
    image = Image.new("RGB", (width, height), "#05060b")
    draw = ImageDraw.Draw(image)

    for box, color in [
        ((-160, -240, 660, 540), "#3b1d9e"),
        ((660, -180, 1500, 520), "#0b6f9c"),
        ((380, 330, 1200, 1000), "#8c246d"),
        ((-240, 300, 500, 900), "#175b60"),
    ]:
        layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        layer_draw = ImageDraw.Draw(layer)
        layer_draw.ellipse(box, fill=color)
        layer = layer.filter(ImageFilter.GaussianBlur(150))
        image = Image.alpha_composite(image.convert("RGBA"), layer).convert("RGB")

    draw = ImageDraw.Draw(image)
    for x in range(0, width, 80):
        draw.line((x, 0, x, height), fill=(24, 24, 42), width=1)
    for y in range(0, height, 80):
        draw.line((0, y, width, y), fill=(24, 24, 42), width=1)

    draw.rounded_rectangle(
        (58, 54, 114, 110),
        radius=16,
        fill=(18, 18, 32),
        outline=(165, 160, 195),
        width=1,
    )
    draw.text((70, 68), "MS", font=font("serif-bold", 22), fill="#ffffff")

    draw.text((58, 164), "MEL SEARLES", font=font("serif-bold", 76), fill="#f8f4ff")
    draw.text(
        (60, 260),
        "SOFTWARE ENGINEER  ·  FULL-STACK  ·  MARKETS",
        font=font("sans-bold", 19),
        fill="#9feaff",
    )
    draw.text(
        (60, 330),
        "I build full-stack systems with a researcher's",
        font=font("sans", 34),
        fill="#d8d0ed",
    )
    draw.text(
        (60, 378),
        "discipline: TypeScript and React in the interface,",
        font=font("sans", 34),
        fill="#d8d0ed",
    )
    draw.text(
        (60, 426),
        "Python and SQL behind it.",
        font=font("sans", 34),
        fill="#d8d0ed",
    )
    draw.text(
        (60, 540),
        "cordiallymel.github.io",
        font=font("sans-bold", 19),
        fill="#f4bce9",
    )
    draw.text(
        (60, 574),
        "TypeScript / React / Node / Python  ·  New York",
        font=font("sans", 15),
        fill="#a29ab8",
    )

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    image.save(OUTPUT, "PNG", optimize=True)
    print(f"wrote {OUTPUT} ({OUTPUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    build()
