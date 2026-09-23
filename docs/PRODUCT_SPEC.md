# Szafir — specyfikacja produktu MVP v0.1

Data: 2026-09-19  
Status: gotowe do rozpoczęcia implementacji

## 1. Wizja

Szafir agreguje oferty pracy z kilku dozwolonych źródeł i układa je w jedną spokojną, przejrzystą listę. Użytkownik nie ma ręcznie przeglądać wielu portali ani zgadywać, dlaczego jedna oferta jest lepsza od drugiej.

Wartość v1 można streścić tak:

> Wiele źródeł, jedna spokojna lista, osobiście uporządkowana przez Szafira.

Aplikacja czerpie z wygody przeglądania znanej z Booking.com — szybkie skanowanie kart, jasna hierarchia i filtrowalne dane — ale nie kopiuje interfejsu ani mechanizmów presji.

## 2. Użytkownik i domena v1

Pierwsza wersja jest przygotowana dla jednej osoby szukającej pracy w finansach i księgowości operacyjnej.

Najważniejsze rodziny ról:

- Accounts Payable / AP;
- Invoice Processing / obsługa i rozliczanie faktur;
- Procure-to-Pay / P2P;
- Finance Operations;
- Accounting Specialist i Junior Accountant, jeżeli obowiązki pasują do powyższego profilu.

Role dopuszczalne, lecz słabiej preferowane:

- Accounts Receivable / AR;
- Order-to-Cash / O2C;
- billing i pokrewne operacje finansowe.

System analizuje nazwę stanowiska oraz opis obowiązków. Sam tytuł nie przesądza o dopasowaniu.

## 3. Najważniejsze priorytety

Kolejność priorytetów w ocenie:

1. lokalność — przede wszystkim Sosnowiec i Katowice;
2. polski język ogłoszenia lub wyraźne wymaganie języka polskiego;
3. dopasowanie roli i obowiązków;
4. tryb pracy, bez nadmiernego premiowania pełnej zdalności;
5. realny ciężar dojazdu i forma umowy.

Wagi v1 wynoszą: lokalizacja 35, tryb pracy 15, język 20, rola 20, dojazd 5 i forma umowy 5. Domyślny ranking pokazuje oferty z Sosnowca i Katowic przed pozostałymi, a oferty rozpoznane jako niepolskojęzyczne pozostawia na końcu listy.

Wynagrodzenie jest pokazywane, jeśli źródło je podaje, ale w v1 nie filtruje i nie wpływa na wynik.

Preferowane geografie:

- najwyższa grupa lokalna: Sosnowiec i Katowice, niezależnie od trybu pracy;
- następnie Bytom, Dąbrowa Górnicza, Będzin i inne rozsądnie skomunikowane miejsca w regionie;
- pełna praca zdalna pozostaje dopuszczalna, lecz sama zdalność nie wyprzedza lokalnej oferty.

Lokalizacja firmy pozostaje istotna także przy ofercie opisanej jako zdalna, ponieważ model pracy może się w przyszłości zmienić.

## 4. Zakres funkcjonalny MVP

### 4.1 Start sesji

Po otwarciu strony użytkownik widzi spokojny panel startowy. Aplikacja nie wykonuje jeszcze zapytań.

Użytkownik może:

- wybrać lub wpisać punkt startowy dojazdu;
- wybrać sposób dojazdu dostępny w v1: samochód albo pieszo;
- sprawdzić krótką informację o profilu wyszukiwania;
- kliknąć `Szukaj ofert`.

Punkt startowy jest wybierany świadomie w każdej sesji. Nie należy utrwalać dokładnego adresu ani sugerować, że aplikacja zna adres domowy.

### 4.2 Pobieranie

Po kliknięciu `Szukaj ofert` aplikacja:

1. uruchamia adaptery zweryfikowanych źródeł;
2. pokazuje postęp i nazwy źródeł, które już odpowiedziały;
3. kończy całą próbę po maksymalnie 15 sekundach;
4. pomija źródło, które zwróci błąd lub przekroczy timeout;
5. przechodzi do wyników także wtedy, gdy część źródeł zawiodła.

Limity v1:

- maksymalnie jedno żądanie na ogólne źródło podczas jednego wyszukiwania;
- maksymalnie jedno żądanie na obserwowaną firmę;
- brak automatycznego odświeżania i pracy w tle.

### 4.3 Normalizacja

Każda pobrana oferta jest mapowana do wspólnego modelu danych. Normalizowane są co najmniej:

