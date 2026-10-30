#!/usr/bin/env python3
"""Build the Zenhand family from the hand-drawn master.

    python3 scripts/build-zenhand.py            # writes public/fonts/*
    python3 scripts/build-zenhand.py --specimen  # also an HTML specimen

The master (public/zenhand4.otf) is a traced scan of handwriting. It was
never finished as a font: glyph baselines wander by a quarter of the cap
height, sidebearings are effectively random (the period sat 190 units off
its word, `o` overlapped whatever came before it), there is no kerning,
several glyphs are scribbled placeholders (^ Ê Ë ©), and most European
accents are missing, so the browser swapped in another face mid-word.

This script treats the master as a set of drawings, not a font:

  1. normalise   - every glyph is seated on the baseline and pulled part
                   of the way toward a common x-height / cap height, so
                   the hand still wobbles but the line stops bouncing.
  2. repair      - placeholders and broken glyphs are rebuilt from the
                   writer's own strokes (two periods make a colon, the
                   hyphen warps into a tilde...). `a` was written as a
                   reversed e that reads as "ə" in running text; the
                   default `a` is now built from the `d` bowl, and the
                   original stays available as `ss01`.
  3. variants    - Regular and Bold (outline grown with a round pen, which
                   replaces the -webkit-text-stroke faux-bold the site used)
                   in the original rough line, and Smooth Regular / Bold,
                   re-traced through potrace so the curves carry a fraction
                   of the points and none of the scanner jitter.
  4. accents     - FR / DE / CS / ES / IT / PT / PL / NL / SV / TR are
                   composed from hand-drawn marks lifted out of the master's
                   own é č ů i etc.
  5. spacing     - sidebearings are set optically from each glyph's side
                   profile (area of white between the letter and a wall),
                   then pairs are auto-kerned from the same profiles with a
                   collision guard, so `rn` no longer reads as `m`.

Requires: pip install fonttools brotli skia-pathops numpy pillow scipy
          and the potrace binary (apt install potrace).
"""

from __future__ import annotations

import math
import re
import shutil
import subprocess
import sys
import tempfile
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
import pathops
from fontTools.agl import UV2AGL
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.pens.transformPen import TransformPen
from fontTools.svgLib.path import parse_path
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / "public" / "zenhand4.otf"
OUT = ROOT / "public" / "fonts"

UPM = 2048
XH = 880  # x-height
CAP = 1400  # cap height
ASC = 1640  # ascender
DIGIT = 1300
DESC = -560

# Vertical font metrics. The content area is centred a little above the
# x-height middle so a line of mixed case sits optically centred in
# buttons and pills at line-height: 1.
HHEA_ASC = 1960
HHEA_DESC = -680


# ---------------------------------------------------------------------------
# path helpers
# ---------------------------------------------------------------------------


def clone(p: pathops.Path) -> pathops.Path:
    q = pathops.Path()
    p.draw(q.getPen())
    return q


def bounds(p: pathops.Path):
    return p.bounds if list(p.contours) else (0.0, 0.0, 0.0, 0.0)


def tf(p: pathops.Path, a=1.0, b=0.0, c=0.0, d=1.0, e=0.0, f=0.0) -> pathops.Path:
    return p.transform(a, b, c, d, e, f)


def move(p, dx=0.0, dy=0.0):
    return tf(p, 1, 0, 0, 1, dx, dy)


def scale_about(p, sx, sy=None, ox=0.0, oy=0.0):
    sy = sx if sy is None else sy
    return tf(p, sx, 0, 0, sy, ox - sx * ox, oy - sy * oy)


def rotate_about(p, deg, ox, oy):
    r = math.radians(deg)
    c, s = math.cos(r), math.sin(r)
    return tf(p, c, s, -s, c, ox - c * ox + s * oy, oy - s * ox - c * oy)


def union(*paths) -> pathops.Path:
    paths = [p for p in paths if p is not None and list(p.contours)]
    if not paths:
        return pathops.Path()
    out = pathops.Path()
    pen = out.getPen()
    pathops.union([clone(p) for p in paths], pen)
    return out


def intersect(a, b) -> pathops.Path:
    out = pathops.Path()
    pathops.intersection([clone(a)], [clone(b)], out.getPen())
    return out


def difference(a, b) -> pathops.Path:
    out = pathops.Path()
    pathops.difference([clone(a)], [clone(b)], out.getPen())
    return out


def rect(x0, y0, x1, y1) -> pathops.Path:
    p = pathops.Path()
    p.moveTo(x0, y0)
    p.lineTo(x1, y0)
    p.lineTo(x1, y1)
    p.lineTo(x0, y1)
    p.close()
    return p


def contours_where(p, pred) -> pathops.Path:
    out = pathops.Path()
    pen = out.getPen()
    for c in p.contours:
        if pred(c.bounds):
            c.draw(pen)
    return out


def grow(p, d: float) -> pathops.Path:
    """Offset an outline outward by d with a round pen."""
    if d <= 0:
        return clone(p)
    s = clone(p)
    s.stroke(2 * d, pathops.LineCap.ROUND_CAP, pathops.LineJoin.ROUND_JOIN, 4)
    s.convertConicsToQuads()
    return union(p, s)


def warp(p, fn, step=12.0) -> pathops.Path:
    """Apply a non-linear point warp; curves are flattened first."""
    out = pathops.Path()
    for contour in polylines(p, step):
        if len(contour) < 3:
            continue
        x, y = fn(*contour[0])
        out.moveTo(x, y)
        for pt in contour[1:]:
            out.lineTo(*fn(*pt))
        out.close()
    out.simplify()
    return out


def polylines(p, step=10.0):
    """Flatten a path into closed polylines (list of [(x, y), ...])."""
    polys = []
    cur = []
    last = None
    for verb, pts in p.segments:
        if verb == "moveTo":
            if cur:
                polys.append(cur)
            cur = [pts[0]]
            last = pts[0]
        elif verb == "lineTo":
            cur.append(pts[0])
            last = pts[0]
        elif verb in ("curveTo", "qCurveTo"):
            ctrl = [last, *pts]
            if verb == "qCurveTo" and len(ctrl) == 3:
                p0, p1, p2 = ctrl
                ctrl = [p0, _lerp(p0, p1, 2 / 3), _lerp(p2, p1, 2 / 3), p2]
            p0, p1, p2, p3 = ctrl[0], ctrl[1], ctrl[2], ctrl[-1]
            length = math.dist(p0, p1) + math.dist(p1, p2) + math.dist(p2, p3)
            n = max(2, int(length / step))
            for i in range(1, n + 1):
                t = i / n
                mt = 1 - t
                cur.append(
                    (
                        mt**3 * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t**3 * p3[0],
                        mt**3 * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t**3 * p3[1],
                    )
                )
            last = pts[-1]
        elif verb in ("closePath", "endPath"):
            if cur:
                polys.append(cur)
            cur = []
    if cur:
        polys.append(cur)
    return polys


def _lerp(a, b, t):
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)


# ---------------------------------------------------------------------------
# rasterising (for profiles and the potrace re-trace)
# ---------------------------------------------------------------------------

RES = 2.0  # font units per pixel


