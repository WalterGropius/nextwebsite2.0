#!/usr/bin/env python3
"""Convert an OTF/TTF font into WOFF2 + WOFF for the web.

Usage:
    python3 scripts/convert-font.py public/zenhand4.otf

Produces a sibling .woff2 and .woff next to the source file. WOFF2
is the smallest (Brotli-compressed) and is served first by the
@font-face stack in app/global.css; WOFF is the legacy fallback.

Characters the font maps to an unfinished placeholder (one identical
outline shared by many unrelated characters — Zenhand v4 maps à ê û ü ß ·
and others to the same box) are unmapped first, in the source file too,
so the browser falls back to the next font in the stack instead of
drawing a box.

Requires:
    pip install fonttools brotli
"""

import sys
from pathlib import Path

try:
    from fontTools.ttLib import TTFont
except ImportError:
    print("error: fonttools not installed — run: pip install fonttools brotli", file=sys.stderr)
    sys.exit(1)


# A real glyph is drawn for at most a few code points (straight and curly
# quotes share one); a single outline behind this many is a placeholder.
PLACEHOLDER_MIN_SHARED = 5


def drop_placeholders(src: Path) -> None:
    from collections import defaultdict
    from fontTools.pens.recordingPen import RecordingPen

    f = TTFont(str(src))
    glyphs = f.getGlyphSet()
    by_outline = defaultdict(list)
    for cp, name in f.getBestCmap().items():
        pen = RecordingPen()
        glyphs[name].draw(pen)
        if pen.value:  # whitespace has no outline and is legitimately shared
            by_outline[repr(pen.value)].append(cp)
    drop = {cp for cps in by_outline.values() if len(cps) >= PLACEHOLDER_MIN_SHARED for cp in cps}
    if not drop:
        return
    for table in f["cmap"].tables:
        for cp in drop & set(table.cmap):
            del table.cmap[cp]
    f.save(str(src))
    print(f"  unmapped {len(drop)} placeholder chars: {''.join(sorted(map(chr, drop)))}")


def convert(src: Path) -> None:
    if not src.exists():
        print(f"error: {src} not found", file=sys.stderr)
        sys.exit(1)

    drop_placeholders(src)
    for flavor, ext in (("woff2", ".woff2"), ("woff", ".woff")):
        f = TTFont(str(src))
        f.flavor = flavor
        out = src.with_suffix(ext)
        f.save(str(out))
        print(f"  wrote {out} ({out.stat().st_size:,} bytes)")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    for arg in sys.argv[1:]:
        convert(Path(arg))
