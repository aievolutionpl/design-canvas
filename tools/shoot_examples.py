"""Screenshot example.html of every agent-design-taste style -> assets/styles/adt-XX.webp"""
import glob, os, io
from playwright.sync_api import sync_playwright
from PIL import Image
ADT = os.environ.get('ADT_DIR', '/home/aibot/.hermes/cache/scratch/adt')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1440, 'height': 900})
    for d in sorted(glob.glob(ADT + '/styles/[0-9]*')):
        num = os.path.basename(d)[:2]
        pg.goto('file://' + d + '/example.html', wait_until='networkidle', timeout=45000)
        pg.wait_for_timeout(800)
        im = Image.open(io.BytesIO(pg.screenshot())).convert('RGB')
        out = f'{ROOT}/assets/styles/adt-{num}'
        im.save(out + '.webp', 'WEBP', quality=75, method=6)
        t = im.copy(); t.thumbnail((640, 640)); t.save(out + '-sm.webp', 'WEBP', quality=72, method=6)
        print(num, 'ok')
    b.close()