def raster(p, pad=80):
    """Nonzero-winding raster of a path. Returns (mask, x0, y0) where pixel
    (row r, col c) covers font-space (x0 + c*RES, y0 - r*RES)."""
    xmin, ymin, xmax, ymax = bounds(p)
    x0 = math.floor(xmin) - pad
    y0 = math.ceil(ymax) + pad
    w = int((xmax - xmin + 2 * pad) / RES) + 2
    h = int((ymax - ymin + 2 * pad) / RES) + 2
    wind = np.zeros((h, w), dtype=np.int16)
    for poly in polylines(p, 6.0):
        if len(poly) < 3:
            continue
        pts = [((x - x0) / RES, (y0 - y) / RES) for x, y in poly]
        img = Image.new("1", (w, h), 0)
        ImageDraw.Draw(img).polygon(pts, fill=1)
        area = 0.0
        for (ax, ay), (bx, by) in zip(poly, poly[1:] + poly[:1]):
            area += ax * by - bx * ay
        wind += np.asarray(img, dtype=np.int16) * (1 if area > 0 else -1)
    return wind != 0, x0, y0


def potrace_mask(mask, x0, y0, alphamax=1.0, opttol=0.4, turd=6) -> pathops.Path:
    h, w = mask.shape
    with tempfile.TemporaryDirectory() as td:
        pbm = Path(td) / "g.pbm"
        svg = Path(td) / "g.svg"
        Image.fromarray(((~mask) * 255).astype(np.uint8)).convert("1").save(pbm)
        subprocess.run(
            [
                "potrace", str(pbm), "-s", "-o", str(svg), "--flat",
                "-a", str(alphamax), "-O", str(opttol), "-t", str(turd), "-u", "100",
            ],
            check=True,
        )
        text = svg.read_text()
    m = re.search(r'transform="translate\(([-\d.]+),([-\d.]+)\) scale\(([-\d.]+),([-\d.]+)\)"', text)
    tx, ty, sx, sy = map(float, m.groups())
    out = pathops.Path()
    # svg px -> font units: X = x0 + px*RES, Y = y0 - py*RES
    pen = TransformPen(out.getPen(), (sx * RES, 0, 0, sy * -RES, x0 + tx * RES, y0 - ty * RES))
    for d in re.findall(r' d="([^"]+)"', text):
        parse_path(d, pen)
    out.simplify()
    return out


def smooth_outline(p, sigma=7.0, grow_px=0.0, alphamax=1.1, opttol=0.5) -> pathops.Path:
    """Re-trace a glyph through a blurred raster: scanner jitter goes,
    the hand's gesture stays. grow_px dilates first (for the bold)."""
    if not list(p.contours):
        return pathops.Path()
    pad = int(60 + grow_px * RES * 2)
    mask, x0, y0 = raster(p, pad=pad)
    field_ = mask.astype(np.float32)
    if grow_px > 0:
        # Euclidean dilation: grow by grow_px pixels with a round pen.
        dist = ndimage.distance_transform_edt(~mask)
        field_ = (dist <= grow_px).astype(np.float32)
    field_ = ndimage.gaussian_filter(field_, sigma / RES)
    return potrace_mask(field_ > 0.5, x0, y0, alphamax=alphamax, opttol=opttol)


# ---------------------------------------------------------------------------
# profiles, spacing, kerning
# ---------------------------------------------------------------------------

ROW = 10.0  # profile row height in font units
Y_LO, Y_HI = -900, 2300
NROWS = int((Y_HI - Y_LO) / ROW)


def profiles(p):
    """Per-row leftmost / rightmost ink (NaN where the row is empty)."""
    left = np.full(NROWS, np.nan)
    right = np.full(NROWS, np.nan)
    if not list(p.contours):
        return left, right
    mask, x0, y0 = raster(p, pad=8)
    h, w = mask.shape
    cols = np.arange(w)
    for r in range(NROWS):
        ylo = Y_LO + r * ROW
        rr0 = int((y0 - (ylo + ROW)) / RES)
        rr1 = int((y0 - ylo) / RES) + 1
        rr0, rr1 = max(rr0, 0), min(rr1, h)
        if rr0 >= rr1:
            continue
        band = mask[rr0:rr1].any(axis=0)
        if band.any():
            idx = cols[band]
            left[r] = x0 + idx[0] * RES
            right[r] = x0 + (idx[-1] + 1) * RES
    return left, right


def row_of(y):
    return int(round((y - Y_LO) / ROW))


@dataclass
class Glyph:
    name: str
    path: pathops.Path
    unicodes: list = field(default_factory=list)
    kind: str = "lc"  # lc | uc | digit | punct | space
    adv: int = 0
    # composed glyphs inherit spacing from their base
    base: str | None = None
    marks: list = field(default_factory=list)  # [(mark_name, anchor)]
    zone: tuple | None = None


def zone_for(g: Glyph):
    if g.zone:
        return g.zone
    if g.kind == "lc":
        return (0, XH)
    if g.kind in ("uc",):
        return (0, CAP)
    if g.kind == "digit":
        return (0, DIGIT)
    xmin, ymin, xmax, ymax = bounds(g.path)
    return (ymin, ymax)


def side_depth(prof, extreme, sign, z0, z1, depth):
    """Mean distance from the extreme to the ink edge inside the zone,
    each row clipped at `depth` (an empty row counts as fully open)."""
    r0, r1 = row_of(z0), row_of(z1)
    seg = prof[r0:r1]
    d = np.where(np.isnan(seg), depth, np.minimum((seg - extreme) * sign, depth))
    return float(d.mean())


def space_glyph(g: Glyph, unit: float, depth_frac=0.14, min_sb=-20, overrides=None):
    """Optical sidebearings: white area per side matches a constant."""
    xmin, ymin, xmax, ymax = bounds(g.path)
    if not list(g.path.contours):
        return
    z0, z1 = zone_for(g)
    depth = depth_frac * (z1 - z0) if g.kind != "punct" else 0
    left, right = profiles(g.path)
    zl, zr = (z0, z1)
    # Restrict the measuring zone to rows that hold ink at all; otherwise a
    # T would be measured against an empty x-height band.
    if g.kind == "punct":
        lsb = rsb = unit
    else:
        dl = side_depth(left, xmin, +1, zl, zr, depth)
        dr = side_depth(right, xmax, -1, zl, zr, depth)
        lsb = max(min_sb, unit - dl)
        rsb = max(min_sb, unit - dr)
    if overrides:
        lsb, rsb = overrides(g, lsb, rsb)
    g.path = move(g.path, lsb - xmin, 0)
    g.adv = int(round(lsb + (xmax - xmin) + rsb))


def kern_pairs(glyphs: dict, lefts: list, rights: list, ref_gap: float, *,
               clip=360.0, min_dist=70.0, strength=0.4, vband=90.0,
               limit=(-220, 160), threshold=24):
    """Profile-driven pair kerning with a 2D collision guard."""
    prof = {}
    for n in set(lefts) | set(rights):
        g = glyphs[n]
        prof[n] = profiles(g.path)
    vb = int(vband / ROW)
    out = {}
    for ln in lefts:
        L = glyphs[ln]
        _, rL = prof[ln]
        for rn in rights:
            R = glyphs[rn]
            lR, _ = prof[rn]
            # Horizontal gap per row, with each side dilated vertically so a
            # bar or bowl a little above/below still counts as nearby.
            gaps = []
            mind = 1e9
            for r in range(NROWS):
                if np.isnan(rL[r]):
                    continue
                lo, hi = max(0, r - vb), min(NROWS, r + vb + 1)
                cand = lR[lo:hi]
                if np.all(np.isnan(cand)):
                    continue
                dy = (np.arange(lo, hi) - r) * ROW
                dx = (cand + L.adv) - rL[r]
                ok = ~np.isnan(dx)
                dist = np.sqrt(np.maximum(dx[ok], 0) ** 2 + dy[ok] ** 2)
                dist = np.where(dx[ok] < 0, -1, dist)
                mind = min(mind, float(dist.min()))
                g = (lR[r] + L.adv - rL[r]) if not np.isnan(lR[r]) else np.nanmin(dx)
                gaps.append(min(g, clip))
            if not gaps:
                continue
            gap = float(np.mean(gaps))
            k = (ref_gap - gap) * strength
            # collision guard: never let ink come closer than min_dist
            if mind < min_dist:
                k = max(k, min_dist - mind)
            k = max(limit[0], min(limit[1], k))
            k = int(round(k / 10.0) * 10)
            if abs(k) >= threshold:
                out[(ln, rn)] = k
    return out


