"""Expands data/fonts.json with ~80 Google Fonts families (verified latin-ext/Polish),
and downloads CC0 DiceBear illustrations into assets/illustrations/."""
import json, os, re, urllib.request, concurrent.futures, pathlib

ROOT = pathlib.Path('/home/aibot/.hermes/projects/design-canvas')
NEW = [
 ("Roboto","sans","Najbardziej neutralny krój Google — interfejsy, aplikacje, treści masowe.","Z Roboto Slab lub Playfair Display w nagłówkach."),
 ("Open Sans","sans","Czytelny humanistyczny bezszeryf do długich tekstów i UI.","Z Merriweather albo Lora."),
 ("Montserrat","sans","Geometryczny, miejski, mocny w nagłówkach i logotypach.","Z Lora lub Source Serif 4 w treści."),
 ("Poppins","sans","Okrągły geometryczny — lifestyle, beauty, edukacja.","Z Playfair Display dla kontrastu."),
 ("Raleway","sans","Elegancki, cienki w dużych rozmiarach — moda i premium.","Z Cormorant Garamond."),
 ("Mulish","sans","Spokojny, bardzo czytelny — SaaS i dokumentacja.","Z Fraunces w nagłówkach."),
 ("Outfit","sans","Nowoczesny geometryczny — startupy, produkty cyfrowe.","Z Instrument Serif."),
 ("Sora","sans","Techniczny, przyszłościowy — AI, fintech, Web3.","Z IBM Plex Mono w danych."),
 ("Onest","sans","Neutralny z charakterem — nowoczesne serwisy.","Z Newsreader."),
 ("Geist","sans","Krój w duchu Vercel — czysty interfejs deweloperski.","Z Geist Mono."),
 ("Schibsted Grotesk","sans","Redakcyjny grotesk — media, magazyny, portale.","Z Literata."),
 ("Public Sans","sans","Rządowy, instytucjonalny, maksymalnie czytelny.","Z Merriweather."),
 ("Red Hat Display","sans","Techniczny, przyjazny — produkty B2B.","Z Red Hat Text."),
 ("Urbanist","sans","Lekki geometryczny — architektura, wnętrza, portfolio.","Z Cormorant Garamond."),
 ("Hanken Grotesk","sans","Elegancki grotesk o dużym kontraście — premium SaaS.","Z Fraunces."),
 ("Be Vietnam Pro","sans","Uniwersalny, dobrze działa w małych rozmiarach.","Z Lora."),
 ("Epilogue","sans","Nowoczesny, lekko ekspresyjny — agencje kreatywne.","Z Instrument Serif."),
 ("Gabarito","sans","Miękki geometryczny — aplikacje edukacyjne.","Z Bitter."),
 ("Familjen Grotesk","sans","Szwedzki grotesk — skandynawski minimalizm.","Z Newsreader."),
 ("Chivo","sans","Mocny, redakcyjny — sport, news, kampanie.","Z Chivo Mono."),
 ("Asap","sans","Przyjazny, zaokrąglony — produkty konsumenckie.","Z Asap Condensed."),
 ("Rubik","sans","Nowoczesny, lekko zaokrąglony — tech i edukacja.","Z Rubik Mono One w akcentach."),
 ("Josefin Sans","sans","Vintage geometryczny — moda, eventy, retro.","Z Josefin Slab."),
 ("Quicksand","sans","Miękki, przyjazny — zdrowie, dzieci, wellness.","Z Karla."),
 ("Comfortaa","sans","Bardzo okrągły — logo, aplikacje dla dzieci.","Z Nunito Sans."),
 ("Lexend","sans","Projektowany pod czytelność — dostępność i edukacja.","Z Source Serif 4."),
 ("Albert Sans","sans","Neutralny skandynawski — czyste, spokojne UI.","Z Fraunces."),
 ("Manrope","sans","Zwarty, nowoczesny — dashboardy i produkty.","Z Newsreader."),
 ("Merriweather","serif","Klasyczna czytelność w ekranie — blogi i media.","Z Open Sans."),
 ("EB Garamond","serif","Renesansowa elegancja — wydawnictwa, kultura.","Z Inter."),
 ("Crimson Pro","serif","Literacki, ciepły — książki i eseje.","Z Work Sans."),
 ("Literata","serif","Zaprojektowana do ekranu — długie artykuły.","Z Schibsted Grotesk."),
 ("Spectral","serif","Redakcyjny, szlachetny — magazyny premium.","Z Karla."),
 ("Bitter","serif","Slab serif czytelny — blogi techniczne.","Z Roboto."),
 ("Zilla Slab","serif","Nowoczesny slab — tech, dokumentacja, dev.","Z Inter."),
 ("Roboto Slab","serif","Mocny slab — nagłówki w treści technicznej.","Z Roboto."),
 ("Libre Baskerville","serif","Klasyczna baza — prawo, edukacja, wydawnictwa.","Z Montserrat."),
 ("Bodoni Moda","serif","Wysoki kontrast, moda i luksus.","Z Montserrat."),
 ("Prata","serif","Didone o łagodnych krzywych — beauty i moda.","Z Jost lub Inter."),
 ("Domine","serif","Ciepły, czytelny — blogi i portale.","Z Source Sans 3."),
 ("Arvo","serif","Geometryczny slab — mocne nagłówki.","Z Lato."),
 ("Rufina","serif","Elegancki z hiszpańskim charakterem — restauracje.","Z Karla."),
 ("Oswald","display","Kondensowany, plakatowy — sport, eventy, hero.","Z Lora w treści."),
 ("Alfa Slab One","display","Ciężki slab — plakaty, okładki, mocne CTA.","Z Roboto."),
 ("Abril Fatface","display","Redakcyjny display — moda, magazyny.","Z Lato."),
 ("Righteous","display","Retro-futurystyczny — eventy, gry, muzyka.","Z Poppins."),
 ("Bungee","display","Miejski, blokowy — streetwear i eventy.","Z Inter."),
 ("Teko","display","Wąski sportowy — wyniki, statystyki.","Z Barlow."),
 ("Fjalla One","display","Kondensowany nagłówkowy — sport i news.","Z Merriweather."),
 ("Passion One","display","Ekspresyjny, gęsty — plakaty i social.","Z Work Sans."),
 ("Russo One","display","Techniczny, mocny — gaming i motoryzacja.","Z PT Sans."),
 ("Lobster","display","Skryptowy klasyk — restauracje, retro.","Z Merriweather."),
 ("Titan One","display","Gruby, zabawny — dzieci i food.","Z Nunito."),
 ("Oswald","display","Kondensowany — plakaty i hero sekcje.","Z Lora."),
 ("Fira Code","mono","Programistyczny z ligaturami — dokumentacja i kod.","Z Inter."),
 ("Source Code Pro","mono","Neutralny kod — techniczne UI i tabela danych.","Z Source Sans 3."),
 ("Roboto Mono","mono","Czytelny mono do danych i metryk.","Z Roboto."),
 ("Inconsolata","mono","Lekki mono — terminale i notatki techniczne.","Z Roboto."),
 ("Ubuntu Mono","mono","Przyjazny mono — edytory i CLI.","Z Ubuntu."),
 ("Cousine","mono","Monospace zgodny z Courier — dokumenty i kod.","Z Arimo."),
 ("Anonymous Pro","mono","Klasyczny programistyczny — dokumentacja.","Z Inter."),
 ("Red Hat Mono","mono","Techniczny mono — dashboardy i logi.","Z Red Hat Display."),
 ("Azeret Mono","mono","Nowoczesny mono — branding techniczny.","Z Azeret."),
 ("DM Mono","mono","Elegancki mono — metryki i podpisy.","Z DM Sans."),
 ("Shadows Into Light","hand","Odręczny, lekki — notatki i social.","Z Lora."),
 ("Indie Flower","hand","Swobodny charakter pisma — lifestyle.","Z Karla."),
 ("Amatic SC","hand","Wysoki, odręczny — plakaty i menu.","Z Lato."),
 ("Gloria Hallelujah","hand","Zabawny odręczny — dzieci i edukacja.","Z Nunito."),
 ("Satisfy","hand","Pędzlowy skrypt — beauty i eventy.","Z Montserrat."),
 ("Permanent Marker","hand","Marker — streetwear i sport.","Z Barlow."),
 ("Gochi Hand","hand","Swobodny długopis — notatki i moodboardy.","Z Inter."),
 ("Architects Daughter","hand","Techniczny odręczny — szkice i diagramy.","Z Inter."),
 ("Caveat Brush","hand","Pędzel, energiczny — plakaty i social.","Z Poppins."),
 ("Cookie","hand","Elegancki skrypt — cukiernie i beauty.","Z Lora."),
 ("Great Vibes","hand","Kaligrafia — zaproszenia i luksus.","Z Cormorant Garamond."),
 ("Allura","hand","Płynna kaligrafia — śluby i premium.","Z Playfair Display."),
 ("Sacramento","hand","Cienki monoline — vintage i beauty.","Z Lato."),
 ("Parisienne","hand","Paryski skrypt — moda i restauracje.","Z Montserrat."),
 ("Jost","sans","Geometryczny w duchu Futury — Bauhaus i architektura.","Z EB Garamond."),
 ("Cormorant Infant","serif","Delikatny serif — zaproszenia i luksus.","Z Jost."),
 ("Cabin","sans","Humanistyczny, przyjazny — produkty i edukacja.","Z Lora."),
 ("Assistant","sans","Neutralny, wielojęzyczny — interfejsy.","Z Merriweather."),
 ("Heebo","sans","Prosty, czysty — UI i treści.","Z Frank Ruhl Libre."),
 ("Frank Ruhl Libre","serif","Klasyczny serif — wydawnictwa i kultura.","Z Heebo."),
 ("Lato","sans","Bezpieczny, uniwersalny — korporacyjne strony.","Z Merriweather."),
 ("Source Sans 3","sans","Adobe, świetny w UI — produkty i dokumentacja.","Z Source Serif 4."),
 ("PT Sans","sans","Rosyjski humanistyczny — instytucje i edukacja.","Z PT Serif."),
 ("PT Serif","serif","Klasyczny serif — długie teksty.","Z PT Sans."),
 ("Noto Sans","sans","Najszersze pokrycie językowe — wielojęzyczne serwisy.","Z Noto Serif."),
 ("Noto Serif","serif","Uniwersalny serif — publikacje.","Z Noto Sans."),
 ("Overpass","sans","Inspirowany autostradami — transport i logistyka.","Z Overpass Mono."),
 ("Karla","sans","Grotesk o mocnym charakterze — agencje i startupy.","Z Spectral."),
 ("Instrument Sans","sans","Nowoczesny neutralny — produkty cyfrowe.","Z Instrument Serif."),
]

