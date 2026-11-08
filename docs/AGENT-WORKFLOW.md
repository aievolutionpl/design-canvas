# Współpraca z agentem

## Bez instalacji wtyczki

Uruchom `studio.html` przez HTTP → wybierz styl → **Zobacz styl** → **Kopiuj Markdown**. Wklej tekst do rozmowy z agentem wraz z celem projektu i prawdziwą treścią. Przycisk **Pobierz JSON** eksportuje ten sam kontekst i pełny rekord stylu.

Nie ma obecnie automatycznego połączenia z edytorem, modelem ani serwerem MCP. Eksport jest przenośnym kontraktem projektowym, który można przekazać narzędziu obsługującemu tekst lub pliki.

## Co faktycznie eksportuje Studio?

```json
{
  "style": {"id": "identyfikator z katalogu", "name": "nazwa wybranego stylu"},
  "agentMarkdown": "pełny tekst kontekstu projektowego"
}
```

To ilustracja struktury, nie prawdziwy rekord. `style` w eksporcie zawiera cały obiekt źródłowy, nie tylko dwa pola pokazane powyżej. Markdown obejmuje źródło, kategorię, opis, zastosowanie, kompozycję, kolory, typografię, zasady i prompt. Tokeny CSS są dołączane, gdy istnieją w rekordzie.

## Agent może też czytać katalog bez interfejsu

Po sklonowaniu repo:

```python
import json
from pathlib import Path

styles = json.loads(Path('data/styles.json').read_text(encoding='utf-8'))
for style in styles:
    print(style['id'], style['name'], style.get('category', ''))

# Wybierz istniejące ID po uzgodnieniu kierunku z człowiekiem.
chosen_id = input('ID stylu: ').strip()
chosen = next(s for s in styles if s['id'] == chosen_id)
print(json.dumps(chosen, ensure_ascii=False, indent=2))
```

Kod tylko odczytuje lokalne dane. Nie wysyła ich do API i nie generuje strony.

## Podział odpowiedzialności

**Człowiek:** cel, odbiorca, materiały, akceptacja kierunku i ocena efektu.

**Agent:** selekcja pasujących stylów, przełożenie zasad na komponenty, implementacja i sprawdzenie wyniku.

**Studio:** wspólna referencja, źródła, tokeny i zasoby do wykorzystania.

## Kryteria odbioru projektu

- Treść i główna akcja mają czytelną hierarchię.
- Styl jest rozpoznawalny przez kompozycję i typografię, nie tylko kolor.
- Interfejs działa na telefonie, tablecie i desktopie.
- Kontrolki działają klawiaturą, fokus jest widoczny, kontrast zmierzony.
- Skopiowane zasoby działają również poza stroną biblioteki.
- Zachowano licencje i oznaczono brakujące lub niepewne dane.
- Raport oddziela wykonane testy od rzeczy niesprawdzonych.