# ---------------------------------------------------------------------------
# master + normalisation
# ---------------------------------------------------------------------------


def load_master():
    f = TTFont(str(MASTER))
    gs = f.getGlyphSet()
    paths = {}
    for n in f.getGlyphOrder():
        p = pathops.Path()
        gs[n].draw(p.getPen())
        p.simplify()
        paths[n] = p
    return paths, f["hmtx"]


def seat(p, *, bottom=None, top=None, target=None, measure=None, partial=0.55,
         keep_bounce=0.12, cx=None):
    """Seat a glyph: scale it part of the way toward `target` height
    (measured over `measure`=(lo, hi) of its current bounds, default all
    ink) and place its bottom on `bottom` or its top on `top`."""
    xmin, ymin, xmax, ymax = bounds(p)
    lo, hi = measure if measure else (ymin, ymax)
    h = hi - lo
    s = 1.0
    if target and h > 0:
        s = (target / h) ** partial
        s = min(1.22, max(0.82, s))
    ox = (xmin + xmax) / 2
    q = scale_about(p, s, s, ox, lo)
    xmin, ymin, xmax, ymax = bounds(q)
    if bottom is not None:
        cur = ymin if measure is None else lo
        q = move(q, 0, bottom - cur)
    elif top is not None:
        cur = ymax if measure is None else lo + (hi - lo) * s
        q = move(q, 0, top - cur)
    return q


def build_base(master):
    m = master
    G: dict[str, Glyph] = {}

    def add(name, path, uni, kind, **kw):
        G[name] = Glyph(name, path, list(uni) if isinstance(uni, (list, tuple)) else [uni], kind, **kw)

    round_bottom = set("cegosCGOSQU068@")
    over = 18  # overshoot for round bottoms

    # lowercase x-height letters
    for ch in "cemnorsuvwxz":
        p = seat(m[ch], target=XH, bottom=-over if ch in round_bottom else 0)
        add(ch, p, ord(ch), "lc")
    # ascenders
    for ch in "bdhkl":
        p = seat(m[ch], target=ASC, bottom=0, partial=0.5)
        add(ch, p, ord(ch), "lc")
    add("t", seat(m["t"], target=1080, bottom=0, partial=0.5), ord("t"), "lc")
    add("f", seat(m["f"], target=ASC - DESC * 0.55, top=ASC + 20, partial=0.4), ord("f"), "lc")
    # descenders: x-height bowl on the line, tail below
    for ch in "gpqy":
        p = m[ch]
        xmin, ymin, xmax, ymax = bounds(p)
        p = seat(p, target=XH - DESC, top=XH + (20 if ch in "gq" else 0), partial=0.35)
        add(ch, p, ord(ch), "lc")
    # i / j: stem seated, dot kept with it
    add("i", seat(m["i"], bottom=0, target=1180, partial=0.4), ord("i"), "lc")
    add("j", seat(m["j"], top=bounds(G["i"].path)[3] + 10, partial=0.0), ord("j"), "lc")

    # `a`: the master's a is a reversed e that reads as a schwa in running
    # text. Build a single-storey a from the q instead: same bowl, stem
    # cut at the baseline with a slight pen-like slant.
    q = G["q"].path
    qx0, _, qx1, _ = bounds(q)
    cut = pathops.Path()
    cut.moveTo(qx0 - 200, -20)
    cut.lineTo(qx1 + 200, 10)
    cut.lineTo(qx1 + 200, XH + 400)
    cut.lineTo(qx0 - 200, XH + 400)
    cut.close()
    a_new = intersect(q, cut)
    add("a", seat(a_new, bottom=0, partial=0), ord("a"), "lc")
    add("a.ss01", seat(m["a"], target=XH, bottom=0), [], "lc")

    # capitals
    for ch in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
        p = seat(m[ch], target=CAP, bottom=-over if ch in round_bottom else 0, partial=0.6)
        add(ch, p, ord(ch), "uc")
    # Capital I is a bare stroke in the hand, identical to l. Give it the
    # crossbars handwriting uses so `Il1` stay distinct.
    I = G["I"].path
    ix0, iy0, ix1, iy1 = bounds(I)
    bar = m["hyphen"]
    bx0, by0, bx1, by1 = bounds(bar)
    bw = 420
    sb = bw / (bx1 - bx0)
    cxI = (ix0 + ix1) / 2
    topbar = tf(bar, sb, 0, 0, 0.75, cxI - sb * (bx0 + bx1) / 2, iy1 - 0.75 * by1 + 22)
    botbar = rotate_about(tf(bar, sb, 0, 0, 0.75, cxI - sb * (bx0 + bx1) / 2 + 10, iy0 - 0.75 * by0 - 18), 2.5, cxI, iy0)
    G["I"].path = union(I, topbar, botbar)

    # digits
    for ch, nm in zip("0123456789", ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]):
        p = m[nm]
        if ch == "9":
            p = seat(p, target=DIGIT + 120, bottom=-40, partial=0.5)
        else:
            p = seat(p, target=DIGIT, bottom=-over if ch in round_bottom else 0, partial=0.6)
        add(nm, p, ord(ch), "digit")

    # punctuation and symbols
    period = seat(m["period"], target=150, bottom=0, partial=0.4)
    add("period", period, ord("."), "punct")
    comma = seat(m["comma"], target=470, top=150, partial=0.5)
    add("comma", comma, ord(","), "punct")
    add("exclam", seat(m["exclam"], target=CAP + 60, bottom=0, partial=0.5), ord("!"), "punct")
    add("question", seat(m["question"], target=CAP + 60, bottom=0, partial=0.5), ord("?"), "punct")
    hy = seat(m["hyphen"], partial=0)
    hx0, hy0, hx1, hy1 = bounds(hy)
    hy = tf(hy, 0.8, 0, 0, 1, -hx0 * 0.8, 0)
    hy = move(hy, 0, 430 - (hy0 + hy1) / 2)
    add("hyphen", hy, [ord("-"), 0x2010, 0x2011, 0x00AD], "punct")
    add("plus", seat(m["plus"], target=900, bottom=150, partial=0.6), ord("+"), "punct")
    add("asterisk", seat(m["asterisk"], target=700, top=CAP + 40, partial=0.6), ord("*"), "punct")
    add("slash", seat(m["slash"], target=CAP + 260, bottom=-160, partial=0.7), ord("/"), "punct")
    add("backslash", seat(m["backslash"], target=CAP + 260, bottom=-160, partial=0.7), ord("\\"), "punct")
    add("percent", seat(m["percent"], target=CAP, bottom=0, partial=0.6), ord("%"), "punct")
    add("ampersand", seat(m["ampersand"], target=CAP, bottom=0, partial=0.6), ord("&"), "punct")
    add("at", seat(m["at"], target=CAP, bottom=-160, partial=0.6), ord("@"), "punct")
    for nm, ch in (("parenleft", "("), ("parenright", ")"), ("bracketleft", "["), ("bracketright", "]"), ("braceleft", "{"), ("braceright", "}")):
        add(nm, seat(m[nm], target=CAP + 520, bottom=-300, partial=0.75), ord(ch), "punct")
    add("less", seat(m["less"], target=640, bottom=120, partial=0.6), ord("<"), "punct")
    add("greater", seat(m["greater"], target=640, bottom=120, partial=0.6), ord(">"), "punct")
    add("equal", seat(m["equal"], target=380, bottom=240, partial=0.6), ord("="), "punct")
    add("underscore", seat(m["underscore"], target=110, bottom=-180, partial=0.5), ord("_"), "punct")
    tick = seat(m["quoteright"], target=330, top=CAP + 70, partial=0.5)
    add("quotesingle", tick, [ord("'")], "punct")
    add("quoteright", clone(tick), [0x2019], "punct")
    add("quoteleft", rotate_about(tick, 180, *_center(tick)), [0x2018], "punct")
    dq = seat(m["quotedbl"], target=420, top=CAP + 70, partial=0.5)
    add("quotedbl", dq, [ord('"')], "punct")
    add("quotedblright", clone(dq), [0x201D], "punct")
    add("quotedblleft", rotate_about(dq, 180, *_center(dq)), [0x201C], "punct")
    add("quotesinglbase", move(tick, 0, -bounds(tick)[1] - 170), [0x201A], "punct")
    add("quotedblbase", move(dq, 0, -bounds(dq)[1] - 170), [0x201E], "punct")
    add("grave", seat(m["grave"], target=300, bottom=XH + 120, partial=0.5), ord("`"), "punct")
    return G


