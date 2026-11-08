"""data/backgrounds.json (code-generated CSS backgrounds), data/gallery.json (trend images + dims),
and font weight specs for the Google Fonts CSS2 URL (data/font-check.json -> specs)."""
import json, os, glob, urllib.request, urllib.parse
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
NOISE = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .55 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"
WAVES = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='40'><path d='M0 20 Q30 0 60 20 T120 20' fill='none' stroke='%232457D6' stroke-opacity='.35' stroke-width='2'/></svg>\")"
BG = [
 ('mesh-pastel','Mesh pastelowy','gradient','radial-gradient(at 18% 22%, #ffd6e0 0, transparent 55%), radial-gradient(at 82% 18%, #cfe3ff 0, transparent 50%), radial-gradient(at 60% 85%, #d8f5e3 0, transparent 55%), #fbf7f2'),
 ('aurora','Zorza (aurora)','gradient','radial-gradient(ellipse 80% 50% at 20% 0%, rgba(56,189,148,.55), transparent 60%), radial-gradient(ellipse 70% 60% at 85% 10%, rgba(59,130,246,.5), transparent 60%), radial-gradient(ellipse 60% 50% at 50% 100%, rgba(236,72,153,.35), transparent 60%), #0b1220'),
 ('grain-warm','Ziarno na kremie','tekstura',NOISE+', #efe6d8'),
 ('grain-dark','Ziarno grafitowe','tekstura',NOISE+', linear-gradient(160deg,#25272c,#141518)'),
 ('grid-lines','Siatka linii','wzór','linear-gradient(#e2e5ea 1px, transparent 1px) 0 0/32px 32px, linear-gradient(90deg, #e2e5ea 1px, transparent 1px) 0 0/32px 32px, #ffffff'),
 ('dot-grid','Siatka kropek','wzór','radial-gradient(#b9bec8 1.2px, transparent 1.4px) 0 0/22px 22px, #f5f6f8'),
 ('blueprint','Blueprint','wzór','linear-gradient(rgba(255,255,255,.18) 1px, transparent 1px) 0 0/100px 100px, linear-gradient(90deg, rgba(255,255,255,.18) 1px, transparent 1px) 0 0/100px 100px, linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px) 0 0/20px 20px, linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px) 0 0/20px 20px, #1d4ed8'),
 ('graph-paper','Papier milimetrowy','wzór','linear-gradient(rgba(220,90,70,.25) 1px, transparent 1px) 0 0/50px 50px, linear-gradient(90deg, rgba(220,90,70,.25) 1px, transparent 1px) 0 0/50px 50px, linear-gradient(rgba(220,90,70,.1) 1px, transparent 1px) 0 0/10px 10px, linear-gradient(90deg, rgba(220,90,70,.1) 1px, transparent 1px) 0 0/10px 10px, #fffdf6'),
 ('conic-sunset','Zachód (conic)','gradient','conic-gradient(from 210deg at 50% 110%, #ff7a59, #ffb35c, #ffd98a, #f7a8c4, #8f7cf7, #ff7a59)'),
 ('spotlight','Reflektor','gradient','radial-gradient(circle at 50% 30%, #3a3f4b 0, #16181d 60%, #0c0d10 100%)'),
 ('glass-blobs','Szkło na plamach','szkło','linear-gradient(rgba(255,255,255,.28), rgba(255,255,255,.28)), radial-gradient(circle at 25% 30%, #7c3aed 0 18%, transparent 19%), radial-gradient(circle at 70% 65%, #06b6d4 0 22%, transparent 23%), radial-gradient(circle at 80% 20%, #f472b6 0 12%, transparent 13%), #eef0ff'),
 ('stripes','Ukośne pasy','wzór','repeating-linear-gradient(45deg, #111 0 14px, #ffd400 14px 28px)'),
 ('checker','Szachownica','wzór','conic-gradient(#e9e9ee 25%, #fff 0 50%, #e9e9ee 0 75%, #fff 0) 0 0/40px 40px'),
 ('paper','Papier','tekstura',NOISE+', radial-gradient(circle at 30% 20%, #fffaf0, #f1e7d3)'),
 ('waves','Fale (SVG)','wzór',WAVES+' 0 0/120px 40px, #f4f7ff'),
 ('topo','Warstwice','wzór','repeating-radial-gradient(circle at 30% 40%, transparent 0 18px, rgba(30,64,175,.25) 18px 19px), repeating-radial-gradient(circle at 75% 70%, transparent 0 24px, rgba(234,88,12,.22) 24px 25px), #f8f5ee'),
 ('halftone','Raster (halftone)','wzór','radial-gradient(circle, #ef4444 35%, transparent 37%) 0 0/14px 14px, radial-gradient(circle, #ef4444 20%, transparent 22%) 7px 7px/14px 14px, #fff5f0'),
 ('duotone','Duotone','gradient','linear-gradient(135deg, #d9f356 0%, #2b1a6b 100%)'),
 ('holo','Holograficzny','gradient','linear-gradient(115deg, #ffd1ff 0%, #c2f0ff 25%, #fff6b7 50%, #c8ffd4 75%, #e0c3fc 100%)'),
 ('mesh-dark','Ciemny mesh','gradient','radial-gradient(at 0% 0%, #1e3a8a 0, transparent 50%), radial-gradient(at 100% 0%, #065f46 0, transparent 50%), radial-gradient(at 100% 100%, #7c2d12 0, transparent 50%), #0a0a0b'),
 ('riso','Riso (przesunięcie)','tekstura',NOISE+', radial-gradient(circle at 38% 45%, rgba(255,72,176,.85) 0 22%, transparent 22.5%), radial-gradient(circle at 46% 52%, rgba(0,120,191,.8) 0 22%, transparent 22.5%), #f6f1e6'),
 ('carbon','Włókno węglowe','wzór','linear-gradient(27deg, #151515 5px, transparent 5px) 0 5px, linear-gradient(207deg, #151515 5px, transparent 5px) 10px 0, linear-gradient(27deg, #222 5px, transparent 5px) 0 10px, linear-gradient(207deg, #222 5px, transparent 5px) 10px 5px, linear-gradient(90deg, #1b1b1b 10px, transparent 10px), linear-gradient(#1d1d1d 25%, #1a1a1a 25%, #1a1a1a 50%, transparent 50%, transparent 75%, #242424 75%, #242424); background-size: 20px 20px'),
 ('linen','Len (kreskowanie)','tekstura','repeating-linear-gradient(0deg, rgba(120,100,70,.08) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(120,100,70,.08) 0 1px, transparent 1px 3px), #efe8dc'),
 ('clay','Glina pastelowa','gradient','radial-gradient(circle at 30% 25%, #ffe3d3 0, transparent 45%), radial-gradient(circle at 75% 70%, #d9e8ff 0, transparent 50%), linear-gradient(160deg, #f6efe9, #ece6f6)'),
]
bgs = []
for id_, name, cat, css in BG:
    if '; background-size' in css:
        val, size = css.split('; background-size: ')
        bgs.append({'id': id_, 'name': name, 'category': cat, 'css': 'background: ' + val + ';\nbackground-size: ' + size + ';', 'style': {'background': val, 'backgroundSize': size}})
    else:
        bgs.append({'id': id_, 'name': name, 'category': cat, 'css': 'background: ' + css + ';', 'style': {'background': css}})
