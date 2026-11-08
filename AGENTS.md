# AI Evolution Design Studio — kontekst dla agentów

## Cel
Pomagaj człowiekowi wybierać i stosować kierunek wizualny stron i aplikacji. To biblioteka referencji i zasobów, nie automatyczny generator ani serwer MCP.

## Odczyt
- `data/styles.json`: tablica stylów. Zachowuj dokładne `id`. Czytaj `name`, `source`, `sourceUrl`, `description`, `whenToUse`, `composition`, `palette`, `paletteSource`, `fonts`, `fontsSource`, `avoid`, `prompt`; opcjonalne pola mogą nie występować.
- `data/fonts.json`: katalog rodzin fontów.
- `data/assets.json`: ikony, wzory, gradienty, palety, tokeny oraz `licenses`.
- `data/source-ledger.json` i `docs/SOURCES.md`: pochodzenie nowych zasobów.
- `docs/AGENT-WORKFLOW.md`: współpraca i format eksportu.

## Procedura
1. Poznaj cel, odbiorcę, treści i najważniejszą akcję. Nie zgaduj brakujących faktów biznesowych.
2. Zaproponuj maksymalnie trzy pasujące style z prawdziwymi identyfikatorami i uzasadnieniem. Nie wybieraj wyłącznie na podstawie atrakcyjnego obrazka.
3. Po wyborze zachowaj paletę, typografię i kompozycję jako punkt odniesienia. Jawnie opisz odstępstwa potrzebne do czytelności lub dostępności.
4. Pobierz potrzebne zasoby, sprawdź licencje i zachowaj atrybucję. Nie traktuj całego repo jako jednolicie licencjonowanego pakietu.
5. Zbuduj rzeczywisty interfejs. Sprawdź responsywność, klawiaturę, kontrast, konsolę i działanie interakcji. Weryfikuj skopiowany CSS/SVG w projekcie docelowym.
6. Przedstaw rezultat człowiekowi wraz z ograniczeniami i testami. Nie deklaruj PASS bez uruchomienia sprawdzenia.

## Ważne rozróżnienia
`aie-original` to autorskie kompozycje, nie oficjalne systemy wskazanych inspiracji. Sugerowane fonty i próbkowane kolory nie są oficjalnymi tokenami marki. Wizualizacja stylu nie dowodzi działania komponentu. Szkło w laboratorium jest efektem; nie każdy kafel szkła jest żywym filtrem.

## Zmiany w repo
Aplikacja to statyczne HTML/CSS/JS. Uruchamiaj przez HTTP. Nie usuwaj działających modułów ani nie zmieniaj publicznych identyfikatorów bez migracji. Liczniki wyprowadzaj z danych. Nowe assety muszą być użyteczne, mieć źródło i dopuszczalną licencję. Nie publikuj sekretów ani danych prywatnych.