def check(name):
    fam = name.replace(' ', '+')
    url = f'https://fonts.googleapis.com/css2?family={fam}:wght@400;700&display=swap'
    try:
        css = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'}), timeout=20).read().decode()
    except Exception as e:
        return name, False, str(e)
    return name, ('U+0100' in css), ''

existing = json.load(open(ROOT / 'data/fonts.json'))
have = {f['name'] for f in existing}
todo = [n for n, *_ in NEW if n not in have]
with concurrent.futures.ThreadPoolExecutor(8) as ex:
    res = dict((n, ok) for n, ok, _ in ex.map(check, todo))
keep = [x for x in NEW if x[0] not in have and res.get(x[0])]
dropped = [x[0] for x in NEW if x[0] not in have and not res.get(x[0])]
fonts = existing + [{'name': n, 'category': c, 'use': u, 'pairing': p, 'url': f'https://fonts.google.com/specimen/{n.replace(" ", "+")}', 'latinExt': True} for n, c, u, p in keep]
fonts.sort(key=lambda f: ({'sans': 0, 'serif': 1, 'display': 2, 'mono': 3, 'hand': 4}.get(f['category'], 5), f['name']))
json.dump(fonts, open(ROOT / 'data/fonts.json', 'w'), ensure_ascii=False, indent=0)
print('fonts', len(fonts), '| added', len(keep), '| dropped (no latin-ext):', dropped)