def _center(p):
    x0, y0, x1, y1 = bounds(p)
    return ((x0 + x1) / 2, (y0 + y1) / 2)


def build_marks(master, G):
    """Hand-drawn marks lifted out of the master's own accented letters,
    normalised to sit at the origin (x-centre 0, bottom 0)."""
    m = master

    def origin(p):
        x0, y0, x1, y1 = bounds(p)
        return move(p, -(x0 + x1) / 2, -y0)

    def fit_w(p, w):
        x0, y0, x1, y1 = bounds(p)
        return scale_about(p, w / (x1 - x0), w / (x1 - x0))

    M = {}
    acute = contours_where(m["aacute"], lambda b: b[1] > 1300)
    # the hand's acute is nearly flat; tip it up so í and é read at text
    # sizes, and thicken it back to the letter's stroke after shrinking
    acute = rotate_about(acute, 24, *_center(acute))
    M["acute"] = origin(fit_w(origin(acute), 300))
    M["acute.cap"] = origin(scale_about(fit_w(origin(acute), 290), 1, 0.85))
    M["grave"] = scale_about(M["acute"], -1, 1)
    M["grave.cap"] = scale_about(M["acute.cap"], -1, 1)
    caron = contours_where(m["ccaron"], lambda b: b[1] > 980)
    M["caron"] = origin(fit_w(origin(caron), 380))
    M["caron.cap"] = origin(scale_about(fit_w(origin(caron), 360), 1, 0.72))
    M["circumflex"] = origin(scale_about(M["caron"], 1, -1))
    M["circumflex.cap"] = origin(scale_about(M["caron.cap"], 1, -1))
    ring = contours_where(m["uring"], lambda b: b[1] > 1080)
    M["ring"] = origin(fit_w(origin(ring), 250))
    M["ring.cap"] = origin(fit_w(origin(ring), 230))
    # Accent dots: the writer's period, filled and a touch smaller. (The i's
    # own tittle is a dash; doubled for an umlaut it fused into a bar.)
    per = G["period"].path
    outer = max(per.contours, key=lambda c: (c.bounds[2] - c.bounds[0]) * (c.bounds[3] - c.bounds[1]))
    dot = pathops.Path()
    outer.draw(dot.getPen())
    dot = origin(fit_w(origin(dot), 150))
    M["dot"] = dot
    M["dot.cap"] = scale_about(dot, 0.95)
    pair = union(move(dot, -125, 0), move(scale_about(dot, 0.94), 135, 14))
    M["dieresis"] = origin(pair)
    M["dieresis.cap"] = origin(scale_about(pair, 0.92))
    # breve: the lower half of the o, small
    o = G["o"].path
    ox0, oy0, ox1, oy1 = bounds(o)
    cup = intersect(o, rect(ox0 - 50, oy0 - 50, ox1 + 50, (oy0 + oy1) / 2 - 20))
    M["breve"] = origin(fit_w(origin(cup), 330))
    M["breve.cap"] = origin(fit_w(origin(cup), 300))
    # tilde: the writer's hyphen bent through one sine period
    hy = G["hyphen"].path
    hx0, hy0, hx1, hy1 = bounds(hy)
    cy = (hy0 + hy1) / 2
    tl = warp(hy, lambda x, y: (x, y + 70 * math.sin((x - hx0) / (hx1 - hx0) * 2 * math.pi)))
    M["tilde"] = origin(fit_w(origin(tl), 400))
    M["tilde.cap"] = origin(scale_about(M["tilde"], 0.9))
    # cedilla / ogonek: the comma, under the letter
    cm = G["comma"].path
    M["cedilla"] = origin(fit_w(origin(cm), 150))
    M["ogonek"] = origin(scale_about(fit_w(origin(cm), 170), -1, 1))
    # the Czech ď ť ľ caron is an apostrophe beside the stem
    M["caron.vert"] = origin(grow(fit_w(origin(G["quoteright"].path), 120), 6))
    # stroke for ł / Ł
    M["stroke"] = origin(rotate_about(fit_w(origin(hy), 360), 28, 0, 0))
    # double acute
    M["hungarumlaut"] = origin(union(move(scale_about(M["acute"], 0.7), -110, 0), move(scale_about(M["acute"], 0.7), 120, 0)))
    M["hungarumlaut.cap"] = origin(scale_about(M["hungarumlaut"], 0.9, 0.8))
    for k in list(M):
        if k not in ("dot", "dot.cap", "dieresis", "dieresis.cap", "cedilla", "ogonek"):
            M[k] = origin(grow(M[k], 7))
    return M


# (glyph, base, [(mark, position)]) ; position: top | bottom | right-top | stroke
ACCENTS = {
    "acute": "́", "grave": "̀", "circumflex": "̂", "caron": "̌",
    "dieresis": "̈", "ring": "̊", "tilde": "̃", "cedilla": "̧",
    "ogonek": "̨", "breve": "̆", "dot": "̇", "hungarumlaut": "̋",
}
COMBINING = {v: k for k, v in ACCENTS.items()}

COMPOSE = (
    "ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïñòóôõöùúûüýÿ"
    "ĀāĂăĄąĆćĈĉĊċČčĎďĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĨĩĪīĬĭĮįİĴĵĶķĹĺĻļĽľŃńŅņŇňŌōŎŏŐőŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽž"
)


