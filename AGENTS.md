# Szafir — instrukcje pracy nad repozytorium

Przed rozpoczęciem zmian przeczytaj w całości:

1. `docs/DECISIONS.md`
2. `docs/PRODUCT_SPEC.md`
3. `docs/SCORING.md`
4. `docs/UX_RULES.md`
5. `docs/DATA_MODEL.md`

## Reguły nadrzędne

- Interfejs użytkownika ma być po polsku.
- MVP jest statyczną, jednostronicową aplikacją przeznaczoną do GitHub Pages.
- MVP nie ma backendu, kont, bazy danych ani trwałego zapisu w `localStorage` lub `IndexedDB`.
- Dane i reakcje użytkownika istnieją wyłącznie w bieżącej sesji. Odświeżenie lub zamknięcie strony może je usunąć.
- Wyszukiwanie uruchamia wyłącznie świadome kliknięcie użytkownika. Nic nie pobiera danych w tle.
- Nie rozszerzaj samodzielnie zakresu o CV Studio, tracker aplikacji, wiele profili, eksport/import, zaawansowaną mapę, powiadomienia ani deduplikację.
- Brak danych w ogłoszeniu nie oznacza negatywnej odpowiedzi. Obniża pewność oceny, a nie samą ocenę.
- Lokalizacja (Sosnowiec, Katowice, Bytom) i tryb pracy są równorzędnymi priorytetami o wadze 25. Polski język oferty ma wagę 20.
- Oferty rozpoznane jako niepolskojęzyczne pozostają widoczne, ale trafiają na koniec listy. Nieustalony język obniża pewność.
- Nie stosuj twardych wykluczeń ofert. Słabe dopasowania pozostają na dole listy.
- Wynik ma być wyjaśnialny; żadna istotna decyzja rankingowa nie może być ukrytym „AI score”.
- `Szafir poleca` jest jedynym poziomem specjalnego wyróżnienia i zaczyna się od 85%.
- Ocena ma być neutralnym dopasowaniem, nie emocjonalnym osądem oferty.

## Integracje ze źródłami

- Każde źródło musi mieć osobny adapter i nie może uszkodzić pozostałych wyników, gdy przestanie odpowiadać.
- Przed wdrożeniem źródła sprawdź aktualne API/feed, CORS, limity i warunki korzystania.
- Nie obchodź zabezpieczeń portali i nie dodawaj scrapingu naruszającego regulamin.
- Dane zewnętrzne są niezaufane: sanitizuj tekst i nigdy nie renderuj obcego HTML bez oczyszczenia.
- Podczas rozwoju wolno używać jawnie oznaczonych fixtures/mocków. Gotowe MVP powinno mieć co najmniej jedno zweryfikowane, działające źródło ofert.

## Jakość zmian

- Zachowuj separację: adaptery źródeł → normalizacja → scoring → ranking sesyjny → UI.
- Reguły scoringu powinny być czystymi, deterministycznymi funkcjami z testami jednostkowymi.
- Testuj brakujące dane, awarię pojedynczego źródła, timeout, skrajne wyniki i zmianę kolejności po reakcji użytkownika.
- Kolor wyniku zawsze uzupełniaj liczbą i etykietą tekstową.
- Dbaj o obsługę klawiatury, widoczny focus i czytelność na urządzeniach mobilnych.
- Jeżeli dokumenty wydają się sprzeczne, `docs/DECISIONS.md` zapisuje rozstrzygnięcia. Nowsze, jawne polecenie użytkownika ma pierwszeństwo.
