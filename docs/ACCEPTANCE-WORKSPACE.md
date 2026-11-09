# Design Workspace — kryteria wydania

Zakres: wszystkie sześć ulepszeń zaakceptowanych przez autora. Ten dokument określa wymagania, nie wyniki testów.

## Funkcje
1. Wspólna nawigacja Studio / Kanwa / Tablice / Assety / Liquid Glass / Mój zestaw. Wspólna wyszukiwarka prowadzi do rzeczywiście przefiltrowanych wyników. Wybór stylu jest przenoszony między modułami. Ulubione zachowują się po odświeżeniu; stare zapisane dane są migrowane bez utraty.
2. Zestaw zawiera nazwę, treść, rzeczywisty styl, paletę, parę fontów i wybór assetów. Można zapisać, zmodyfikować i odczytać zestaw. Eksport dostarcza brief Markdown, tokeny CSS, JSON oraz wybrane zasoby ze źródłami i licencjami. Nie wolno udawać pobrania plików fontów.
3. Porównywarka pokazuje tę samą własną treść w kilku rzeczywistych stylach. Dostępny widok desktop i telefonu. Różnice wynikają z danych, a nie z podmiany samych nazw.
4. Edytor aktualizuje tekst, fonty i akcent w podglądzie. Kontrast jest liczony według luminancji sRGB; zakres oceny nazwany. Eksport odzwierciedla edycje.
5. Optymalizacje mają pomiary przed/po w porównywalnych warunkach. Testy obejmują nawigację, kopiowanie, eksport, trwałość, brak nachodzenia istotnych kontrolek i poziomego overflow na 390/768/1440 px. Konsola bez błędów aplikacji. Sieciowe ograniczenia fontów raportowane oddzielnie. Automatyzacja CI uruchamia prawdziwe testy.
6. CLI pozwala wyszukać style, pobrać dokładny identyfikator, odczytać/walidować zaakceptowany zestaw i wyeksportować go. Błędne dane i identyfikatory kończą się czytelnym błędem. Web JSON jest akceptowany przez CLI. Brak serwera MCP nie jest ukrywany — CLI realizuje wybraną integrację.

## Bezpieczeństwo i jakość
- Dane importowane i localStorage są niezaufane: bez wykonania HTML/JS i bez zapisu poza katalogiem eksportu.
- Istniejące publiczne identyfikatory i działające moduły pozostają dostępne.
- Oryginalne screenshoty autora w README pozostają.
- Etykiety PL, obsługa klawiatury, widoczny focus, reduced-motion, mobilna nawigacja, metadane i informacja o AI.
- Źródła i licencje nie są zgadywane; brak informacji jest jawny.
- Testy funkcjonalne, pomiary kontrastu, wizualna inspekcja screenshotów i wyniki detektorów są oddzielnymi dowodami.
- Końcowy raport obejmuje wszystkie powyższe wymagania, także niezaliczone i zablokowane. Nie zmieniamy starego budżetu QC ani nie ukrywamy FAIL.

## Dowody
Wyniki robocze: `evidence/workspace-shell/`, testy CLI i zestawu. Zbiorcza weryfikacja następuje dopiero po zakończeniu równoległych edycji. Wydanie wymaga push/merge i odczytu rzeczywistych plików wdrożenia.
