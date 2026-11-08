# Design Studio — decyzje projektowe

## Cel i odbiorcy
Otwarte narzędzie AI Evolution Polska dla osób projektujących z pomocą agentów: wybierz styl, obejrzyj rzeczywisty przykład, pobierz dane lub przekaż agentowi zweryfikowany kontekst. Dane źródłowe pozostają autorytetem; prognozy trendów nie są oficjalnymi systemami projektowymi.

## Kierunek
Właściciel wizualny: frontend-design; Apple Clarity określa jasność i czytelność. ui-ux-pro-max dostarczył kandydatów, zapisanych w `/home/aibot/.hermes/cache/scratch/design-studio-research.md`. Zalecenia potraktowano selektywnie: odrzucono dominujące gradienty i efekty na rzecz biblioteki obrazów jako głównego materiału wizualnego. Brand CONFIG/KNOWLEDGE: nazwa AI Evolution Polska, indigo #5B4DFF jako oszczędny akcent i polski, praktyczny język; aktualny brief wyraźnie wybiera jasny workspace zamiast zwyczajowego dark mode marki.

## Hierarchia i zasady
Nawigacja pozioma łączy pięć istniejących przestrzeni, potem tytuł i rzeczywiste liczniki, wyszukiwarka/filtry i galeria. Wybór otwiera natywny dialog z próbką, pochodzeniem, tokenami, pakietem Markdown i eksportem JSON. Podglądy pochodzą z lokalnej bazy; brak obrazka oznacza brak podglądu, nie udajemy działającego efektu. Ulubione pozostają lokalnie w przeglądarce.

## Tokeny
Tło #f5f6f8, powierzchnia #fff, tekst #17191d, tekst wtórny #525866, linia #dfe2e7, akcent #5145c8. Typografia systemowa (polskie znaki, bez zewnętrznego CDN). Odstępy 4/8 px; kontrolki min. 44 px; karty 14 px. Ruch wyłącznie na interakcję, wyłączany w reduced-motion. Klawiatura i focus widoczne; na małych ekranach nawigacja przewija się w poziomie, zawartość nie.

## Odrzucone domyślne wzorce
Hero marketingowy, ozdobne metryki, niebiesko-fioletowy gradient SaaS, wymyślone dane/licencje, iframe, zewnętrzne obrazki i kopiowanie cudzej identyfikacji. Fonty i palety stylów oznaczyć według pochodzenia z bazy; nie zakładać licencji.

## Weryfikacja
Przed przekazaniem: wyszukiwanie, źródła, filtrowanie, ulubione po odświeżeniu, szczegóły, clipboard z obsługą błędów, eksport i łącza; telefon/tablet/desktop, overflow, błędy konsoli, screenshoty i pomiar kontrastu. Integrację pozostałych stron i publikację prowadzi kontroler.
