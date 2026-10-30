#!/usr/bin/env python3
"""Generate the tileable paper texture used by <PaperBackdrop />.

    python3 scripts/gen-paper.py

Writes two seamless greyscale tiles centred on 50% grey, meant for
`mix-blend-mode: soft-light` (50% grey is a no-op, darker darkens, lighter
lightens), so one asset works on the cream page and the dark blueprint:

  public/paper/tooth.webp   512px  fine tooth + felt + a few fibres, embossed
  public/paper/cloud.webp   256px  slow mottling, shown ~7x enlarged

Paper reads as paper because of relief, not speckle: a height field of
fibres and tooth is lit from the top-left, the way the sheet catches a
desk lamp. Everything wraps at the tile edge, so the layer can repeat
down a document of any length without a seam.

Requires: pip install numpy pillow scipy
"""

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "paper"
rng = np.random.default_rng(7)


def periodic_noise(size: int, cell: int, octaves: int, persistence=0.5) -> np.ndarray:
    """Tileable value-noise fbm: random lattices upsampled with wrap."""
    acc = np.zeros((size, size))
    amp, norm = 1.0, 0.0
    for o in range(octaves):
        n = max(1, size // max(1, cell >> o))
        lattice = rng.random((n, n))
        z = ndimage.zoom(lattice, size / n, order=3, mode="grid-wrap", grid_mode=True)
        acc += amp * z[:size, :size]
        norm += amp
        amp *= persistence
    acc /= norm
    return (acc - acc.min()) / (acc.max() - acc.min())


def fibres(size: int, count: int) -> np.ndarray:
    """Short soft strokes at random angles, drawn with wrap-around."""
    canvas = np.zeros((size, size))
    for _ in range(count):
        length = rng.uniform(5, 24)
        ang = rng.uniform(0, np.pi)
        # laid paper: a weak bias toward one direction
        if rng.random() < 0.35:
            ang = rng.normal(0.08, 0.18)
        x0, y0 = rng.uniform(0, size, 2)
        steps = int(length * 2)
        t = np.linspace(0, 1, steps)
        bend = rng.normal(0, 0.7)
        xs = x0 + np.cos(ang + bend * t) * length * t
        ys = y0 + np.sin(ang + bend * t) * length * t
        w = rng.uniform(0.15, 0.6) * (1 if rng.random() < 0.7 else -0.6)
        xi = np.mod(np.round(xs).astype(int), size)
        yi = np.mod(np.round(ys).astype(int), size)
        np.add.at(canvas, (yi, xi), w)
    return ndimage.gaussian_filter(canvas, 0.7, mode="wrap")


def emboss(h: np.ndarray, strength: float) -> np.ndarray:
    gy, gx = np.gradient(h)
    # wrap the gradient at the seams
    gx[:, 0] = (h[:, 1] - h[:, -1]) / 2
    gx[:, -1] = (h[:, 0] - h[:, -2]) / 2
    gy[0, :] = (h[1, :] - h[-1, :]) / 2
    gy[-1, :] = (h[0, :] - h[-2, :]) / 2
    nx, ny, nz = -gx * strength, -gy * strength, np.ones_like(h)
    inv = 1 / np.sqrt(nx * nx + ny * ny + nz * nz)
    light = np.array([-0.55, -0.6, 0.58])
    light /= np.linalg.norm(light)
    return (nx * light[0] + ny * light[1] + nz * light[2]) * inv


def to_grey(v: np.ndarray, contrast: float) -> Image.Image:
    v = v - np.median(v)
    v = 0.5 + v * contrast
    return Image.fromarray((np.clip(v, 0, 1) * 255).astype(np.uint8), "L")


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    size = 512
    # cold-press tooth: bumps a few px across, plus a felted mid scale
    tooth = periodic_noise(size, 4, 3, 0.6)
    felt = periodic_noise(size, 16, 3, 0.5)
    grain = ndimage.gaussian_filter(rng.random((size, size)), 0.8, mode="wrap")
    fib = fibres(size, 700)
    soft = periodic_noise(size, 64, 2)
    height = tooth * 1.1 + felt * 0.9 + fib * 0.9 + soft * 1.0 + grain * 0.5
    shade = emboss(height, 2.6)
    tex = shade - shade.mean() + (felt - 0.5) * 0.04
    to_grey(tex, 1.15).save(OUT / "tooth.webp", quality=62, method=6)

    csize = 256
    cloud = periodic_noise(csize, 64, 4, 0.55)
    cloud = ndimage.gaussian_filter(cloud, 2, mode="wrap")
    to_grey(cloud, 0.32).save(OUT / "cloud.webp", quality=80, method=6)

    for f in ("tooth.webp", "cloud.webp"):
        print(f"  wrote public/paper/{f} ({(OUT / f).stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
