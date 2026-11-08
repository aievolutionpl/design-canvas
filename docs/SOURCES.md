# Źródła i prawa

Pełny wykaz z rewizjami commitów, ścieżkami licencji, sumami SHA-256 i wykazem plików: [`data/source-ledger.json`](../data/source-ledger.json). Repozytoria poniżej są materiałem badawczym, **nie** twierdzimy, że stworzone tu style są ich kopiami lub oficjalnymi systemami.

- [Phosphor Icons](https://github.com/phosphor-icons/core) — MIT, copyright © 2023 Phosphor Icons; licencja dołączona w `assets/vendor/phosphor/LICENSE`. Rozprowadzamy tylko `arrow-right.svg`, `chart-bar.svg`, `globe.svg`, `magnifying-glass.svg` (wersja regular). Wykaz oryginalnych ścieżek i sum kontrolnych jest w ledgerze. SVG używają `currentColor`; jako zewnętrzne obrazy nie dziedziczą koloru z dokumentu.
- [USWDS](https://github.com/uswds/uswds), [Material Web](https://github.com/material-components/material-web), [deck.gl](https://github.com/visgl/deck.gl), [Modern Font Stacks](https://github.com/system-fonts/modern-font-stacks) — odnośniki badawcze, bez kopiowania plików do tej paczki. Dokładne licencje i wersje źródeł znajdują się w ledgerze; USWDS ma licencję mieszaną, dlatego należy czytać jej treść przed redystrybucją.
- Google Fonts — 18 nowych rodzin to linki do usługi, nie lokalne pliki krojów. Lista nazw i adresy CSS2 z testem `latin-ext` w ledgerze; licencje poszczególnych rodzin należy sprawdzić przed ich ewentualnym bundlowaniem.

Nie włączono unDraw. Ikony w `assets/vendor` są zasobami źródłowymi i nie zostały dodane do istniejącego katalogu `data/assets.json`.