def glyph_name(cp: int) -> str:
    return UV2AGL.get(cp, f"uni{cp:04X}")


def compose_accents(G, M):
    """Accented letters: base + mark. Positions are computed from each
    base's own top-of-ink so the mark follows the hand's lean."""
    made = {}
    for ch in COMPOSE:
        dec = unicodedata.normalize("NFD", ch)
        base_ch, marks = dec[0], dec[1:]
        if base_ch == "i" and any(c in "̨́̀̂̈̃̄̆" for c in marks) and "̨" not in marks:
            base_name = "dotlessi"
        elif base_ch == "j" and marks == "̂":
            base_name = "dotlessj"
        else:
            base_name = glyph_name(ord(base_ch))
            if base_name == "a":
                base_name = "a"
        if base_name not in G:
            continue
        mk = []
        ok = True
        for c in marks:
            if c == "̄":  # macron -> the hyphen, handled as a mark
                mk.append("macron")
                continue
            if c not in COMBINING:
                ok = False
                break
            mk.append(COMBINING[c])
        if not ok:
            continue
        name = glyph_name(ord(ch))
        made[name] = (ch, base_name, mk)
    return made


def place_marks(G, M, base_name, marks, ch):
    base = G[base_name]
    p = clone(base.path)
    x0, y0, x1, y1 = bounds(p)
    cap = base.kind == "uc"
    lower = ch.lower() == ch and not cap
    for mk in marks:
        if mk == "macron":
            hy = G["hyphen"].path
            hx0, hy0, hx1, hy1 = bounds(hy)
            mark = move(scale_about(hy, 360 / (hx1 - hx0), 1, 0, 0), 0, 0)
            mx0, my0, mx1, my1 = bounds(mark)
            mark = move(mark, -(mx0 + mx1) / 2, -my0)
        else:
            key = mk + (".cap" if cap and (mk + ".cap") in M else "")
            mark = M[key]
        mx0, my0, mx1, my1 = bounds(mark)
        if mk in ("cedilla", "ogonek"):
            # under the letter: cedilla centred, ogonek at the right foot
            if mk == "cedilla":
                bx0_, _, bx1_, _ = bounds(base.path)
                cx = (bx0_ + bx1_) / 2 - 10
                p = union(p, move(mark, cx, -mark_height(mark) - 10 + 40))
            else:
                cx = _ink_right(base.path, 0, 200) - 70
                p = union(p, move(mark, cx, -mark_height(mark) + 30))
            continue
        if base_name in ("d", "t", "l", "L") and mk == "caron":
            # Czech/Slovak vertical caron: an apostrophe after the stem.
            v = M["caron.vert"]
            if base_name == "L":
                tx = _ink_right(base.path, CAP - 300, CAP) + 50
                ty = CAP - 300
            elif base_name == "t":
                tx = _ink_right(base.path, 930, 1100) + 60
                ty = 900
            else:
                tx = _ink_right(base.path, ASC - 380, ASC) + 50
                ty = ASC - 360
            p = union(p, move(v, tx, ty))
            continue
        # above: centre over the top band of ink
        top = y1
        band = (top - 320, top + 1)
        cx = _ink_center(base.path, *band)
        if base_name in ("dotlessi", "dotlessj"):
            cx = _ink_center(base.path, XH - 300, XH + 200)
        gap = 120 if cap else 110
        if base_name in ("b", "d", "h", "k", "l"):
            # ascender letters (ľ, ĺ): centre on the ascender's top
            cx = _ink_center(base.path, top - 200, top)
        p = union(p, move(mark, cx, top + gap))
        x0, y0, x1, y1 = bounds(p)
        y1 = max(y1, top)
    return p


def mark_height(m):
    x0, y0, x1, y1 = bounds(m)
    return y1 - y0


def _ink_center(p, ylo, yhi):
    part = intersect(p, rect(-5000, ylo, 5000, yhi))
    if not list(part.contours):
        x0, y0, x1, y1 = bounds(p)
        return (x0 + x1) / 2
    x0, y0, x1, y1 = bounds(part)
    return (x0 + x1) / 2


def _ink_right(p, ylo, yhi):
    part = intersect(p, rect(-5000, ylo, 5000, yhi))
    x0, y0, x1, y1 = bounds(part if list(part.contours) else p)
    return x1


