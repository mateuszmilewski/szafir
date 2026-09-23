# Weryfikacja źródeł v0.1

Data ostatniej weryfikacji: 2026-09-23

## Jobicy

- Oficjalna dokumentacja: <https://jobicy.com/jobs-rss-feed>
- Endpoint używany przez aplikację: `GET https://jobicy.com/api/v2/remote-jobs?count=18&geo=europe&tag=accounting`
- Uwierzytelnienie: niewymagane dla publicznego API.
- CORS: odpowiedź endpointu zawiera `Access-Control-Allow-Origin: *`, dlatego zapytanie działa z aplikacji statycznej.
- Limit aplikacji: dokładnie jedno żądanie po świadomym kliknięciu `Szukaj ofert`; brak pobierania w tle i automatycznego odświeżania.
- Warunki użycia: Jobicy zezwala na użycie ofert we własnych interfejsach przy zachowaniu atrybucji i kanonicznego linku. Każda karta zachowuje nazwę źródła i URL Jobicy.
- Bezpieczeństwo: pole `jobDescription` zawiera HTML. Adapter usuwa elementy wykonywalne i zamienia treść na zwykły tekst; URL-e są ograniczone do protokołów HTTP i HTTPS.

### Ograniczenia danych

Jobicy jest źródłem ofert zdalnych. Nie gwarantuje precyzyjnej lokalizacji biura, formy umowy ani trwałości modelu remote. Takie pola pozostają nieznane i obniżają pewność, nie sam wynik. Lokalny ranking jest gotowy na oferty z kolejnych zweryfikowanych adapterów.

## SmartRecruiters — aktywny adapter lokalny

- Oficjalna dokumentacja Posting API: <https://developers.smartrecruiters.com/docs/endpoints>
- Endpoint: `GET https://api.smartrecruiters.com/v1/companies/{companyIdentifier}/postings?limit=100&city=Katowice&country=pl`.
- Obserwowane identyfikatory firm: `Eurofins`, `SopraSteria1`, `SGS`.
- Uwierzytelnienie: niewymagane dla publicznych ogłoszeń tych firm.
- CORS: odpowiedź zawiera `Access-Control-Allow-Origin: *`; adapter działa bez backendu na GitHub Pages.
- Limit aplikacji: jedno żądanie na obserwowaną firmę, wyłącznie po kliknięciu `Szukaj ofert`.
- Zakres: aktywne oferty z Katowic, których tytuł wskazuje na finanse albo księgowość. Pole funkcji i działu pomaga w klasyfikacji, ale samo nie włącza ogólnego stanowiska do wyników.
- Normalizacja: język pochodzi z jawnego kodu języka ogłoszenia; lokalizacja, tryb hybrydowy/zdalny i rodzaj zatrudnienia są mapowane tylko wtedy, gdy API je podaje. Nieznana liczba dni w biurze pozostaje nieznana.
- Oryginał: każda karta prowadzi do publicznego ogłoszenia w SmartRecruiters i wskazuje zarówno platformę, jak i pracodawcę.
- Odporność: awaria jednej obserwowanej firmy nie usuwa odpowiedzi pozostałych firm.

## Portale otwierane osobno

Wyszukiwania poniżej pojawiają się po zakończeniu wyszukiwania Szafira jako osobne linki. Nie są otwierane automatycznie, aby przeglądarka nie blokowała wielu kart i żeby każde przejście było świadomą decyzją użytkownika. Aplikacja nie odczytuje tych stron automatycznie. Użytkownik może natomiast ręcznie wkleić dane pojedynczej, otwartej oferty do formularza Szafira; wtedy dane są normalizowane, otrzymują procent i istnieją wyłącznie w pamięci bieżącej karty.

### Pracuj.pl

