import io, random
from pathlib import Path
import cv2, numpy as np
from PIL import Image, ImageFilter
import imagehash
from imwatermark import WatermarkEncoder, WatermarkDecoder

NBITS = 40
OUT = Path('out'); OUT.mkdir(exist_ok=True)

# ---------- helpers ----------
def pil2bgr(im): return cv2.cvtColor(np.array(im), cv2.COLOR_RGB2BGR)
def bgr2pil(a):  return Image.fromarray(cv2.cvtColor(a, cv2.COLOR_BGR2RGB))

def jpeg(img, q):
    buf = io.BytesIO(); img.save(buf, 'JPEG', quality=q); buf.seek(0)
    return Image.open(buf).convert('RGB')

def crop20(img):  # keep centre 80% of width and height
    w, h = img.size
    return img.crop((int(w*.1), int(h*.1), w - int(w*.1), h - int(h*.1)))

def screenshot(img):  # shrink + blur + recompress
    s = img.resize((int(img.width*.75), int(img.height*.75)), Image.BILINEAR)
    return jpeg(s.filter(ImageFilter.GaussianBlur(1)), 70)

TRANSFORMS = {
    'none':          lambda im: im,
    'jpeg_q40':      lambda im: jpeg(im, 40),
    'resize_50':     lambda im: im.resize((im.width // 2, im.height // 2), Image.LANCZOS),
    'crop_20':       crop20,
    'screenshot':    screenshot,
    'crop+jpeg40':   lambda im: jpeg(crop20(im), 40),
    'ALL_3 (yours)': lambda im: jpeg(crop20(im.resize((im.width // 2, im.height // 2))), 40),
}

# ---------- watermark methods ----------
def iw(method):
    def embed(im, bits):
        e = WatermarkEncoder(); e.set_watermark('bits', bits)
        return bgr2pil(e.encode(pil2bgr(im), method))
    def extract(im, n):
        return [int(x) for x in WatermarkDecoder('bits', n).decode(pil2bgr(im), method)]
    return embed, extract

# name -> (embed, extract, resize_back_to_original_before_decoding)
METHODS = {
    'dwtDct':    (*iw('dwtDct'), True),
    'dwtDctSvd': (*iw('dwtDctSvd'), True),
}

try:
    from trustmark import TrustMark
    tm = TrustMark(verbose=False, model_type='Q', encoding_type=TrustMark.Encoding.BCH_SUPER)
    def tm_embed(im, bits):
        return tm.encode(im, ''.join(map(str, bits)), MODE='binary').convert('RGB')
    def tm_extract(im, n):
        s, present, _ = tm.decode(im, MODE='binary')
        return [int(c) for c in s] if present and len(s) == n else None
    METHODS['trustmark'] = (tm_embed, tm_extract, False)
except ImportError:
    print('trustmark not installed, skipping it')

# ---------- pHash bands (8 bands x 8 bits: guaranteed hit up to Hamming 7) ----------
def bands(h, n=8):
    bits = h.hash.flatten().astype(int); k = 64 // n
    return [tuple(bits[i*k:(i+1)*k]) for i in range(n)]

# ---------- run ----------
paths = sorted(Path('imgs').glob('*.*')) or [Path('test_image.jpg')]
wm = {t: {m: [0, []] for m in METHODS} for t in TRANSFORMS}   # exact matches, bit accuracies
ph = {t: {'ham': [], 'band': 0} for t in TRANSFORMS}
refs = []

for p in paths:
    cover = Image.open(p).convert('RGB'); cover.thumbnail((1024, 1024))
    bits = [random.randint(0, 1) for _ in range(NBITS)]

    ref = imagehash.phash(cover); refs.append(ref)
    for t, fn in TRANSFORMS.items():
        h = imagehash.phash(fn(cover))
        ph[t]['ham'].append(ref - h)
        ph[t]['band'] += int(any(a == b for a, b in zip(bands(ref), bands(h))))

    for m, (embed, extract, rescale) in METHODS.items():
        stamped = embed(cover, bits)
        stamped.save(OUT / f'{p.stem}_{m}.png')          # lossless save
        for t, fn in TRANSFORMS.items():
            attacked = fn(stamped)
            if rescale:
                attacked = attacked.resize(stamped.size, Image.LANCZOS)
            try:    got = extract(attacked, NBITS)
            except Exception: got = None
            if got is None: exact, acc = 0, 0.5           # no info = coin flip
            else:           exact, acc = int(got == bits), float(np.mean(np.array(got) == np.array(bits)))
            wm[t][m][0] += exact; wm[t][m][1].append(acc)

n = len(paths)
print(f'\nimages: {n}   (bit accuracy ~50% = watermark destroyed)\n')
print(f"{'transform':<15}" + ''.join(f'{m:<18}' for m in METHODS) + 'pHash median Hamming | band hits')
for t in TRANSFORMS:
    cells = ''.join(f"{wm[t][m][0]}/{n} {100*np.mean(wm[t][m][1]):.0f}%".ljust(18) for m in METHODS)
    med = sorted(ph[t]['ham'])[n // 2]
    print(f'{t:<15}{cells}{med:<22}| {ph[t]["band"]}/{n}')

if n > 1:
    print('\nunrelated-image pHash distances (your "no match" baseline):',
          [refs[i] - refs[j] for i in range(n) for j in range(i + 1, n)])