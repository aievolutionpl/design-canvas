# Design Studio — zakres akceptacji

## Cel
Jeden projekt open-source AI Evolution Polska: dashboard, kanwa, tablice, assety i szkło. Istniejące adresy pozostają dostępne.

## Wymagane dowody
- Wspólna nawigacja pozwala przejść między wszystkimi modułami na telefonie, tablecie i desktopie; aktywna sekcja, brak nakładania na kontrolki.
- Gradienty i wzory rzeczywiście renderują się; skopiowany CSS renderuje te same zasoby w izolacji. Clipboard nie raportuje sukcesu po błędzie.
- Dashboard: wyszukiwanie, filtry, szczegóły stylu, ulubione i kopiowanie użytecznego pakietu dla agenta; eksport JSON zawiera realne tokeny i źródła.
- Nowe style są odróżnione od prognoz trendów i od oryginalnych systemów źródłowych. Nowe biblioteki mają zachowane licencje i pochodzenie.
- Nowe fonty mają sprawdzone pokrycie polskich znaków. Liczniki wynikają z danych.
- Canvas i tablice nadal działają: zoom, prezentacja, ulubione przy widocznych toolbarach. Bez maskowania błędów przez ukrywanie chrome testem.
- Zero błędów JS i brak poziomego overflow dokumentu przy 390, 768, 1440 px. Rzeczywiste zrzuty i wizualna inspekcja; pominięte testy jawnie oznaczone.
- README i źródła wyjaśniają uruchomienie, wkład open-source i różnice w licencjach.
- Po publikacji potwierdzenie aktualizacji na GitHub Pages i test kluczowych interakcji live.

## Anty-slop
Usunąć nieużyteczny filler, nie fałszować przetestowanych możliwości; style muszą różnić się kompozycją i typografią, nie tylko kolorem. Demonstracje wyglądu i działające efekty oznaczać osobno. Nie twierdzić, że sugestie fontów lub próbkowane kolory są oficjalnymi tokenami cudzej marki.
