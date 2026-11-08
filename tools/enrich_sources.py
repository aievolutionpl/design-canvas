#!/usr/bin/env python3
"""Add original, source-referenced curation and verify Polish webfont subsets.

Run from any directory. Idempotent: existing records are never overwritten.
Network access is required. Google Fonts are referenced, not redistributed.
"""
import concurrent.futures
import json
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
FONTS = [
 ('Alegreya','serif','Długie teksty i eseje redakcyjne.','Alegreya Sans'),
 ('Alegreya Sans','sans','Humanistyczne interfejsy wydawnicze.','Alegreya'),
 ('BioRhyme','serif','Wyraziste nagłówki kultury i edukacji.','Libre Franklin'),
 ('Cardo','serif','Eseje i klasyczna typografia książkowa.','Fira Sans'),
 ('Commissioner','sans','Czytelny grotesk do serwisów publicznych.','IBM Plex Serif'),
 ('DM Serif Text','serif','Teksty i nagłówki marek wydawniczych.','Commissioner'),
 ('Encode Sans','sans','Zwarta typografia informacji i tabel.','IBM Plex Serif'),
 ('Exo 2','sans','Nagłówki interfejsów technologicznych.','Sometype Mono'),
 ('Fira Sans','sans','Dokumentacja i interfejsy wielojęzyczne.','Fira Sans Condensed'),
 ('Fira Sans Condensed','sans','Gęste nagłówki i nawigacja.','Fira Sans'),
 ('Gelasio','serif','Czytelna antykwa do artykułów.','Libre Franklin'),
 ('IBM Plex Serif','serif','Raporty i teksty eksperckie.','IBM Plex Sans'),
 ('Libre Franklin','sans','Nawigacja i redakcyjny system informacji.','Alegreya'),
 ('Merriweather Sans','sans','Tekst i elementy aplikacji.','Merriweather'),
 ('Petrona','serif','Ciepły krój do kultury i narracji.','Commissioner'),
 ('Roboto Condensed','sans','Kompaktowe etykiety dashboardów.','Roboto'),
 ('Sometype Mono','mono','Kod, dane i metadane.','Fira Sans'),
 ('Vollkorn','serif','Długie teksty i niezależne wydawnictwa.','Libre Franklin'),
]
# Original compositions: reference links are research, not design-system copies.
STYLES = [
 ('AIE-01','Editorial Ledger','Redakcja / raport','Wyważona typografia, rytm i reguły redakcyjne.','Raporty, eseje, czasopisma i analizy.','12 kolumn; artykuł na 7, marginalia na 3; cienkie linie oddzielają sekcje; lead na całą szerokość.','Alegreya w tytułach 48–72 px; Libre Franklin w tekście 17–19 px; Sometype Mono dla dat i numerów.','Nie używaj dekoracyjnych kart ani wąskich kolumn tekstu.', ['#F7F4EC','#FFFFFF','#202A2E','#6C7778','#A64230','#DACCB3'],['Alegreya','Libre Franklin','Sometype Mono'],'https://github.com/system-fonts/modern-font-stacks'),
 ('AIE-02','Technical Field Notes','Technologia / dokumentacja','Interfejs jak przejrzysty notatnik inżynierski.','Dokumentacja API, narzędzia deweloperskie, dzienniki wdrożeń.','Lewy indeks, główny tekst i prawy spis treści; bloki kodu wyrównane do siatki; status jako tekst i znak.','Fira Sans 16–18 px, Fira Sans Condensed w nagłówkach, Sometype Mono w kodzie i metadanych.','Nie używaj monospaced dla długich akapitów ani niskokontrastowych statusów.', ['#F1F4F1','#FFFFFF','#14271F','#5A6E62','#136F50','#C7D7C9'],['Fira Sans Condensed','Fira Sans','Sometype Mono'],'https://github.com/phosphor-icons/core'),
 ('AIE-03','Civic Wayfinding','Usługi / informacja','Spokojna nawigacja i czytelne ścieżki bez urzędowego chłodu.','Usługi publiczne, instytucje, edukacja, formularze.','Jedno zadanie na ekran; nawigacja z okruszkami; widoczne kroki i etykiety; CTA przy opisie zadania.','Commissioner 700 dla nagłówków i 400 dla treści; IBM Plex Serif jako akcent redakcyjny; kod tylko w numerach spraw.','Nie koduj znaczeń wyłącznie kolorem; unikaj karuzel i tekstu w wersalikach.', ['#F7F8F4','#FFFFFF','#162C3B','#526879','#175A88','#E7B744'],['Commissioner','Commissioner','Sometype Mono'],'https://github.com/uswds/uswds'),
 ('AIE-04','Data Observatory','Dane / dashboard','Analityka oparta na porównywalnych skalach i opisach.','Dashboardy, raporty danych, monitoring operacyjny.','Filtry i zakres czasu nad wykresem; 3–4 KPI; główny wykres z opisanymi osiami; tabela jako alternatywa dostępna.','Roboto Condensed dla etykiet, Fira Sans dla objaśnień, Sometype Mono z tabularnymi cyframi dla wartości.','Unikaj wykresów 3D, tęczowych palet oraz zmiennych skal bez wyjaśnienia.', ['#F4F6F7','#FFFFFF','#142B35','#576D76','#116F78','#C26137'],['Roboto Condensed','Fira Sans','Sometype Mono'],'https://github.com/visgl/deck.gl'),
 ('AIE-05','Material Workshop','Produkt / komponenty','Taktylne powierzchnie i jasna hierarchia stanów.','Aplikacje produktywności, kreatory i narzędzia pracy.','Boczny panel narzędzi; centralny obszar roboczy; podniesione wyłącznie menu i dialogi; stały pasek kontekstu.','Commissioner dla interfejsu; BioRhyme tylko w dużych tytułach; Sometype Mono w skrótach.','Nie mieszaj wielu wysokości cieni; nie polegaj na cieniu jako jedynym wskaźniku fokusu.', ['#F5F1E9','#FFFFFF','#242724','#696E67','#42674A','#E2CBA8'],['BioRhyme','Commissioner','Sometype Mono'],'https://github.com/material-components/material-web'),
 ('AIE-06','Cultural Archive','Kultura / archiwum','Archiwalna siatka z wyrazistą typografią i metadanymi.','Muzea, biblioteki, kolekcje, wystawy i katalogi.','Asymetryczna siatka; jeden duży obiekt, mniejsze indeksowane rekordy; podpis, data i prawa przy każdym obiekcie.','Petrona na tytuły 40–64 px; Libre Franklin na nawigację i podpisy; Sometype Mono na sygnatury.','Nie postarzać cyfrowo każdego zdjęcia i nie ukrywać informacji o prawach.', ['#F5EFE2','#FFFCF5','#292820','#756E5D','#894C38','#B0B99E'],['Petrona','Libre Franklin','Sometype Mono'],'https://github.com/system-fonts/modern-font-stacks'),
 ('AIE-07','Research Dossier','Badania / wiedza','Przejrzyste dossier z widoczną strukturą dowodów.','Publikacje naukowe, raporty badawcze, analizy polityk.','Nagłówek z wnioskiem; streszczenie i metodologia obok; sekcje numerowane, przypisy przy odpowiednim akapicie.','IBM Plex Serif dla tytułu i lektury; Commissioner dla nawigacji; Sometype Mono do tabel i identyfikatorów.','Nie ukrywaj źródeł za ozdobnikami; nie formatuj wszystkich akapitów jako cytatów.', ['#F4F4F0','#FFFFFF','#1D292B','#586867','#365E75','#D1AA61'],['IBM Plex Serif','Commissioner','Sometype Mono'],'https://github.com/uswds/uswds'),
 ('AIE-08','Industrial Index','Przemysł / katalog','Funkcjonalny katalog techniczny bez dekoracyjnego brutalizmu.','Katalogi komponentów, logistyka, systemy produkcyjne.','Gęsta siatka z silnymi separatorami; fotografia produktu na neutralnym tle; parametry w tabeli; wyraźna dostępność.','Fira Sans Condensed dla nagłówków i danych nawigacji; Fira Sans dla instrukcji; Sometype Mono dla SKU.','Nie zmniejszaj tekstu poniżej czytelnego rozmiaru i nie zastępuj tekstu samymi ikonami.', ['#F2F1EB','#FFFFFF','#202A2C','#69716F','#A64B28','#D5D5C8'],['Fira Sans Condensed','Fira Sans','Sometype Mono'],'https://github.com/phosphor-icons/core'),
]
def read(path): return json.loads((ROOT/path).read_text(encoding='utf-8'))
def write(path,obj): (ROOT/path).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def check_font(item):
 name=item[0]; url='https://fonts.googleapis.com/css2?'+urlencode({'family':name+':wght@400'})
 with urlopen(Request(url,headers={'User-Agent':UA}),timeout=30) as r: css=r.read().decode()
 return name, ('latin-ext' in css and 'U+0100' in css),url

