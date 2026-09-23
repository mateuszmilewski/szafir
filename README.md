# Szafir

Szafir to spokojna, polskojęzyczna aplikacja webowa pomagająca znaleźć i uporządkować oferty pracy z wielu źródeł. Jej rdzeniem jest przejrzysta **Ocena Szafira**: wynik 0–100%, który pokazuje, jak dobrze oferta odpowiada ustalonym preferencjom.

Pierwsza wersja jest celowo mała: jedna statyczna strona na GitHub Pages, bez konta, backendu, bazy danych i trwałego zapisu. Użytkownik świadomie uruchamia wyszukiwanie, a aplikacja pobiera, normalizuje, ocenia, sortuje i pokazuje oferty wyłącznie w bieżącej sesji.

## Dokumentacja

- [Specyfikacja produktu](docs/PRODUCT_SPEC.md)
- [Scoring i ranking](docs/SCORING.md)
- [Zasady UX i UI](docs/UX_RULES.md)
- [Model danych](docs/DATA_MODEL.md)
- [Rejestr decyzji](docs/DECISIONS.md)
- [Weryfikacja źródeł](docs/SOURCE_VERIFICATION.md)
- [Instrukcje dla agentów kodujących](AGENTS.md)

## Status

Pierwsza działająca wersja MVP jest dostępna w repozytorium.

## Uruchomienie

Otwórz plik `index.html` bezpośrednio w przeglądarce. Aplikacja nie wymaga instalacji zależności ani procesu budowania.

Wyszukiwanie uruchamia się dopiero po kliknięciu `Szukaj ofert`. Wspólna, oceniona lista korzysta z publicznego API Jobicy oraz oficjalnego Posting API SmartRecruiters dla ofert finansowych z Katowic publikowanych przez Eurofins, Sopra Steria i SGS. Aplikacja nie zawiera ofert demonstracyjnych.

Pracuj.pl, RocketJobs, No Fluff Jobs, Solid.Jobs, LinkedIn, OLX i ePraca są dostępne jako osobne linki wyszukiwania. Gdy portal nie udostępnia dozwolonego API działającego bez backendu, użytkownik może skopiować dane pojedynczej oferty do formularza `Dodaj skopiowaną ofertę`. Szafir policzy jej procent i dołączy ją do tej samej listy wyłącznie w bieżącej sesji. Żaden link nie jest monitorowany ani odświeżany w tle.

## GitHub Pages

Repozytorium jest gotowe do publikacji z katalogu głównego. W ustawieniach GitHub Pages wybierz wdrożenie z gałęzi i katalog `/ (root)`.

## Testy

Otwórz `tests/scoring.test.html` w przeglądarce. Strona testowa sprawdza progi, brakujące dane, dojazd, scoring i ranking sesyjny.
