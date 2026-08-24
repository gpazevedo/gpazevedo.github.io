"""Rasterise the full-detail ATLAS Counsel board diagrams to JPEGs under 100 KB.

    uv run scripts/svg_to_jpeg.py <src-dir> [--out assets/diagrams]

The boards are 1280–1320 wide with 9–15px type, designed to be read at native
size. Inlining them as SVG in a ~700px article column halves the type to around
6px, so they ship as raster instead, rendered wide and displayed full-bleed.

Sizing is searched rather than guessed: widest render first, then the highest
quality that fits the budget. Width is preferred over quality because text
survives resolution loss far worse than it survives compression artefacts.
4:4:4 chroma is tried before 4:2:0 — these boards use coloured text on dark
backgrounds, which is exactly what subsampling smears.
"""

import argparse
import io
import sys
from pathlib import Path

import cairosvg
from PIL import Image

BUDGET = 100_000
WIDTHS = [1600, 1500, 1400, 1300, 1200, 1100, 1000]
QUALITIES = list(range(88, 29, -2))
# Below roughly q46 the blocking around glyph edges costs more legibility than
# the extra pixels buy back, so width is only preferred down to this floor.
QUALITY_FLOOR = 46


def encode(im: Image.Image, quality: int, subsampling: int) -> bytes:
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=quality, optimize=True,
            progressive=True, subsampling=subsampling)
    return buf.getvalue()


def best_under_budget(svg: Path, budget: int = BUDGET):
    """Widest render whose quality still clears the floor. Returns (bytes, w, h, q, sub).

    Two passes: the first refuses to trade below QUALITY_FLOOR just to gain
    width, the second drops that guard only if nothing fit at all.
    """
    rendered = {}

    def attempt(floor):
        for width in WIDTHS:
            if width not in rendered:
                png = cairosvg.svg2png(url=str(svg), output_width=width)
                rendered[width] = Image.open(io.BytesIO(png)).convert("RGB")
            im = rendered[width]
            for sub in (0, 2):      # 4:4:4 first, then 4:2:0
                for q in QUALITIES:
                    if q < floor:
                        break
                    data = encode(im, q, sub)
                    if len(data) <= budget:
                        return data, im.width, im.height, q, sub
        return None

    return (attempt(QUALITY_FLOOR) or attempt(0)
            or _fail(svg, budget))


def _fail(svg, budget):
    raise SystemExit(f"{svg.name}: cannot fit {budget} bytes at any tried setting")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("src", type=Path, help="directory holding the source SVGs")
    ap.add_argument("--out", type=Path, default=Path("assets/diagrams"))
    ap.add_argument("--budget", type=int, default=BUDGET)
    args = ap.parse_args()

    out = args.out
    out.mkdir(parents=True, exist_ok=True)

    sources = sorted(args.src.glob("atlas-counsel-*.svg"))
    if not sources:
        raise SystemExit(f"no atlas-counsel-*.svg under {args.src}")

    for svg in sources:
        data, w, h, q, sub = best_under_budget(svg, args.budget)
        dest = out / (svg.stem + ".jpg")
        dest.write_bytes(data)
        pct = 100 * len(data) / args.budget
        print(f"  {dest.name:34s} {w}x{h}  q{q}  {'4:4:4' if sub == 0 else '4:2:0'}  "
              f"{len(data):6d} B  ({pct:.0f}% of budget)")

    print(f"wrote {len(sources)} JPEG(s) to {out}")


if __name__ == "__main__":
    sys.exit(main())