def build_extras(G, M):
    """Glyphs the master never had, or had as placeholders."""
    per = G["period"].path
    px0, py0, px1, py1 = bounds(per)
    pw = px1 - px0

    def add(name, path, uni, kind="punct", **kw):
        G[name] = Glyph(name, path, list(uni) if isinstance(uni, (list, tuple)) else [uni], kind, **kw)

    # dotless i / j
    add("dotlessi", contours_where(G["i"].path, lambda b: b[1] < XH - 40), 0x0131, "lc")
    add("dotlessj", contours_where(G["j"].path, lambda b: b[1] < XH - 40), 0x0237, "lc")
    # colon / semicolon / ellipsis from the writer's own dot and comma
    add("colon", union(per, move(per, 12, XH - 170 - py0)), ord(":"))
    cm = G["comma"].path
    cx0, cy0, cx1, cy1 = bounds(cm)
    add("semicolon", union(move(cm, 0, 0), move(per, (cx0 + cx1) / 2 - (px0 + px1) / 2 + 20, XH - 170 - py0)), ord(";"))
    gap = 70
    add("ellipsis", union(per, move(scale_about(per, 0.95), pw + gap, 8), move(per, 2 * (pw + gap), -4)), 0x2026)
    add("periodcentered", move(per, 0, 390 - (py0 + py1) / 2), [0x00B7, 0x2219])
    outer = max(per.contours, key=lambda c: (c.bounds[2] - c.bounds[0]) * (c.bounds[3] - c.bounds[1]))
    solid = pathops.Path()
    outer.draw(solid.getPen())
    big = scale_about(solid, 2.0, 2.0, px0, py0)
    add("bullet", move(big, 0, 420 - _center(big)[1]), 0x2022)
    # dashes: the hyphen, longer
    hy = G["hyphen"].path
    hx0, hy0, hx1, hy1 = bounds(hy)
    hw = hx1 - hx0
    add("endash", tf(hy, 820 / hw, 0, 0, 0.9, -hx0 * 820 / hw, 430 * 0.1), 0x2013)
    add("emdash", tf(hy, 1500 / hw, 0, 0, 0.85, -hx0 * 1500 / hw, 430 * 0.15), [0x2014, 0x2015])
    add("minus", tf(hy, 640 / hw, 0, 0, 1, -hx0 * 640 / hw, 120), 0x2212)
    # caret, tilde (ascii), bar, numbersign, dollar
    add("asciicircum", move(scale_about(M["circumflex"], 1.5), 300, CAP - 420), ord("^"))
    add("asciitilde", move(scale_about(M["tilde"], 1.3), 330, 380), ord("~"))
    l_ = G["l"].path
    lx0, ly0, lx1, ly1 = bounds(l_)
    add("bar", tf(l_, 1, 0, 0, (CAP + 560) / (ly1 - ly0), 0, -300 - ly0 * (CAP + 560) / (ly1 - ly0)), [ord("|"), 0x00A6])
    sl = G["slash"].path
    sx0, sy0, sx1, sy1 = bounds(sl)
    # two leaning strokes from the l, two bars from the hyphen
    lh = 1180
    st = tf(l_, 1, 0, 0, lh / (ly1 - ly0), -lx0, -ly0 * lh / (ly1 - ly0))
    st = rotate_about(st, -14, 0, 0)
    bar_ = tf(hy, 820 / hw, 0, 0, 0.95, -hx0 * 820 / hw, 0)
    _, by0_, _, by1_ = bounds(bar_)
    h1 = move(bar_, 40, 330 - (by0_ + by1_) / 2)
    h2 = move(bar_, 0, 760 - (by0_ + by1_) / 2)
    add("numbersign", union(move(st, 260, 40), move(st, 560, 40), h1, h2), ord("#"))
    S = G["S"].path
    Sx0, Sy0, Sx1, Sy1 = bounds(S)
    ss = scale_about(S, 0.86, 0.86, Sx0, Sy0)
    s0, sy, s1, sy1_ = bounds(ss)
    stem = tf(l_, 1, 0, 0, (sy1_ - sy + 300) / (ly1 - ly0), (s0 + s1) / 2 - lx0, sy - 150 - ly0 * (sy1_ - sy + 300) / (ly1 - ly0))
    add("dollar", union(ss, stem), ord("$"))
    # euro: C + two bars
    C = G["C"].path
    Cx0, Cy0, Cx1, Cy1 = bounds(C)
    b1 = tf(hy, 700 / hw, 0, 0, 0.85, Cx0 - 160 - hx0 * 700 / hw, 140)
    b2 = tf(hy, 640 / hw, 0, 0, 0.85, Cx0 - 160 - hx0 * 640 / hw, -60 + 0)
    add("Euro", union(move(C, 140, 0), move(b1, 0, 260 - 140), move(b2, 0, -40)), 0x20AC)
    # multiplication: the plus turned; fancy x mark reuses it larger
    pl = G["plus"].path
    add("multiply", rotate_about(scale_about(pl, 0.72), 45, *_center(scale_about(pl, 0.72))), [0x00D7])
    add("uni2715", rotate_about(scale_about(pl, 0.95), 45, *_center(scale_about(pl, 0.95))), [0x2715, 0x2716, 0x2717])
    # degree: the ring, raised
    add("degree", move(scale_about(M["ring"], 1.6), 220, CAP - 330), 0x00B0)
    # guillemets: the writer's < >, small and paired
    lt, gt = G["less"].path, G["greater"].path
    lt_s = scale_about(lt, 0.8, 0.8, *_center(lt))
    gt_s = scale_about(gt, 0.8, 0.8, *_center(gt))
    lx0_, ly0_, lx1_, ly1_ = bounds(lt_s)
    gx0_, gy0_, gx1_, gy1_ = bounds(gt_s)
    lt_s = move(lt_s, 0, 420 - (ly0_ + ly1_) / 2)
    gt_s = move(gt_s, 0, 420 - (gy0_ + gy1_) / 2)
    add("guilsinglleft", lt_s, 0x2039)
    add("guilsinglright", gt_s, 0x203A)
    add("guillemotleft", union(lt_s, move(lt_s, (lx1_ - lx0_) * 0.62, 0)), 0x00AB)
    add("guillemotright", union(gt_s, move(gt_s, (gx1_ - gx0_) * 0.62, 0)), 0x00BB)
    # arrows: hyphen shaft + chevron head
    head = scale_about(gt, 1.0, 1.0, *_center(gt))
    hdx0, hdy0, hdx1, hdy1 = bounds(head)
    shaft = tf(hy, 1150 / hw, 0, 0, 1.0, -hx0 * 1150 / hw, 0)
    shx0, shy0, shx1, shy1 = bounds(shaft)
    shaft = move(shaft, 0, 420 - (shy0 + shy1) / 2)
    head = move(head, shx1 - hdx1 + 20, 420 - (hdy0 + hdy1) / 2)
    right = union(shaft, head)
    rx0, ry0, rx1, ry1 = bounds(right)
    rc = ((rx0 + rx1) / 2, (ry0 + ry1) / 2)
    add("arrowright", right, 0x2192)
    add("arrowleft", rotate_about(right, 180, *rc), 0x2190)
    add("arrowup", rotate_about(right, 90, rc[0], rc[1]), 0x2191)
    add("arrowdown", rotate_about(right, -90, rc[0], rc[1]), 0x2193)
    add("arrowupright", rotate_about(right, 45, rc[0], rc[1]), 0x2197)
    add("arrowleftright", union(right, rotate_about(right, 180, *rc)), 0x2194)
    # inverted ! ?
    for nm, src, uni in (("exclamdown", "exclam", 0x00A1), ("questiondown", "question", 0x00BF)):
        q = G[src].path
        q = rotate_about(q, 180, *_center(q))
        qx0, qy0, qx1, qy1 = bounds(q)
        add(nm, move(q, 0, -qy0 - 380), uni)
    # copyright / registered: letter inside the writer's O
    O = G["O"].path
    Ox0, Oy0, Ox1, Oy1 = bounds(O)
    for nm, letter, uni in (("copyright", "C", 0x00A9), ("registered", "R", 0x00AE)):
        Lg = G[letter].path
        sc = 0.45
        Ls = scale_about(Lg, sc, sc, *_center(Lg))
        ring_ = scale_about(O, 0.95, 0.95, *_center(O))
        lc = _center(Ls)
        oc = _center(ring_)
        add(nm, union(ring_, move(Ls, oc[0] - lc[0], oc[1] - lc[1])), uni)
    # trademark: tiny TM
    T_, M_ = G["T"].path, G["M"].path
    t2 = scale_about(T_, 0.38, 0.38, 0, 0)
    m2 = scale_about(M_, 0.38, 0.38, 0, 0)
    tx0, ty0, tx1, ty1 = bounds(t2)
    mx0, my0, mx1, my1 = bounds(m2)
    add("trademark", union(move(t2, -tx0, CAP - 520), move(m2, tx1 - tx0 - mx0 + 40, CAP - 520)), 0x2122)
    # section sign: two s stacked
    s_ = G["s"].path
    s1_ = scale_about(s_, 0.8)
    s1x0, s1y0, s1x1, s1y1 = bounds(s1_)
    add("section", union(move(s1_, -s1x0, -s1y0 + 520), move(s1_, -s1x0 + 20, -s1y0 - 60)), 0x00A7)
    # check mark: the v, its right arm pulled long and high
    v = G["v"].path
    vx0, vy0, vx1, vy1 = bounds(v)
    vc = (vx0 + vx1) / 2
    arm_l = scale_about(intersect(v, rect(vx0 - 50, vy0 - 50, vc + 15, vy1 + 50)), 0.55, 0.55, vc, vy0)
    arm_r = scale_about(intersect(v, rect(vc - 15, vy0 - 50, vx1 + 50, vy1 + 50)), 1.45, 1.45, vc, vy0)
    add("checkmark", union(arm_l, arm_r), [0x2713, 0x2714])
    # pound: the L with a bar
    Lp = G["L"].path
    Lx0, Ly0, Lx1, Ly1 = bounds(Lp)
    add("sterling", union(Lp, tf(hy, 520 / hw, 0, 0, 0.9, Lx0 - 120 - hx0 * 520 / hw, 600 - 430 * 0.9 + 0)), 0x00A3)
    # æ œ Æ Œ: two letters fused
    for nm, l1, l2, uni, kind, ov in (("ae", "a", "e", 0x00E6, "lc", 0.18), ("oe", "o", "e", 0x0153, "lc", 0.16), ("AE", "A", "E", 0x00C6, "uc", 0.2), ("OE", "O", "E", 0x0152, "uc", 0.14)):
        p1, p2 = G[l1].path, G[l2].path
        a0, _, a1, _ = bounds(p1)
        b0, _, b1, _ = bounds(p2)
        add(nm, union(p1, move(p2, a1 - b0 - (a1 - a0) * ov, 0)), uni, kind)
    # ß: the writer's long-s (f with the bar removed is too narrow), built as
    # an ascender stem from l joined to the 3's bowls.
    three = G["three"].path
    tx0, ty0, tx1, ty1 = bounds(three)
    b3 = scale_about(three, 0.62, 0.70, tx0, ty0)
    b3x0, b3y0, b3x1, b3y1 = bounds(b3)
    stem2 = tf(l_, 1.0, 0, 0, (ASC - 120) / (ly1 - ly0), -lx0, -200 - ly0 * (ASC - 120) / (ly1 - ly0))
    st0, sty0, st1, sty1 = bounds(stem2)
    # an arch from the stem top into the bowl: top half of the o
    o = G["o"].path
    ox0, oy0, ox1, oy1 = bounds(o)
    arch = intersect(o, rect(ox0 - 10, (oy0 + oy1) / 2 + 30, ox1 + 10, oy1 + 10))
    arch = scale_about(arch, 0.62, 0.7, ox0, oy1)
    ax0, ay0, ax1, ay1 = bounds(arch)
    arch = move(arch, st0 - ax0 - 20, ASC - 80 - ay1)
    b3 = move(b3, st1 - b3x0 - 40, 0 - b3y0)
    add("germandbls", union(stem2, arch, b3), 0x00DF, "lc")
    # Ł ł Đ đ Ø ø
    add("Lslash", union(G["L"].path, move(M["stroke"], _ink_center(G["L"].path, 400, 900) - 40, 380)), 0x0141, "uc", base="L")
    add("lslash", union(G["l"].path, move(scale_about(M["stroke"], 0.9), _ink_center(G["l"].path, 600, 1000), 560)), 0x0142, "lc", base="l")
    D = G["D"].path
    Dx0, Dy0, Dx1, Dy1 = bounds(D)
    add("Dcroat", union(D, tf(hy, 380 / hw, 0, 0, 0.9, Dx0 - 120 - hx0 * 380 / hw, 230)), [0x0110, 0x00D0], "uc", base="D")
    d_ = G["d"].path
    add("dcroat", union(d_, tf(hy, 360 / hw, 0, 0, 0.9, _ink_right(d_, 1200, ASC) - 230 - hx0 * 360 / hw, ASC - 380 - 430 * 0.9)), 0x0111, "lc", base="d")
    sl = G["slash"].path
    for nm, base_, uni, kind in (("Oslash", "O", 0x00D8, "uc"), ("oslash", "o", 0x00F8, "lc")):
        B = G[base_].path
        Bx0, By0, Bx1, By1 = bounds(B)
        s_ = scale_about(sl, (By1 - By0 + 200) / (sy1 - sy0), (By1 - By0 + 200) / (sy1 - sy0))
        sx0_, sy0_, sx1_, sy1_ = bounds(s_)
        add(nm, union(B, move(s_, (Bx0 + Bx1) / 2 - (sx0_ + sx1_) / 2, By0 - 100 - sy0_)), uni, kind, base=base_)
    # Polish ż ź ś ć ń etc. come from COMPOSE; ı and ȷ above.
    # space
    add("space", pathops.Path(), [0x20], "space")
    add("nbspace", pathops.Path(), [0xA0], "space")
    add("thinspace", pathops.Path(), [0x2009, 0x202F], "space")


