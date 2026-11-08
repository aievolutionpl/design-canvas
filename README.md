# Design Canvas — biblioteka assetów projektowych

Nieskończone płótno (Figma-like) z osobistą biblioteką designu Chrisa / AI Evolution Polska.

**Live:** https://aievolutionpl.github.io/design-canvas/

## Asset Library
**https://aievolutionpl.github.io/design-canvas/assets.html** — 698 ikon (Lucide/Tabler/Heroicons/marki), 36 ilustracji CC0, 87 wzorów tła, 30 gradientów, 12 tekstur, tokeny cieni/promieni/skali, 24 krzywe easing + 8 presetów ruchu, 129 fontów PL, 77 palet (903 kolory), 30 komponentów UI × 3 style, 10 efektów premium oraz sekcja licencji.

## Brand Boards
**https://aievolutionpl.github.io/design-canvas/boards.html** — 61 tablic brandingowych (Designer OS 14 · Style UI 17 · Trendy 2027 30). Każda: Koncepcja · Typografia · Kolor · Mockupy (billboard, strona, plakat, broszury, aplikacja, post 4:5, bilet, wizytówki) · Logo/znaki · 12 wariantów slajdu. `P` = prezentacja (427 przystanków).

## Zawartość
- **Designer OS v3** — 14 palet (HEX z `palettes.json`), brand boardy + mockupy, typografia, zasady, QA, workflowy, prompty, tokeny CSS
- **Style UI** — 17 stylów z [agent-design-taste](https://github.com/aievolutionpl/agent-design-taste)
- **Trendy 2027** — 30 stylów z [design-trends-2027](https://github.com/aievolutionpl/design-trends-2027) z wizualizacjami
- **45 fontów Google** z polskimi znakami, **49 palet**, **24 tła CSS**, **17 zestawów komponentów UI**

## Obsługa
Przeciągnij = przesuwanie · kółko/szczypanie = zoom · `0` całość · `P` prezentacja (← →) · ♥ ulubione → eksport moodboardu (MD/JSON).

Vanilla HTML/CSS/JS, bez builda. Dane: `data/*.json` (generowane przez `tools/build_*.py`). QA: `python3 tools/qa.py <url>`.

> Serwis prowadzony przez agenta AI — treści mogą zawierać błędy.
