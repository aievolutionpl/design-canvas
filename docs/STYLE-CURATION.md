# Kuracja stylów

Osiem nowych kierunków `AIE-01`–`AIE-08` to **oryginalne propozycje AI Evolution Polska**, a nie prognozy trendów, kopie ani oficjalne style wskazanych projektów. Źródło przypięte do stylu jest punktem wyjścia do dalszej nauki, nie dowodem pochodzenia każdego tokenu czy elementu kompozycji. Palety, parowanie krojów, opisy i prompty są autorską kuracją. Inspiracje i pliki z prawami: [SOURCES.md](SOURCES.md) i [source-ledger.json](../data/source-ledger.json).

| ID | Nazwa | Zastosowanie |
|---|---|---|
| AIE-01 | Editorial Ledger | raport, esej, wydawnictwo |
| AIE-02 | Technical Field Notes | dokumentacja, narzędzia deweloperskie |
| AIE-03 | Civic Wayfinding | usługi i formularze |
| AIE-04 | Data Observatory | monitoring, raporty i wykresy |
| AIE-05 | Material Workshop | narzędzia produktywności |
| AIE-06 | Cultural Archive | kolekcje i instytucje kultury |
| AIE-07 | Research Dossier | badania i analizy |
| AIE-08 | Industrial Index | katalog techniczny i logistyka |

Każdy rekord zawiera osobno zastosowanie, kompozycję, typografię, ograniczenia, sześć barw i prompt dla agenta. Paleta jest punktem wyjścia — każdą rzeczywistą parę tekst/tło i stany interakcji trzeba zweryfikować pod kątem kontrastu WCAG. `image: null` oznacza, że system należy prezentować tokenami, nie fikcyjną wizualizacją; konsumenci danych muszą obsługiwać brak obrazu. Nie udawać pochodzenia oryginałów z „Trendy 2027”.

Odświeżanie danych: `python3 tools/enrich_sources.py`. Skrypt jest addytywny, nie zastępuje istniejących rekordów i sprawdza CSS Google Fonts (Chrome UA, blok `latin-ext`, `U+0100`) przed dodaniem kroju. Po dodaniu rodziny zaktualizuj również ledger; samo istnienie bloku nie zastępuje testu renderowania pełnego polskiego zdania w aplikacji.