- tytuł i rodzina roli;
- firma;
- lokalizacja;
- tryb pracy i liczba dni w biurze;
- forma umowy;
- wynagrodzenie, jeśli podano;
- data publikacji;
- źródło oraz bezpośredni link do oryginału;
- opis obowiązków i wymagania potrzebne do oceny;
- język ogłoszenia: polski, inny niż polski albo nieustalony.

Duplikaty mogą pozostać w v1. Deduplikacja nie może blokować wydania pierwszej wersji.

### 4.4 Ocena i sortowanie

Każda oferta otrzymuje:

- `Ocenę Szafira` od 0 do 100%;
- tekstową kategorię dopasowania;
- poziom pewności wynikający z kompletności danych;
- jedno krótkie zdanie `Dlaczego tak?`;
- rozbicie punktów dostępne w globalnym objaśnieniu lub szczegółach;
- specjalne wyróżnienie `Szafir poleca`, jeżeli wynik wynosi co najmniej 85%.

Lista startowo pokazuje najpierw oferty z Sosnowca i Katowic, następnie pozostałe oferty z polskim lub nieustalonym językiem, a na końcu oferty rozpoznane jako niepolskojęzyczne. W obrębie tych grup sortuje się malejąco według Oceny Szafira. Brak twardych wykluczeń: nawet bardzo słaba oferta pozostaje dostępna na dole listy.

Pełne reguły zawiera `SCORING.md`.

### 4.5 Lista ofert

Każda karta pokazuje bez otwierania:

- Ocenę Szafira, kolor oraz etykietę;
- ewentualne `Szafir poleca`;
- nazwę stanowiska i firmy;
- lokalizację;
- tryb pracy i liczbę dni w biurze, jeśli znane;
- język oferty;
- wynagrodzenie albo `Nie podano`;
- formę umowy, jeśli znana;
- czas jednego dojazdu i tygodniowy ciężar dojazdu, jeśli da się je policzyć;
- najważniejszy powód dopasowania;
- najważniejszą niewiadomą lub uwagę;
- źródło i link `Zobacz oryginalną ofertę`;
- akcje `Podoba mi się` oraz `Nie dla mnie`.

Kliknięcie karty rozwija szczegóły w miejscu albo w panelu bocznym. Nie następuje przeładowanie ani przejście na osobną podstronę.

### 4.6 Adaptacja w bieżącej sesji

Reakcje użytkownika zmieniają kolejność natychmiast, ale nie są zapisywane po zakończeniu sesji.

- `Podoba mi się`: zaznaczona oferta trafia wysoko, a podobne oferty otrzymują silny dodatni sygnał rankingowy.
- `Nie dla mnie`: zaznaczona oferta trafia na dół, a podobne oferty otrzymują ujemny sygnał rankingowy.
- Reakcja nie zmienia bazowej, wyjaśnialnej Oceny Szafira; zmienia tylko kolejność sesyjną.
- Użytkownik może cofnąć reakcję lub zresetować dostosowanie sesji.

Interfejs powinien jasno informować, że kolejność została dostosowana na podstawie reakcji w tej sesji.

## 5. Źródła ofert

Aktywne adaptery v1:

- Jobicy — publiczne API ofert zdalnych;
- SmartRecruiters — oficjalne publiczne API, ograniczone do Katowic i obserwowanych firm Eurofins, Sopra Steria oraz SGS; aplikacja pobiera tylko oferty rozpoznane jako finansowe lub księgowe.

Pracuj.pl, RocketJobs, No Fluff Jobs, Solid.Jobs, LinkedIn, OLX i ePraca są dostępne jako jawnie oznaczone wyszukiwania zewnętrzne. Aplikacja nie kopiuje ich treści automatycznie, gdy portal nie udostępnia dozwolonego API działającego z GitHub Pages. Użytkownik może jednak wkleić do formularza link oraz widoczne dane pojedynczej oferty. Po takim ręcznym dodaniu Szafir normalizuje dane, oblicza procent i umieszcza ofertę na wspólnej liście tylko na czas bieżącej sesji.

Ręczne dodanie pojedynczej oferty nie jest automatycznym scrapingiem ani importem całej sesji. Formularz nie wysyła danych poza aplikację i nie zapisuje ich w przeglądarce.

To są kandydaci, a nie gwarantowane integracje. Przed kodowaniem każdego adaptera trzeba aktualnie sprawdzić:

- dostępność i stabilność oficjalnego API lub feedu;
- działanie zapytań z przeglądarki i politykę CORS;
- limity;
- regulamin i dozwolone użycie danych;
- obecność ról i lokalizacji istotnych dla Szafira.

