#!/usr/bin/env python3
"""compare.py <siteDir> <variant> -> writes <siteDir>/<variant>/parity.json and sidebyside-<variant>.png
Uses shots/original-{desktop,mobile}.png vs shots/<variant>-rebuilt-{desktop,mobile}.png (+ -text.txt)."""
import sys, json, re, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from skimage.metrics import structural_similarity as ssim
from skimage.filters import sobel, gaussian

Image.MAX_IMAGE_PIXELS = None
site, variant = sys.argv[1], sys.argv[2]
shots = os.path.join(site, "shots")

def load(p):
    return Image.open(p).convert("RGB")

def to_common(a, b, width):
    def scale(im):
        h = max(1, round(im.height * width / im.width))
        return im.resize((width, h), Image.LANCZOS)
    a, b = scale(a), scale(b)
    H = max(a.height, b.height)
    def pad(im):
        c = Image.new("RGB", (width, H), (255, 255, 255)); c.paste(im, (0, 0)); return c
    return pad(a), pad(b), a.height, b.height

def metrics(o, r, width, fold_px):
    a, b, ha, hb = to_common(o, r, width)
    ga = np.asarray(a.convert("L"), dtype=np.float64); gb = np.asarray(b.convert("L"), dtype=np.float64)
    full = ssim(ga, gb, data_range=255)
    fold = min(ga.shape[0], fold_px)
    fo = ssim(ga[:fold], gb[:fold], data_range=255)
    ea = sobel(gaussian(ga / 255.0, sigma=0.8)); eb = sobel(gaussian(gb / 255.0, sigma=0.8))
    rng = max(float(ea.max()), float(eb.max()), 1e-6)
    edge_full = ssim(ea, eb, data_range=rng)
    edge_fold = ssim(ea[:fold], eb[:fold], data_range=rng)
    diff = np.abs(np.asarray(a, dtype=np.int16) - np.asarray(b, dtype=np.int16)).mean() / 255.0
    return {"edge_ssim_full": round(float(edge_full), 4), "edge_ssim_fold": round(float(edge_fold), 4), "ssim_full": round(float(full), 4), "ssim_fold": round(float(fo), 4), "mean_abs_pixel_diff": round(float(diff), 4), "height_ratio": round(hb / ha, 3), "orig_h": o.height, "rebuilt_h": r.height}

def words(path):
    try:
        t = open(path, encoding="utf8", errors="ignore").read().lower()
    except Exception:
        return []
    return re.findall(r"[a-z0-9][a-z0-9'’@.\-]{2,}", t)

out = {}
for dev, width, fold in (("desktop", 360, 225), ("mobile", 195, 211)):
    o = os.path.join(shots, f"original-{dev}.png"); r = os.path.join(shots, f"{variant}-rebuilt-{dev}.png")
    if os.path.exists(o) and os.path.exists(r):
        out[dev] = metrics(load(o), load(r), width, fold)
ow = set(words(os.path.join(shots, "original-text.txt"))); rw = set(words(os.path.join(shots, f"{variant}-rebuilt-text.txt")))
out["text_recall"] = round(len(ow & rw) / len(ow), 3) if ow else None
out["text_precision"] = round(len(ow & rw) / len(rw), 3) if rw else None
out["orig_unique_words"] = len(ow); out["rebuilt_unique_words"] = len(rw)

d = out.get("desktop", {})
m = out.get("mobile", {})
rec = out["text_recall"] or 0
es = d.get("edge_ssim_full", 0); ef = d.get("edge_ssim_fold", 0); hr = d.get("height_ratio", 0); mh = m.get("height_ratio", 0)
if rec >= 0.90 and es >= 0.60 and ef >= 0.60 and 0.85 <= hr <= 1.15 and 0.7 <= mh <= 1.4: rating = "High"
elif rec >= 0.70 and es >= 0.35 and ef >= 0.35 and 0.65 <= hr <= 1.5: rating = "Medium"
else: rating = "Low"
out["auto_rating"] = rating
out["rating_rule"] = "High: text recall>=0.90 & desktop edge-SSIM full>=0.60 & fold>=0.60 & desktop height ratio 0.85-1.15 & mobile height ratio 0.7-1.4; Medium: recall>=0.70 & edge-SSIM>=0.35 (full and fold) & height ratio 0.65-1.5; else Low. Plain SSIM is also reported but is not used (near-blank white pages score ~0.8 against anything)."
vdir = os.path.join(site, variant); os.makedirs(vdir, exist_ok=True)
json.dump(out, open(os.path.join(vdir, "parity.json"), "w"), indent=2)

# side-by-side image
def panel(dev, maxh, w):
    o = os.path.join(shots, f"original-{dev}.png"); r = os.path.join(shots, f"{variant}-rebuilt-{dev}.png")
    ims = []
    for p in (o, r):
        if os.path.exists(p):
            im = load(p); h = round(im.height * w / im.width); im = im.resize((w, h), Image.LANCZOS)
            ims.append(im.crop((0, 0, w, min(h, maxh))))
        else:
            ims.append(Image.new("RGB", (w, 100), (240, 200, 200)))
    return ims
dw, mw, maxh, gap, top = 640, 220, 1800, 12, 28
d_o, d_r = panel("desktop", maxh, dw); m_o, m_r = panel("mobile", maxh, mw)
W = dw * 2 + mw * 2 + gap * 5
H = top + max(d_o.height, d_r.height, m_o.height, m_r.height)
canvas = Image.new("RGB", (W, H), (255, 255, 255)); dr = ImageDraw.Draw(canvas)
x = gap
for lab, im, w in (("ORIGINAL desktop 1440", d_o, dw), (f"REBUILT ({variant}) desktop", d_r, dw), ("ORIGINAL mobile 390", m_o, mw), (f"REBUILT ({variant}) mobile", m_r, mw)):
    dr.text((x, 8), lab, fill=(0, 0, 0)); canvas.paste(im, (x, top)); dr.rectangle((x - 1, top - 1, x + w, top + im.height), outline=(200, 0, 0)); x += w + gap
canvas.save(os.path.join(vdir, f"sidebyside-{variant}.png"))
print(json.dumps({"rating": rating, "edge_ssim": d.get("edge_ssim_full"), "ssim_desktop": d.get("ssim_full"), "recall": out["text_recall"], "height_ratio": hr}))
