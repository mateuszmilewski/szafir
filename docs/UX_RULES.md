# Szafir — zasady UX i UI v0.1

## 1. Charakter doświadczenia

Interfejs ma być:

- spokojny i komfortowy;
- profesjonalny, ale ciepły;
- informacyjny bez przeładowania;
- szybki do skanowania;
- wspierający, bez infantylizacji;
- inspirowany klarownością przeglądania w Booking.com, lecz bez kopiowania layoutu i bez mechanizmów presji.

Nie używamy:

- sztucznej pilności;
- komunikatów typu `Aplikuj teraz, zanim będzie za późno`;
- liczników innych kandydatów;
- streaków, rywalizacji i gamifikacji;
- emocjonalnego „niezadowolenia Szafira” z ofert.

## 2. Główny przepływ

```text
Wejście → wybór punktu startowego → Szukaj ofert
       → postęp źródeł → spokojne podsumowanie
       → lista od najlepszych → szczegóły w miejscu
       → Podoba mi się / Nie dla mnie → dynamiczna zmiana kolejności
```

Wszystko odbywa się na jednej stronie. Użytkownik nie powinien tracić pozycji na liście ani kontekstu wyszukiwania.

## 3. Ekran startowy

Elementy obowiązkowe:

- nazwa i krótki opis aplikacji;
- pole wyboru punktu startowego;
- wybór sposobu dojazdu: samochód / pieszo;
- krótkie, rozwijane podsumowanie aktywnego profilu;
- główny przycisk `Szukaj ofert`;
- informacja: `Dane i reakcje nie są zapisywane po zakończeniu sesji`.

Nie pokazujemy podsumowań „od ostatniej wizyty”, ponieważ v1 nie przechowuje historii.

## 4. Stan pobierania

Pobieranie może trwać kilkanaście sekund i powinno wyglądać wiarygodnie, nie nerwowo.

Przykładowe komunikaty:

- `Szukamy ofert w dostępnych źródłach…`
- `Odebrano oferty z 2 z 4 źródeł.`
- `Jedno źródło nie odpowiedziało — pokazujemy pozostałe wyniki.`
- `Porządkujemy i oceniamy oferty…`

Należy pokazać:

- determinate progress, jeśli znana jest liczba adapterów;
- status każdego źródła: oczekuje / gotowe / pominięte;
- możliwość przejścia do częściowych wyników po globalnym timeoutcie.

Nie używać fałszywego procentu postępu opartego wyłącznie na czasie.

## 5. Podsumowanie wyników

Po wyszukaniu:

> Znaleźliśmy 24 oferty. 5 otrzymało wyróżnienie „Szafir poleca”.

Jeżeli wyników wysokiej jakości nie ma:

> Nie znaleźliśmy dziś mocnego dopasowania. Poniżej pokazujemy najbliższe dostępne oferty.

Słabsze oferty można oddzielić spokojnym nagłówkiem:

> Pozostałe oferty — mogą odbiegać od Twoich preferencji.

## 6. Karta oferty

Karta ma zbalansowaną ilość informacji. Priorytet wizualny:

1. wynik, etykieta i ewentualna pieczęć;
2. stanowisko, firma i lokalizacja;
3. lokalność, tryb pracy, język, dni w biurze i dojazd;
4. wynagrodzenie i umowa;
5. krótkie `Dlaczego tak?`;
6. niewiadoma lub ostrzeżenie;
7. źródło i akcje.

Przykład:

```text
92% · Świetne dopasowanie · Szafir poleca
AP Specialist
Firma · Katowice

W pełni zdalnie · 10–13 tys. PLN · UoP
Stała praca zdalna i bardzo dobre dopasowanie do obsługi faktur.
? Elastyczne godziny nie zostały opisane.

Źródło: nazwa źródła
[Zobacz oryginalną ofertę] [Podoba mi się] [Nie dla mnie]
```

`Nie dla mnie` nie brzmi jak osąd firmy i nie usuwa oferty bez możliwości cofnięcia.

## 7. Szczegóły

Kliknięcie karty:

- rozwija treść w miejscu na desktopie albo otwiera dostępny panel boczny;
- na telefonie może użyć dolnego panelu;
- zachowuje pozycję listy;
- pokazuje pełniejszy opis, wymagania, wszystkie rozpoznane pola, rozbicie wyniku i link do źródła;
- ma wyraźny przycisk zamknięcia i poprawne zarządzanie focusem.

Pełna legenda scoringu jest dostępna raz przez `Jak liczy Szafir?`. Karta zawiera tylko własne rozbicie, nie powiela całej dokumentacji.

## 8. Dynamiczna lista

Po reakcji:

- zmiana pozycji powinna być widoczna, ale animacja krótka i spokojna;
- użytkownik otrzymuje komunikat, np. `Podobne oferty przesunęliśmy wyżej w tej sesji`;
- dostępne są `Cofnij` i `Resetuj dostosowanie`;
- bazowy procent na karcie pozostaje bez zmian;
- nie wolno sugerować, że system „nauczył się użytkownika” na przyszłość.

Nad listą należy stale wyjaśniać regułę bazową: oferty lokalne są pokazywane najpierw, a oferty bez polskiego języka pozostają na końcu. Lokalna oferta powinna mieć tekstową etykietę, nie tylko wyróżnienie kolorem.

## 9. Styl wizualny

Paleta kierunkowa:

- głęboki szafirowy jako kolor marki i głównych akcji;
- białe lub lekko zabarwione powierzchnie;
- grafitowy tekst;
- jeden ciepły akcent dla pozytywnych okazji;
- zieleń/bursztyn/czerwień jedynie jako semantyka wyniku.

Interfejs ma wyglądać dojrzale i lekko. Duże ilości czerwieni są niewskazane; bardzo słabe oferty mogą być wizualnie przygaszone.

## 10. Motyw Szafira

Szafir jest Australian Shepherdem. Motyw psa ma być detalem, nie dużą kreskówkową maskotką.

Dozwolone użycia:

- mała sylwetka lub łapka przy pieczęci `Szafir poleca`;
- subtelna łapka po zaznaczeniu dobrej oferty;
- niewielki odpoczywający Szafir w pustym stanie;
- delikatny detal przy szczególnie wygodnym dojeździe.

Każdy symbol musi mieć tekstowy odpowiednik. Nie używać mimiki psa do wyrażania dezaprobaty wobec oferty.

## 11. Język interfejsu

- prosty polski;
- krótkie zdania;
- neutralny, życzliwy ton;
- bez technicznego żargonu;
- nie udawać pewności przy brakujących danych.

Preferowane etykiety:

- `Ocena Szafira`;
- `Szafir poleca`;
- `Dlaczego tak?`;
- `Jak liczy Szafir?`;
- `Nie podano`;
- `Ograniczona pewność`;
- `Podoba mi się`;
- `Nie dla mnie`;
- `Zobacz oryginalną ofertę`;
- `Kolejność dostosowana w tej sesji`.

## 12. Dostępność i responsywność

- minimum WCAG AA dla kontrastu tekstu;
- wynik opisany liczbą i słowem, nie tylko kolorem;
- pełna obsługa klawiaturą;
- focus widoczny na wszystkich kontrolkach;
- ikony z nazwą dostępną dla czytnika;
- `prefers-reduced-motion` wyłącza animacje przesuwania;
- dotykowe cele o wygodnym rozmiarze;
- na telefonie lista pozostaje funkcją podstawową, a szczegóły nie przykrywają jej bez łatwego powrotu.
