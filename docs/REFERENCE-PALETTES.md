# Palety referencyjne

Źródło: pięć unikalnych plansz przesłanych przez użytkownika, podpisanych @uiuxaadi. Fioletowa plansza została przesłana dwukrotnie. Nazwy katalogowe są umowne. Nie są to oficjalne tokeny marki.

Przepisano etykiety HEX, nie próbkowano pikseli: gradienty, światło i kompresja zmieniają wygląd referencji. Oryginalne grafiki nie są redystrybuowane ani objęte domniemaną licencją open source.

| Paleta | Kolory w kolejności źródłowej |
|---|---|
| Ocean Teal | #05161A #072E33 #0C7075 #0F969C #6DA5C0 #294D61 |
| Violet Glow | #0B0720 #25134D #6A2FC8 #9D71E8 #D1B8FF #F2E9FF |
| Forest Mint | #051F20 #0B2B26 #163832 #235347 #8EB69B #DAF1DE |
| Berry Rose | #800021 #881144 #243A66 #C24366 #FF69B4 #FFE4D8 |
| Graphite | #0B0B0B #1A1A1A #333333 #6B6B6B #D9D9D9 #FFFFFF |

**Berry Rose:** #243A66 oznacza granat mimo różowej próbki na planszy. Zachowano dosłowny kod i widoczną uwagę w katalogu; nie odgadujemy zamiennika.

## Użycie

Na kanwie wyszukaj nazwę lub HEX, otwórz paletę i skopiuj zmienne CSS. W bibliotece assetów filtr „Referencje · uiuxaadi” pokazuje wszystkie pięć zestawów. Kliknięcie próbki kopiuje HEX, a „Dodaj do zestawu” wybiera paletę do eksportu.

Kolory mają neutralne nazwy color-1…color-6: kolejność referencji nie oznacza ról UI. Dobierz tło, tekst i akcent do projektu, sprawdź kontrast konkretnej pary. Nie zakładaj, że białe napisy są czytelne na każdym kolorze.

Dane źródłowe: `data/reference-palettes.json`. Generator `tools/build_assets.js` dołącza je do katalogu assetów. Przy zmianie palet aktualizuj oba pliki danych.

## Wygodniejsza praca z paletami

Karty biblioteki mają akcje „Kopiuj HEX” i „Kopiuj CSS”; pochodzenie i uwagi są rozwijane. W „Moim zestawie” próbki palety ustawiają kolor akcentu jednym kliknięciem. Podgląd dopasowuje tekst do kontrastu co najmniej 4,5:1, jeśli kolor źródłowy nie spełnia tego progu. Korekta jest oznaczona przy podglądzie i nie zmienia danych palety. Uwagi źródłowe trafiają również do briefu w ZIP.