# ---------------------------------------------------------------------------
# variants
# ---------------------------------------------------------------------------

VARIANTS = {
    # name: (family, style, weight, outline transform)
    "zenhand-regular": ("Zenhand", "Regular", 400, lambda p: grow(p, 9)),
    "zenhand-bold": ("Zenhand", "Bold", 700, lambda p: grow(p, 44)),
    "zenhand-smooth-regular": ("Zenhand Smooth", "Regular", 400, lambda p: smooth_outline(p, sigma=13, grow_px=20 / RES, alphamax=1.2, opttol=1.4)),
    "zenhand-smooth-bold": ("Zenhand Smooth", "Bold", 700, lambda p: smooth_outline(p, sigma=14, grow_px=44 / RES, alphamax=1.2, opttol=1.4)),
}

LC_UNIT = 100
UC_UNIT = 118
DIGIT_UNIT = 100
PUNCT_SB = {
    "period": 55, "comma": 45, "colon": 60, "semicolon": 60, "ellipsis": 55, "exclam": 70,
    "question": 50, "hyphen": 50, "endash": 50, "emdash": 60, "quotesingle": 50, "quoteright": 40,
    "quoteleft": 40, "quotedbl": 50, "quotedblright": 40, "quotedblleft": 40, "quotesinglbase": 40,
    "quotedblbase": 40, "parenleft": 90, "parenright": 90, "bracketleft": 90, "bracketright": 90,
    "braceleft": 80, "braceright": 80, "slash": 10, "backslash": 10, "bar": 120,
}


def build_variant(key, base_glyphs, marks_src, master, specimen=False):
    family, style, weight, fn = VARIANTS[key]
    print(f"\n[{key}] transforming outlines")
    G = {n: Glyph(g.name, fn(g.path), list(g.unicodes), g.kind, base=g.base, zone=g.zone) for n, g in base_glyphs.items()}
    M = {n: fn(p) for n, p in marks_src.items()}
    # Re-centre marks at the origin after the transform (it grows them).
    for n, p in M.items():
        x0, y0, x1, y1 = bounds(p)
        M[n] = move(p, -(x0 + x1) / 2, -y0)
    weight_grow = 44 if weight == 700 else 9
    d = weight_grow * 0.35
    pre_x0 = {n: bounds(g.path)[0] for n, g in G.items()}

    print(f"[{key}] spacing")
    for n, g in G.items():
        if g.kind == "space":
            continue
        if g.base:
            continue
        if g.kind == "punct":
            sb = PUNCT_SB.get(n, 70) + (d * 0.5)
            xmin, ymin, xmax, ymax = bounds(g.path)
            g.path = move(g.path, sb - xmin, 0)
            g.adv = int(round(sb + (xmax - xmin) + sb))
            continue
        unit = {"lc": LC_UNIT, "uc": UC_UNIT, "digit": DIGIT_UNIT}[g.kind] + d
        space_glyph(g, unit)
    # tabular-ish digits: share the widest advance so numbers align in lists
    dig = [g for g in G.values() if g.kind == "digit"]
    wmax = max(g.adv for g in dig)
    for g in dig:
        x0, _, x1, _ = bounds(g.path)
        g.path = move(g.path, (wmax - g.adv) / 2, 0)
        g.adv = wmax
    # Derived glyphs (Ł, Ø, đ…) were drawn on top of their base before
    # spacing; move them by exactly what spacing moved the base.
    for g in G.values():
        if g.base:
            src = G[g.base]
            g.path = move(g.path, bounds(src.path)[0] - pre_x0[g.base], 0)
            g.adv = src.adv
    G["space"].adv = 520 + int(d)
    G["nbspace"].adv = G["space"].adv
    G["thinspace"].adv = 240

    print(f"[{key}] accents")
    composed = compose_accents(G, M)
    for name, (ch, base_name, mk) in composed.items():
        base = G[base_name]
        p = place_marks(G, M, base_name, mk, ch)
        adv = base.adv
        if mk == ["caron"] and base_name in ("d", "t", "l", "L"):
            x0, y0, x1, y1 = bounds(p)
            adv = max(adv, int(x1 + 30))
        G[name] = Glyph(name, p, [ord(ch)], base.kind, adv=adv, base=base_name)

    print(f"[{key}] kerning")
    letters_lc = [c for c in "abcdefghijklmnopqrstuvwxyz"]
    letters_uc = [c for c in "ABCDEFGHIJKLMNOPQRSTUVWXYZ"]
    punct = ["period", "comma", "hyphen", "quoteright", "quotedblright", "colon", "semicolon", "parenright", "exclam", "question", "endash", "emdash", "ellipsis"]
    punct_l = ["parenleft", "quoteleft", "quotedblleft", "quotedblbase", "hyphen", "endash", "emdash"]
    lefts = letters_lc + letters_uc + ["parenleft", "quoteleft", "quotedblleft", "quotedblbase", "hyphen"]
    rights = letters_lc + letters_uc + punct
    ref = _ref_gap(G)
    print(f"[{key}] reference gap {ref:.0f}")
    pairs = kern_pairs(G, lefts + ["quoteright", "quotedblright", "period", "comma"], rights + ["quoteright", "quotedblright"], ref, min_dist=0.62 * ref)
    print(f"[{key}] {len(pairs)} kern pairs")

    # classes: every composed glyph kerns like its base
    members: dict[str, list] = {}
    for n, g in G.items():
        b = g.base if g.base and g.base in G else n
        members.setdefault(b, []).append(n)
    for n in list(members):
        members[n] = sorted(set(members[n]))

    font = write_font(key, family, style, weight, G, pairs, members)
    return font, G


