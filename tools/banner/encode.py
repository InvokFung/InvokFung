# Encodes the banner's layers as WebP: the scene, the sea band of each later frame (feathered at its
# top so it crossfades without a seam), the wisp and mist tiles, and the paper grain for the name.
# python3 tools/banner/encode.py tools/banner/layers
import sys, numpy as np
from PIL import Image
d = sys.argv[1]
Q = 90
bg = Image.open(f'{d}/f0.png').convert('RGB')
bg.save(f'{d}/bg.webp', 'WEBP', quality=Q, method=6)
H = bg.height; S = H / 400  # pixels per banner unit
top, bot = int(170 * S), int(372 * S)
ramp = int(18 * S)
for i in (1, 2, 3):
    im = np.asarray(Image.open(f'{d}/f{i}.png').convert('RGB'))[top:bot]
    a = np.full(im.shape[:2], 255, np.uint8)
    a[:ramp] = (np.linspace(0, 1, ramp) ** 1.5 * 255)[:, None].astype(np.uint8)
    a[-ramp:] = (np.linspace(1, 0, ramp) ** 1.5 * 255)[:, None].astype(np.uint8)
    Image.fromarray(np.dstack([im, a])).save(f'{d}/sea{i}.webp', 'WEBP', quality=Q, method=6, alpha_quality=60)
for k in ('w4', 'w9', 'mist'):
    Image.open(f'{d}/{k}.png').save(f'{d}/{k}.webp', 'WEBP', quality=80, method=6, alpha_quality=70)
r = np.random.default_rng(7); n = 96
v = (120 + r.random((n, n)) * 135).astype(np.uint8); a = (r.random((n, n)) * 46).astype(np.uint8)
Image.fromarray(np.dstack([v, v, v, a])).save(f'{d}/grain.webp', 'WEBP', lossless=True)