- Data weryfikacji: 2026-09-23.
- Używane wyszukiwanie: <https://www.pracuj.pl/praca/katowice;wp/praca%20hybrydowa;wm,hybrid?rd=10&cc=5001002%2C5001004%2C5001005%2C5001006%2C5003001%2C5003002%2C5003003%2C5003004%2C5008001%2C5008002%2C5008004%2C5008005%2C5008007%2C5008003&tc=0>
- Aplikacja pokazuje link po świadomym kliknięciu `Szukaj ofert`; otwarcie następuje po osobnym kliknięciu użytkownika. Link nie jest monitorowany i nie wykonuje zapytań w tle.
- Publiczna strona działa w zwykłej karcie przeglądarki, ale jej endpoint danych odrzuca zapytania CORS z innego originu i jest chroniony przez Cloudflare. Statyczna aplikacja na GitHub Pages nie może odczytać ani znormalizować tych wyników.
- Pracuj.pl nie jest adapterem danych w v1. Link jest uczciwie oznaczonym wyszukiwaniem zewnętrznym; aplikacja nie obchodzi zabezpieczeń i nie udaje, że pobrała oferty.

### RocketJobs

- Wyszukiwanie: <https://rocketjobs.pl/oferty-pracy/slask/finanse>
- Publiczna strona nie zwraca nagłówka CORS pozwalającego aplikacji na GitHub Pages odczytać wyniki.
- Regulamin użytkowników zastrzega prawa do treści i nie daje aplikacji podstawy do automatycznego kopiowania bazy ofert: <https://rocketjobs.pl/terms-and-privacy-policies>.
- W v1 jest to wyłącznie link zewnętrzny.

### No Fluff Jobs

- Wyszukiwanie: <https://nofluffjobs.com/pl/katowice/finance>
- Strona jest technicznie dostępna przez CORS, ale regulamin zabrania kopiowania, pobierania i publikowania treści bez wyraźnej zgody: <https://nofluffjobs.com/static/No_Fluff_Jobs_Terms_and_Conditions.pdf?nocache=>.
- Samo techniczne powodzenie zapytania nie oznacza dozwolonej integracji. W v1 jest to wyłącznie link zewnętrzny.

### Solid.Jobs

- Wyszukiwanie: <https://solid.jobs/offers/finances;cities=Katowice;categories=Ksi%C4%99gowo%C5%9B%C4%87;subcategories=Ksi%C4%99gowo%C5%9B%C4%87;remotePossible=>
- Publiczna strona nie zwraca nagłówka CORS dla originu GitHub Pages. Regulamin opisuje treści i bazę serwisu jako chronione: <https://solid.jobs/about/terms>.
- Nie znaleziono udokumentowanego publicznego API do pobierania tej listy z aplikacji statycznej. W v1 jest to wyłącznie link zewnętrzny.

### LinkedIn

- Wyszukiwanie: <https://www.linkedin.com/jobs/search/?keywords=finanse&location=Katowice%2C%20Woj.%20%C5%9Al%C4%85skie%2C%20Polska>
- Szafir nie ma partnerskiego dostępu do API ofert LinkedIn ani sekretów, które można bezpiecznie umieścić w aplikacji statycznej.
- W v1 jest to wyłącznie link zewnętrzny.

### OLX Praca

- Wyszukiwanie: <https://www.olx.pl/praca/katowice/q-finanse/>
- Publiczna strona wyszukiwania zwróciła ochronę `403` dla automatycznego odczytu, a oficjalny Portal Deweloperski wymaga rejestracji aplikacji i uwierzytelnienia: <https://developer.olx.pl/>.
- Szafir nie obchodzi ochrony i w v1 pokazuje wyłącznie link zewnętrzny.

### ePraca

- Lista ofert: <https://oferty.praca.gov.pl/portal/lista-ofert>
- Ministerstwo publikuje oficjalną usługę integracyjną SOAP zwracającą paczki ZIP z JSON-em: <https://oferty.praca.gov.pl/portal/assets/for-integrators/instrukcja-pobierania-ofert-pracy-z-systemu-ePraca.pdf>.
- Endpoint integracyjny nie zwraca nagłówka CORS dla GitHub Pages, a format ZIP/SOAP nie jest bezpiecznie obsługiwany przez obecną aplikację bez dodatkowej warstwy serwerowej.
- Do czasu powstania zgodnej ścieżki bez backendu ePraca pozostaje wyszukiwaniem zewnętrznym.
