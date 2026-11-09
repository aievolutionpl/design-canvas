# Źródła i prawa

Pełny wykaz z rewizjami commitów, ścieżkami licencji, sumami SHA-256 i wykazem plików: [`data/source-ledger.json`](../data/source-ledger.json). Repozytoria wskazane jako badawcze są inspiracją, nie oficjalnymi systemami; paczka daisyUI poniżej pochodzi bezpośrednio z motywów źródłowych.

- [Phosphor Icons](https://github.com/phosphor-icons/core) — MIT, copyright © 2023 Phosphor Icons; licencja dołączona w `assets/vendor/phosphor/LICENSE`. Rozprowadzamy tylko `arrow-right.svg`, `chart-bar.svg`, `globe.svg`, `magnifying-glass.svg` (wersja regular). Wykaz oryginalnych ścieżek i sum kontrolnych jest w ledgerze. SVG używają `currentColor`; jako zewnętrzne obrazy nie dziedziczą koloru z dokumentu.
- [USWDS](https://github.com/uswds/uswds), [Material Web](https://github.com/material-components/material-web), [deck.gl](https://github.com/visgl/deck.gl), [Modern Font Stacks](https://github.com/system-fonts/modern-font-stacks) — odnośniki badawcze, bez kopiowania plików do tej paczki. Dokładne licencje i wersje źródeł znajdują się w ledgerze; USWDS ma licencję mieszaną, dlatego należy czytać jej treść przed redystrybucją.
- Google Fonts — 18 nowych rodzin to linki do usługi, nie lokalne pliki krojów. Lista nazw i adresy CSS2 z testem `latin-ext` w ledgerze; licencje poszczególnych rodzin należy sprawdzić przed ich ewentualnym bundlowaniem.

Nie włączono unDraw. Ikony Phosphor w `assets/vendor` nie zostały dodane do katalogu `data/assets.json`.

## Paczka kuratorska

- [daisyUI](https://github.com/saadeghi/daisyui) — MIT; 8 motywów z plików CSS przypiętej rewizji. Źródłowe OKLCH przeliczono matematycznie do sRGB z obcięciem kanałów; mapowanie nazw na tokeny katalogu jest pochodne, nie identyczne z API daisyUI. `system-ui` i `monospace` to lokalne fallbacki, nie oficjalne fonty motywu.
- [SVG Spinners](https://github.com/n3r4zzurr0/svg-spinners) — MIT; 8 oryginalnych animowanych plików SMIL. Animacja pozostaje aktywna; ograniczenie ruchu obsługuje aplikacja osadzająca.
- [Boring Avatars](https://github.com/boringdesigners/boring-avatars) — MIT; 12 samodzielnych SVG wygenerowanych ze źródłowej biblioteki React, bez zależności runtime. Receptury, commity, SHA-256 wszystkich wyników i licencji: ledger. Licencje dołączono w `assets/vendor/<nazwa>/LICENSE`.

Powtórzenie importu: `python3 tools/import_curated_pack.py` (wymaga sieci, Node i npm; paczki budujące instalowane są w katalogu tymczasowym, poza repo). Weryfikacja: `python3 tests/test-curated-data.py`. Kolory w przestrzeni poza sRGB mogą ulec zmianie przez clipping; to nie jest CSS gamut mapping.
