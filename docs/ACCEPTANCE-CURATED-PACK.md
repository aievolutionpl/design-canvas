# Kuratorowana paczka źródeł — zakres i akceptacja

Pierwsza zatwierdzona paczka: daisyUI, SVG Spinners i Boring Avatars. NES.css, 98.css i Sakura pozostają na późniejszy etap, nie są częścią tego wydania.

## Kryteria przed implementacją
- 6–8 motywów daisyUI z rzeczywistych tokenów przypiętej rewizji. Mapowanie tokenów i konwersje przestrzeni kolorów opisane, nie zgadywane. Źródło `daisyui` oddzielone od autorskich stylów.
- 8 samodzielnych SVG Spinners i 12 SVG wygenerowanych prawdziwym Boring Avatars. React może być zależnością procesu importu, nigdy runtime strony.
- SVG mają stabilny identyfikator `lib:name`, zapis w `assets/icons/curated/` i zachowane źródło/licencję. Dodanie poprzez istniejący typ `icons` zapewnia zgodność z JSON zestawu i CLI.
- Pliki licencji MIT, przypięte commity, hashe, źródła i przepis generacji w ledgerze.
- Motywy widoczne w Studio, na Kanwie i Tablicach. Biblioteki assetów rozróżnialne w filtrach. Brak nieprawdziwych oficjalnych oznaczeń typografii.
- Podgląd → dodanie do zestawu → prawdziwy pobrany ZIP → CLI validate/export. SVG eksportowane bez zmiany bajtów, bez brakujących zależności.
- Animacje uruchamiane świadomie, zatrzymywalne, respektują reduced-motion. Same etykiety animacji nie dowodzą ruchu.
- Przeglądarka 390/768/1440: brak poziomego overflow, błędów aplikacji, używalne kontrolki. Wizualna inspekcja rzeczywistych screenshotów.
- Dotychczasowe testy i nowe testy danych/E2E przechodzą. Liczebności z danych, nie z pamięci.
- Merge dopiero po testach; potwierdzenie publicznego wdrożenia odczytem konkretnych plików oraz akcji.

## Dowody
Wyniki zostaną zapisane w `evidence/curated-pack/`. Ten dokument jest zakresem, nie deklaracją PASS.