json.dump(bgs, open(f'{ROOT}/data/backgrounds.json', 'w'), ensure_ascii=False, indent=1)

gal = []
for p in sorted(glob.glob(f'{ROOT}/assets/styles/trends-*.webp')):
    if p.endswith('-sm.webp'): continue
    w, h = Image.open(p).size
    slug = os.path.basename(p)[7:-5]
    gal.append({'id': slug, 'name': slug.replace('-', ' ').capitalize(), 'image': 'assets/styles/' + os.path.basename(p), 'w': w, 'h': h})
for s in json.load(open(f'{ROOT}/data/styles.json')):
    pass
json.dump(gal, open(f'{ROOT}/data/gallery.json', 'w'), ensure_ascii=False, indent=1)

fc = json.load(open(f'{ROOT}/data/font-check.json'))
specs = []
for fam in fc['families']:
    for spec in (fam + ':wght@400;700', fam + ':wght@400', fam):
        url = 'https://fonts.googleapis.com/css2?family=' + urllib.parse.quote(spec, safe=':@;') + '&display=swap'
        try:
            urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=20).read()
            specs.append(spec); break
        except Exception:
            continue
fc['specs'] = specs
json.dump(fc, open(f'{ROOT}/data/font-check.json', 'w'), ensure_ascii=False, indent=1)
# image dims for styles
st = json.load(open(f'{ROOT}/data/styles.json'))
for s in st:
    w, h = Image.open(os.path.join(ROOT, s['image'])).size
    s['imageW'], s['imageH'] = w, h
json.dump(st, open(f'{ROOT}/data/styles.json', 'w'), ensure_ascii=False, indent=1)
print('bgs', len(bgs), 'gallery', len(gal), 'specs', len(specs), [s for s in specs if '700' not in s])
