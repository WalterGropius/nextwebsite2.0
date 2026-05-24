#!/usr/bin/env python3
"""Convert an OTF/TTF font into WOFF2 + WOFF for the web.

Usage:
    python3 scripts/convert-font.py public/zenhand4.otf

Produces a sibling .woff2 and .woff next to the source file. WOFF2
is the smallest (Brotli-compressed) and is served first by the
@font-face stack in app/global.css; WOFF is the legacy fallback.

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


def convert(src: Path) -> None:
    if not src.exists():
        print(f"error: {src} not found", file=sys.stderr)
        sys.exit(1)

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
