#!/usr/bin/env python3
"""Build data/*.json for design-canvas from the two real source repos.

Sources:
  ADT  = clone of github.com/aievolutionpl/agent-design-taste   (env ADT_DIR)
  DT27 = local repo aievolutionpl/design-trends-2027            (env DT27_DIR)
Nothing is invented: style facts come from the source files. Two derived fields are
explicitly labelled in the JSON:
  * trend palettes  -> "paletteSource": "sampled" (PIL median-cut on the AI visualisation)
  * trend fonts     -> "fontsSource": "suggested" (Google Fonts pairing chosen to match the
                       source's verbal typography description; the source names no fonts)
"""
import json, os, re, glob, urllib.request, urllib.parse
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ADT = os.environ.get('ADT_DIR', '/home/aibot/.hermes/cache/scratch/adt')
DT27 = os.environ.get('DT27_DIR', '/home/aibot/.hermes/projects/design-trends-2027')
OUT = os.path.join(ROOT, 'data')


def first_family(stack):
    m = re.match(r"\s*'([^']+)'", stack or '')
    return m.group(1) if m else None


def section(md, title_regex):
    m = re.search(r'^## \d+ · ' + title_regex + r'.*?$\n(.*?)(?=^## |\Z)', md, re.M | re.S)
    return m.group(1).strip() if m else ''


def bullets(txt, n=5):
    out = []
    for line in txt.splitlines():
        line = line.strip()
        if line.startswith(('- ', '* ')):
            out.append(re.sub(r'\*\*|`', '', line[2:]).strip())
    return out[:n]


def plain(txt):
    return re.sub(r'\*\*|`|\*', '', txt).strip()


def adt_styles():
    idx = json.load(open(os.path.join(ADT, 'styles/index.json')))
    res = []
    for s in idx['styles']:
        d = os.path.join(ADT, s['path'])
        tok = json.load(open(os.path.join(d, 'tokens.json')))
        md = open(os.path.join(d, 'README.md')).read()
        pr = open(os.path.join(d, 'prompts.md')).read()
        css = open(os.path.join(d, 'tokens.css')).read()
        lt = tok['light']
        fonts = {k: first_family(v) for k, v in lt.get('fonts', {}).items() if first_family(v)}
        overview = plain(section(md, 'Overview').split('\n\n')[0])
        principles = plain(section(md, 'Visual principles').split('\n\n')[0])
        signature = plain(section(md, 'Signature move').split('\n\n')[0])
        when = plain(section(md, 'When to use').split('\n\n')[0])
        typo = section(md, 'Typography')
        rec = re.search(r'Recommended families \(Google Fonts\):\*\*\s*(.+)', typo)
        prompts = {}
        for m in re.finditer(r'^## (\w+)\s*\n```\w*\n(.*?)```', pr, re.M | re.S):
            prompts[m.group(1)] = m.group(2).strip()
        res.append({
            'id': 'ADT-' + s['id'], 'num': s['id'], 'source': 'agent-design-taste',
            'sourceUrl': f"https://github.com/aievolutionpl/agent-design-taste/tree/main/{s['path']}",
            'name': s['name'], 'tagline': s.get('identity', ''), 'aliases': s.get('aliases', []),
            'category': 'UI / web',
            'description': overview, 'principles': principles, 'signature': signature,
            'whenToUse': when, 'recommendedFor': s.get('recommendedFor', []),
            'supporting': ['ADT-' + x for x in s.get('supportingStyles', [])],
            'incompatible': ['ADT-' + x for x in s.get('incompatibleWith', [])],
            'do': bullets(section(md, r'Do\b'), 4), 'dont': bullets(section(md, r"Don't"), 4),
            'colors': lt['colors'], 'colorsDark': tok.get('dark', {}).get('colors', {}),
            'paletteSource': 'tokens',
            'fonts': fonts, 'fontsSource': 'tokens',
            'fontsRecommended': plain(rec.group(1)) if rec else '',
            'fontSizes': lt.get('fontSizes', {}), 'radius': lt.get('radius', {}),
            'shadows': lt.get('shadows', {}),
            'tokensCss': css,
            'prompt': prompts.get('Claude') or next(iter(prompts.values()), ''),
            'image': f"assets/styles/adt-{s['id']}.webp" if os.path.exists(os.path.join(ROOT, f"assets/styles/adt-{s['id']}.webp")) else None,
            'imageNote': 'Zrzut example.html z repo agent-design-taste',
        })
    return res