def _ref_gap(G):
    """Reference optical gap: the mean gap of straight-sided pairs."""
    vals = []
    for a, b in (("n", "n"), ("H", "H"), ("l", "n"), ("n", "l"), ("H", "n"), ("i", "n")):
        k = kern_pairs(G, [a], [b], 0.0, strength=-1.0, limit=(-9e9, 9e9), threshold=-1, min_dist=-1)
        vals.append(k.get((a, b), 0))
    return float(np.median(vals))


# ---------------------------------------------------------------------------
# font writing
# ---------------------------------------------------------------------------


def write_font(key, family, style, weight, G, pairs, members):
    order = [".notdef", "space"] + sorted(n for n in G if n not in ("space",))
    cmap = {}
    for n, g in G.items():
        for u in g.unicodes:
            cmap[u] = n
    fb = FontBuilder(UPM, isTTF=False)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap(cmap)
    charstrings = {}
    metrics = {}
    for n in order:
        if n == ".notdef":
            pen = T2CharStringPen(600, None)
            rect(80, 0, 520, CAP).draw(pen)
            charstrings[n] = pen.getCharString()
            metrics[n] = (600, 80)
            continue
        g = G[n]
        p = clone(g.path)
        if list(p.contours):
            p.simplify()
        pen = T2CharStringPen(g.adv, None)
        _draw_rounded(p, pen)
        charstrings[n] = pen.getCharString()
        x0 = bounds(p)[0] if list(p.contours) else 0
        metrics[n] = (int(g.adv), int(math.floor(x0)))
    ps = family.replace(" ", "") + "-" + style
    fb.setupCFF(ps, {"FullName": f"{family} {style}", "FamilyName": family, "Weight": style}, charstrings, {})
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=HHEA_ASC, descent=HHEA_DESC)
    fb.setupNameTable(
        {
            "familyName": family,
            "styleName": style,
            "uniqueFontIdentifier": f"{ps};5.0",
            "fullName": f"{family} {style}",
            "psName": ps,
            "version": "Version 5.000",
            "copyright": "Eliáš Bauer (zenbauhaus)",
            "designer": "Eliáš Bauer",
            "description": "Handwriting of Eliáš Bauer, rebuilt by scripts/build-zenhand.py",
        }
    )
    fb.setupOS2(
        usWeightClass=weight,
        sTypoAscender=HHEA_ASC,
        sTypoDescender=HHEA_DESC,
        sTypoLineGap=0,
        usWinAscent=2300,
        usWinDescent=980,
        sxHeight=XH,
        sCapHeight=CAP,
        fsSelection=(0x20 if weight >= 700 else 0x40) | 0x80,
        achVendID="ZNBH",
    )
    fb.setupPost()
    font = fb.font
    font["head"].macStyle = 1 if weight >= 700 else 0

    fea = feature_code(pairs, members, G)
    addOpenTypeFeaturesFromString(font, fea)
    OUT.mkdir(parents=True, exist_ok=True)
    otf = OUT / f"{key}.otf"
    font.save(str(otf))
    for flavor in ("woff2",):
        f2 = TTFont(str(otf))
        f2.flavor = flavor
        f2.save(str(OUT / f"{key}.{flavor}"))
        print(f"  wrote {OUT / f'{key}.{flavor}'} ({(OUT / f'{key}.{flavor}').stat().st_size:,} bytes)")
    return otf


def _draw_rounded(p, pen):
    """Draw with coordinates rounded to integers (CFF is happier)."""
    for verb, pts in p.segments:
        pts = [(round(x), round(y)) for x, y in pts]
        if verb == "moveTo":
            pen.moveTo(pts[0])
        elif verb == "lineTo":
            pen.lineTo(pts[0])
        elif verb == "curveTo":
            pen.curveTo(*pts)
        elif verb == "qCurveTo":
            pen.qCurveTo(*pts)
        elif verb == "closePath":
            pen.closePath()
        elif verb == "endPath":
            pen.endPath()


def feature_code(pairs, members, G):
    lines = ["languagesystem DFLT dflt;", "languagesystem latn dflt;", ""]
    used_l = sorted({l for l, _ in pairs})
    used_r = sorted({r for _, r in pairs})

    def cls(prefix, n):
        return f"@{prefix}_{n.replace('.', '_')}"

    for n in used_l:
        lines.append(f"{cls('L', n)} = [{' '.join(members.get(n, [n]))}];")
    for n in used_r:
        lines.append(f"{cls('R', n)} = [{' '.join(members.get(n, [n]))}];")
    lines.append("feature kern {")
    for (l, r), v in sorted(pairs.items()):
        lines.append(f"  pos {cls('L', l)} {cls('R', r)} {v};")
    lines.append("} kern;")
    if "a.ss01" in G:
        lines += [
            "feature ss01 {",
            '  featureNames { name "Original a"; };',
            "  sub a by a.ss01;",
            "} ss01;",
        ]
    return "\n".join(lines)


# ---------------------------------------------------------------------------


def main():
    if not shutil.which("potrace"):
        print("error: potrace not found (apt install potrace)", file=sys.stderr)
        sys.exit(1)
    master, _ = load_master()
    print("normalising master")
    base = build_base(master)
    marks = build_marks(master, base)
    build_extras(base, marks)
    only = [a for a in sys.argv[1:] if not a.startswith("--")]
    for key in VARIANTS:
        if only and key not in only:
            continue
        build_variant(key, base, marks, master)


if __name__ == "__main__":
    main()