def main():
 fonts=read('data/fonts.json'); existing={x['name'].casefold() for x in fonts}; candidates=[f for f in FONTS if f[0].casefold() not in existing]
 with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool: checks=list(pool.map(check_font,candidates))
 failed=[n for n,ok,_ in checks if not ok]
 if failed: raise SystemExit('latin-ext verification failed: '+', '.join(failed))
 for name,cat,use,pair in candidates: fonts.append({'name':name,'category':cat,'use':use,'pairing':'Z '+pair+'.','url':'https://fonts.google.com/specimen/'+name.replace(' ','+'),'latinExt':True})
 styles=read('data/styles.json'); ids={s['id'] for s in styles}
 for id,name,category,desc,when,composition,typo,avoid,pal,fs,url in STYLES:
  if id in ids: continue
  prompt=(f'Stwórz oryginalny system „{name}”, nie kopię wskazanego repozytorium. Cel: {when} Układ: {composition} Typografia: {typo} '
          f'Paleta: {", ".join(pal)}. Zaprojektuj responsywny widok desktop i mobile, skalę odstępów 4/8/16/24/32/48 px, '
          f'widoczne stany hover, focus i disabled oraz semantyczną nawigację klawiaturą. Zadbaj o kontrast tekstu co najmniej WCAG AA; '
          f'nie koduj informacji samym kolorem. Dodaj realistyczną polską treść z ąćęłńóśźż, a nie lorem ipsum. Unikaj: {avoid}')
  styles.append({'id':id,'num':id[-2:],'source':'aie-original','name':name,'tagline':'Oryginalna kuracja AI Evolution Polska','category':category,'description':desc,'whenToUse':when,'composition':composition,'typographyText':typo,'avoid':avoid,'palette':pal,'paletteSource':'original-curation','fonts':{'display':fs[0],'sans':fs[1],'mono':fs[2]},'fontsSource':'original-curation','sourceUrl':url,'image':None,'imageNote':'Oryginalna kompozycja; wskazane repozytorium jest źródłem inspiracji, nie wzorem do kopiowania.','prompt':prompt})
 if len({s['id'] for s in styles})!=len(styles): raise SystemExit('duplicate style IDs')
 write('data/fonts.json',fonts);write('data/styles.json',styles)
 print(f'Added {len(candidates)} fonts and {len(styles)-len(ids)} styles; {len(styles)} styles, {len(fonts)} font entries. Existing font duplicates are retained.')
if __name__=='__main__': main()