# verbal typography -> Google Fonts suggestion (display, sans). Keyword order matters.
TYPO_MAP = [
    (r'monospace', ('Space Mono', 'IBM Plex Sans')),
    (r'zaokrąglon|przyjazny display', ('Fredoka', 'Nunito Sans')),
    (r'elegancki szeryf|redakcyjny szeryf|oszczędny szeryf', ('Newsreader', 'Inter')),
    (r'ekspresyjny szeryf', ('Fraunces', 'Karla')),
    (r'dekoracyjny display', ('Playfair Display', 'Archivo')),
    (r'geometryczny display', ('Syne', 'DM Sans')),
    (r'charakterystyczny krój nagłówka', ('Bricolage Grotesque', 'Inter')),
    (r'ciężki grotesk|masywny nagłówek', ('Archivo Black', 'Space Grotesk')),
    (r'wyrazisty grotesk|mocny sans|mocny prosty', ('Anton', 'Inter')),
    (r'techniczny sans', ('Space Grotesk', 'IBM Plex Mono')),
    (r'premium', ('Cormorant Garamond', 'Manrope')),
    (r'nietypowy nagłówek', ('Rubik Mono One', 'Work Sans')),
    (r'zwarty sans', ('Barlow Condensed', 'Barlow')),
    (r'precyzyjny', ('Inter Tight', 'IBM Plex Mono')),
    (r'wyrazisty nagłówek', ('Unbounded', 'Inter')),
    (r'.', ('Inter', 'Inter')),
]


def sample_palette(path, n=6):
    im = Image.open(path).convert('RGB')
    im.thumbnail((200, 200))
    q = im.quantize(colors=n, method=Image.Quantize.MEDIANCUT)
    pal = q.getpalette()[:n * 3]
    counts = sorted(q.getcolors(), reverse=True)
    out = []
    for cnt, i in counts:
        r, g, b = pal[i * 3:i * 3 + 3]
        out.append('#%02X%02X%02X' % (r, g, b))
    return out


def dt27_styles():
    md = open(os.path.join(DT27, 'README.md')).read()
    rec = open(os.path.join(DT27, 'skills/design-trends-2027/references/application-recipes.md')).read()
    blocks = re.split(r'^### ', md, flags=re.M)[1:]
    res = []
    for b in blocks:
        m = re.match(r'(\d\d)\. (.+)', b)
        if not m:
            continue
        num, name = m.group(1), m.group(2).strip()
        def f(label):
            mm = re.search(r'\*\*' + label + r':\*\*\s*(.+?)(?=\s\*\*|\n|$)', b)
            return mm.group(1).strip() if mm else ''
        pm = re.search(r'<a id="styl-' + num + r'"></a>.*?```text\n(.*?)```', rec, re.S)
        typo = f('Typografia')
        disp, sans = next(v for k, v in TYPO_MAP if re.search(k, typo))
        img = os.path.join(DT27, f'assets/style-{num}.png')
        res.append({
            'id': 'DT27-' + num, 'num': num, 'source': 'design-trends-2027',
            'sourceUrl': f'https://github.com/aievolutionpl/design-trends-2027#{num}-' + re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-'),
            'name': name, 'tagline': f('Podstawy'), 'aliases': [],
            'category': 'Trend wizualny 2027',
            'description': f('Podstawy'), 'whenToUse': f('Kiedy używać'),
            'composition': f('Kompozycja'), 'colorText': f('Kolor'), 'typographyText': typo,
            'materials': f('Materiały'), 'avoid': f('Unikać'),
            'palette': sample_palette(img), 'paletteSource': 'sampled',
            'fonts': {'display': disp, 'sans': sans}, 'fontsSource': 'suggested',
            'prompt': pm.group(1).strip() if pm else '',
            'image': f'assets/styles/style-{num}.webp',
            'imageNote': 'Wizualizacja AI z repo design-trends-2027 (syntetyczna interpretacja)',
        })
    return res


