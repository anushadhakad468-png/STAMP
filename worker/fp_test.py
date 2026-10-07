from pathlib import Path
from PIL import Image
from trustmark import TrustMark

tm = TrustMark(verbose=False, model_type='Q', encoding_type=TrustMark.Encoding.BCH_SUPER)
fp = tot = 0
for p in sorted(Path('imgs').glob('*.*')):
    im = Image.open(p).convert('RGB'); im.thumbnail((1024, 1024))
    for v in (im, im.resize((im.width // 2, im.height // 2)),
              im.crop((50, 50, im.width - 50, im.height - 50))):
        s, present, _ = tm.decode(v, MODE='binary')   # these were never stamped
        tot += 1; fp += int(bool(present))
print(f'false positives: {fp}/{tot}')