# illustrations — DiceBear (open-peeps, shapes: CC0)
ILL = ROOT / 'assets/illustrations'; ILL.mkdir(parents=True, exist_ok=True)
seeds = ['Ania','Marek','Zofia','Jakub','Ola','Tomek','Kasia','Piotr','Maja','Bartek','Nina','Adam',
         'Ewa','Filip','Hania','Igor','Julia','Kuba','Lena','Michal','Olga','Pawel','Ruda','Sylwia']
jobs = [(s, f'https://api.dicebear.com/9.x/open-peeps/svg?seed={s}&backgroundColor=transparent&radius=0') for s in seeds]
jobs += [(f'shape-{i}', f'https://api.dicebear.com/9.x/shapes/svg?seed={s}&backgroundColor=transparent') for i, s in enumerate(seeds[:12])]
def fetch(job):
    name, url = job
    try:
        data = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'}), timeout=25).read()
        (ILL / f'{name.lower()}.svg').write_bytes(data); return name, len(data)
    except Exception as e:
        return name, 0
with concurrent.futures.ThreadPoolExecutor(6) as ex:
    got = [r for r in ex.map(fetch, jobs) if r[1] > 0]
print('illustrations', len(got), 'of', len(jobs), '| bytes', sum(x[1] for x in got) // 1024, 'KB')