# ---- font library (Google Fonts). Each verified for latin-ext (Polish) below. ----
FONTS = [
    # name, category, use, pairing
    ('Inter', 'sans', 'Interfejsy, dashboardy, długie listy — neutralny i bardzo czytelny w małych rozmiarach.', 'Z Fraunces lub Newsreader w nagłówkach.'),
    ('Inter Tight', 'sans', 'Ciasne nagłówki w duchu szwajcarskim, logotypy tekstowe.', 'Inter w tekście ciągłym.'),
    ('Manrope', 'sans', 'Nowoczesne produkty SaaS, landingi tech.', 'Z JetBrains Mono do etykiet.'),
    ('Plus Jakarta Sans', 'sans', 'Przyjazne startupy, aplikacje konsumenckie.', 'Inter w treści, Jakarta w H1–H2.'),
    ('DM Sans', 'sans', 'Geometryczny, ciepły — marki lifestyle i e-commerce.', 'Z DM Serif Display.'),
    ('Figtree', 'sans', 'Miękki i przyjazny UI, onboarding.', 'Z Young Serif w nagłówkach.'),
    ('Work Sans', 'sans', 'Uniwersalny krój do stron firmowych.', 'Z Playfair Display.'),
    ('IBM Plex Sans', 'sans', 'Produkty techniczne, dokumentacja.', 'Z IBM Plex Mono — jedna rodzina.'),
    ('Nunito Sans', 'sans', 'Miękkie, zaokrąglone interfejsy, edukacja.', 'Z Baloo 2 lub Fredoka.'),
    ('Karla', 'sans', 'Grotesk o lekko nieregularnym rysunku — marki autorskie.', 'Z Fraunces.'),
    ('Barlow', 'sans', 'Przemysłowy, techniczny charakter, sport.', 'Barlow Condensed w nagłówkach.'),
    ('Archivo', 'sans', 'Grotesk do nagłówków i tekstu, substytut Helvetiki.', 'Z Archivo Black.'),
    ('Space Grotesk', 'sans', 'Tech, Web3, neo-brutalizm.', 'Z Space Mono do etykiet.'),
    ('Instrument Sans', 'sans', 'Minimalistyczne marki i portfolio.', 'Z Instrument Serif.'),
    ('Bricolage Grotesque', 'display', 'Ekspresyjne nagłówki z charakterem (oś szerokości).', 'Inter w treści.'),
    ('Syne', 'display', 'Awangardowe marki kreatywne, galerie.', 'Z DM Sans.'),
    ('Unbounded', 'display', 'Szerokie, futurystyczne nagłówki.', 'Z Inter lub Manrope.'),
    ('Archivo Black', 'display', 'Krzykliwe nagłówki, plakaty, neo-brutalizm.', 'Z Space Grotesk.'),
    ('Anton', 'display', 'Wąskie, wysokie hasła na plakatach i miniaturach.', 'Z Inter w treści.'),
    ('Bebas Neue', 'display', 'Kondensowane nagłówki, sport, eventy.', 'Z Montserrat lub Inter.'),
    ('Barlow Condensed', 'display', 'Wąskie nagłówki w systemach informacyjnych.', 'Z Barlow.'),
    ('Fredoka', 'display', 'Zaokrąglone, dziecięce i przyjazne marki.', 'Z Nunito Sans.'),
    ('Baloo 2', 'display', 'Claymorphism, gry, edukacja dla dzieci.', 'Z Nunito Sans.'),
    ('Rubik Mono One', 'display', 'Mocne, retro-cyfrowe nagłówki.', 'Z Work Sans.'),
    ('Orbitron', 'display', 'Y2K, sci-fi, gaming.', 'Z Space Grotesk.'),
    ('Fraunces', 'serif', 'Ekspresyjny szeryf redakcyjny (osie SOFT/WONK).', 'Z Inter lub Karla.'),
    ('Playfair Display', 'serif', 'Luksus, moda, magazyny.', 'Z Work Sans lub Archivo.'),
    ('Newsreader', 'serif', 'Długie czytanie, artykuły, raporty.', 'Z Inter w podpisach.'),
    ('Source Serif 4', 'serif', 'Tekst ciągły w editorialu.', 'Z Fraunces w nagłówkach.'),
    ('Lora', 'serif', 'Blogi, książki, ciepły ton.', 'Z Lato lub Inter.'),
    ('Libre Caslon Text', 'serif', 'Klasyczny, książkowy charakter.', 'Z Inter.'),
    ('Cormorant Garamond', 'serif', 'Premium, kosmetyki, zaproszenia.', 'Z Manrope.'),
    ('DM Serif Display', 'serif', 'Kontrastowe nagłówki o dużym kontraście.', 'Z DM Sans.'),
    ('Young Serif', 'serif', 'Organiczne, naturalne marki.', 'Z Figtree.'),
    ('Gloock', 'serif', 'Mocny szeryf do haseł.', 'Z Karla.'),
    ('Instrument Serif', 'serif', 'Eleganckie akcenty kursywą w nagłówkach.', 'Z Instrument Sans.'),
    ('JetBrains Mono', 'mono', 'Kod, terminale, etykiety danych.', 'Z IBM Plex Sans lub Inter.'),
    ('IBM Plex Mono', 'mono', 'Dokumentacja, metryki, adnotacje siatki.', 'Z IBM Plex Sans.'),
    ('Space Mono', 'mono', 'Retro-tech, stemple, etykiety.', 'Z Space Grotesk.'),
    ('Geist Mono', 'mono', 'Nowoczesny mono do UI deweloperskich.', 'Z Inter.'),
    ('Chivo Mono', 'mono', 'Techniczne etykiety w interfejsach skeuomorficznych.', 'Z Space Grotesk.'),
    ('Caveat', 'handwritten', 'Notatki odręczne, adnotacje na mockupach.', 'Z Inter — tylko akcenty.'),
    ('Kalam', 'handwritten', 'Swobodne dopiski, edukacja.', 'Z Nunito Sans.'),
    ('Patrick Hand', 'handwritten', 'Komiksowe dymki, przyjazne instrukcje.', 'Z Work Sans.'),
    ('Pacifico', 'handwritten', 'Retro skrypt do logotypów (oszczędnie).', 'Z Archivo.'),
    ('Dancing Script', 'handwritten', 'Zaproszenia, podpisy, gastronomia.', 'Z Lora.'),
]