Nie należy zaczynać od bezpośredniego scrapingu Pracuj.pl, LinkedIn, No Fluff Jobs ani innych portali bez potwierdzonej, dozwolonej ścieżki integracji. Każda karta zawsze prowadzi do oryginalnego ogłoszenia.

## 6. Architektura v1

- statyczne HTML, CSS i JavaScript;
- jedna aplikacja typu SPA bez routingu wymagającego osobnych stron;
- hosting docelowy: GitHub Pages;
- brak backendu, logowania, prywatnej bazy i sekretów w kodzie przeglądarkowym;
- brak `localStorage`, `IndexedDB` i automatycznej synchronizacji w v1;
- stan bieżącej sesji przechowywany wyłącznie w pamięci aplikacji;
- integracje źródeł za adapterami o wspólnym interfejsie;
- deterministyczny scoring odseparowany od UI i pobierania danych.

Jeżeli źródło wymaga sekretnego klucza, nie może zostać bezpiecznie użyte bezpośrednio w tej architekturze i nie wchodzi do v1.

## 7. Wymagania niefunkcjonalne

- Pełna obsługa podstawowego przepływu na telefonie i desktopie.
- Pierwsze znaczące UI ma pojawić się natychmiast; wyszukiwanie pokazuje stan postępu.
- Awaria pojedynczego źródła nie blokuje wyników z pozostałych.
- Obce dane są traktowane jako niezaufane i sanitizowane przed wyświetleniem.
- Linki zewnętrzne są wyraźnie opisane i otwierane bez utraty aktualnej listy.
- Wszystkie elementy interaktywne działają z klawiatury i mają widoczny focus.
- Kolor nigdy nie jest jedynym nośnikiem znaczenia.
- UI nie używa presji, sztucznej pilności ani liczników konkurencji.

## 8. Poza zakresem v1

- konta, logowanie, backend i baza danych;
- trwałe zapisywanie ofert, notatek i preferencji;
- eksport/import sesji lub zaszyfrowane kopie zapasowe;
- synchronizacja między urządzeniami;
- automatyczne alerty i cykliczne pobieranie;
- CV Studio, generowanie CV i wiadomości aplikacyjnych;
- tracker wysłanych aplikacji;
- wiele profili, w tym osobny profil managerski;
- pełna mapa i rozbudowane filtry Booking-like;
- obowiązkowa deduplikacja;
- uczenie długoterminowe i ukryty ranking AI.

Elementy te są świadomie odłożone, a nie odrzucone na zawsze.

## 9. Kryteria akceptacji MVP

MVP jest gotowe, gdy:

1. strona działa jako statyczna aplikacja możliwa do publikacji na GitHub Pages;
2. przed kliknięciem `Szukaj ofert` nie pobiera ofert;
3. użytkownik może podać punkt startowy bez jego utrwalania;
4. działa co najmniej jedno zweryfikowane, dozwolone źródło, a pozostałe można symulować fixtures podczas developmentu;
5. częściowa awaria lub timeout źródła nie blokuje listy;
6. oferty są normalizowane i oceniane; lokalne oferty z Sosnowca i Katowic są pokazywane najpierw, a rozpoznane oferty niepolskojęzyczne na końcu;
7. każda karta pokazuje źródło, bezpośredni link, najważniejsze dane i powód wyniku;
8. `Szafir poleca` pojawia się wyłącznie od 85%;
9. brakujące dane obniżają pewność, nie wynik;
10. `Podoba mi się` i `Nie dla mnie` widocznie zmieniają kolejność tylko w bieżącej sesji;
11. szczegóły otwierają się bez opuszczania listy;
12. odświeżenie lub ponowne otwarcie strony nie przywraca reakcji ani postępu poprzedniej sesji;
13. interfejs jest czytelny na telefonie i desktopie oraz dostępny bez rozpoznawania samych kolorów.
14. brak informacji o języku obniża pewność, a jawnie niepolski język obniża wynik i priorytet rankingu.
15. użytkownik może ręcznie dodać pojedynczą ofertę z portalu zewnętrznego, otrzymać jej Ocenę Szafira i zobaczyć ją na wspólnej liście do końca bieżącej sesji.

## 10. Otwarte decyzje przed integracjami produkcyjnymi

Nie blokują budowy UI, modelu danych i scoringu:

- które źródło jako pierwsze przejdzie weryfikację techniczną i regulaminową;
- czy dla dojazdu użyć zewnętrznego routingu, danych przybliżonych czy wejścia ręcznego;
- dokładna lista obserwowanych firm i ich identyfikatorów w systemach ATS;
- czy stan sesji ma przetrwać zwykłe odświeżenie karty w ramach `sessionStorage` — domyślnie specyfikacja zakłada, że nie musi.