def has_latin_ext(family):
    url = 'https://fonts.googleapis.com/css2?family=' + urllib.parse.quote(family) + '&display=swap'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'})
    try:
        css = urllib.request.urlopen(req, timeout=20).read().decode()
    except Exception as e:
        return None, str(e)
    return ('/* latin-ext */' in css), 'ok'


def main():
    os.makedirs(OUT, exist_ok=True)
    styles = adt_styles() + dt27_styles()
    fam = {f[0] for f in FONTS}
    for s in styles:
        fam.update(v for v in s['fonts'].values() if v)
    report, ok = {}, []
    for f in sorted(fam):
        le, msg = has_latin_ext(f)
        report[f] = {'latinExt': le, 'status': msg}
        if le is not None:
            ok.append(f)
    fonts = []
    for name, cat, use, pair in FONTS:
        if report[name]['latinExt']:
            fonts.append({'name': name, 'category': cat, 'use': use, 'pairing': pair,
                          'url': 'https://fonts.google.com/specimen/' + name.replace(' ', '+')})
    json.dump(styles, open(os.path.join(OUT, 'styles.json'), 'w'), ensure_ascii=False, indent=1)
    json.dump(fonts, open(os.path.join(OUT, 'fonts.json'), 'w'), ensure_ascii=False, indent=1)
    json.dump({'families': sorted(ok), 'check': report}, open(os.path.join(OUT, 'font-check.json'), 'w'), ensure_ascii=False, indent=1)
    print('styles', len(styles), 'fonts', len(fonts), 'families loadable', len(ok))
    bad = {k: v for k, v in report.items() if not v['latinExt']}
    print('no latin-ext / failed:', bad)


if __name__ == '__main__':
    main()
