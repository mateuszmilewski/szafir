# Ocena Szafira — scoring i ranking v0.1

## 1. Cel

Ocena Szafira ma odpowiadać na pytanie:

> Jak dobrze ta konkretna oferta pasuje do jawnych preferencji użytkownika?

Nie jest oceną jakości firmy, moralnym werdyktem ani obietnicą, że oferta okaże się dobra. Szafir jest spokojnym przewodnikiem, nie sędzią.

## 2. Wyniki pokazywane użytkownikowi

Każda oferta ma trzy odrębne wartości:

1. `baseScore` — bazowa Ocena Szafira 0–100%;
2. `confidence` — kompletność danych użytych do obliczenia 0–100%;
3. `sessionAdjustment` — wpływ reakcji `Podoba mi się` / `Nie dla mnie` na kolejność, niewłączany do bazowej oceny.

Dzięki temu wynik jest stabilny i możliwy do wyjaśnienia, a lista może reagować na użytkownika bez udawania, że treść oferty się zmieniła.

## 3. Wagi końcowe

| Składnik | Waga |
|---|---:|
| Lokalizacja | 35 |
| Tryb pracy i liczba dni w biurze | 15 |
| Język oferty | 20 |
| Rola, obowiązki i zgodność domeny | 20 |
| Tygodniowy ciężar dojazdu | 5 |
| Forma umowy | 5 |
| **Razem** | **100** |

Wynagrodzenie, świeżość oraz kompletność ogłoszenia są pokazywane, lecz nie dodają ani nie odejmują punktów w v1.

## 4. Brakujące dane

Nieznane pole nie dostaje zera. Zamiast tego jego waga jest pomijana w mianowniku:

```text
baseScore = round(100 × suma(waga × dopasowanie) / suma(wag znanych składników))
confidence = suma(wag znanych składników)
```

`dopasowanie` ma wartość od `0.0` do `1.0`.

Przykład: znane są tylko lokalizacja, tryb pracy i rola. Pewność wynosi `35 + 15 + 20 = 70%`. Wynik jest liczony z tych 70 punktów i prezentowany jako np. `88% · ograniczona pewność`.

Poziomy pewności:

- 80–100%: bez dodatkowego ostrzeżenia;
- 60–79%: `ograniczona pewność`;
- poniżej 60%: `mało danych do pełnej oceny`.

## 5. Reguły składników

Wartości są domyślną, testowalną konfiguracją startową. Powinny znajdować się w jednym pliku konfiguracyjnym, a nie być rozproszone po komponentach UI.

### 5.1 Tryb pracy — 15 punktów

| Sytuacja | Dopasowanie |
|---|---:|
| Stała praca w pełni zdalna | 0.90 |
| Zdalna z okazjonalną obecnością, maks. 1 raz/miesiąc | 0.90 |
| Zdalna, lecz trwałość modelu niepotwierdzona | 0.80 |
| Hybryda: 1 dzień w biurze/tydzień | 1.00 |
| Hybryda: 2 dni w biurze/tydzień | 0.95 |
| Hybryda: 3 dni w biurze/tydzień | 0.90 |
| Hybryda: 4 dni w biurze/tydzień | 0.80 |
| Stacjonarnie: 5 dni w biurze/tydzień | 0.65 |
| Brak wiarygodnej informacji | składnik nieznany |

Określenie `remote` bez informacji, czy model jest trwały, powinno wygenerować uwagę, np. `Nie potwierdzono, czy praca zdalna jest stała`.

### 5.2 Rola i obowiązki — 20 punktów

| Klasa dopasowania | Przykłady | Dopasowanie |
|---|---|---:|
| Główny cel | AP, invoice processing, P2P | 1.00 |
| Mocno powiązana | finance operations, accounting specialist z fakturami/płatnościami | 0.80 |
| Opcjonalna | AR, O2C, billing | 0.55 |
| Inna księgowość/finanse | ogólna rola bez istotnych obowiązków docelowych | 0.30 |
| Poza domeną | brak realnego związku | 0.00 |

Klasyfikacja bierze pod uwagę tytuł i treść. Trafne obowiązki mogą podnieść ofertę mimo ogólnego tytułu; sam pasujący tytuł bez odpowiednich obowiązków nie powinien automatycznie dawać maksimum.

### 5.3 Tygodniowy ciężar dojazdu — 5 punktów

```text
weeklyCommuteMinutes = oneWayMinutes × 2 × officeDaysPerWeek
```

| Tygodniowy czas | Dopasowanie |
|---|---:|
| 0–60 min | 1.00 |
| 61–120 min | 0.85 |
| 121–240 min | 0.60 |
| 241–400 min | 0.35 |
| powyżej 400 min | 0.10 |
| Nie można policzyć czasu lub dni | składnik nieznany |

Dla stałej pracy w pełni zdalnej ciężar dojazdu wynosi zero. Jeżeli ogłoszenie dopuszcza sporadyczne wizyty, należy je uwzględnić, o ile częstotliwość jest znana.

### 5.4 Lokalizacja — 35 punktów

| Lokalizacja biura | Dopasowanie |
|---|---:|
| Sosnowiec lub Katowice | 1.00 |
| Bytom, Dąbrowa Górnicza lub Będzin | 0.85 |
| Inne rozsądnie bliskie miejsce w regionie | 0.65 |
| Pozostała Polska | 0.20 |
| Nieznana | składnik nieznany |

Składnik obowiązuje również dla ofert zdalnych. Pokazuje odporność oferty na ewentualną zmianę polityki biurowej, ale nie zastępuje informacji o aktualnym trybie pracy.

### 5.5 Forma umowy — 5 punktów

| Forma | Dopasowanie |
|---|---:|
| Umowa o pracę | 1.00 |
| Inna dopuszczalna forma | 0.60 |
| Nieznana | składnik nieznany |

Żadna forma umowy nie powoduje twardego odrzucenia.

### 5.6 Język oferty — 20 punktów

| Sytuacja | Dopasowanie |
|---|---:|
| Ogłoszenie jest po polsku lub wyraźnie wymaga języka polskiego | 1.00 |
| Ogłoszenie jest rozpoznane jako niepolskojęzyczne | 0.00 |
| Nie można wiarygodnie ustalić języka | składnik nieznany |

Rozpoznany brak polskiego nie usuwa oferty. Obniża jej wynik, a jawna reguła rankingu przesuwa ją na koniec listy. Brak danych o języku obniża wyłącznie pewność.

## 6. Kolory i etykiety

| Wynik | Kolor semantyczny | Etykieta |
|---|---|---|
| 85–100% | ciemna zieleń | `Świetne dopasowanie` |
| 70–84% | zieleń | `Dobre dopasowanie` |
| 55–69% | bursztyn | `Warto sprawdzić` |
| 35–54% | łagodna czerwień | `Słabe dopasowanie` |
| 0–34% | przygaszona czerwień/szarość | `Raczej nie dla Ciebie` |

Kolor zawsze występuje razem z procentem i etykietą.

## 7. Pieczęć Szafira

- Jeden poziom wyróżnienia: `Szafir poleca`.
- Próg: `baseScore >= 85`.
- Nie ma dodatkowej pieczęci „super top”.
- Przy niepełnych danych obok pieczęci nadal pokazuje się informację o ograniczonej pewności.

## 8. Krótkie wyjaśnienie

Na karcie należy wygenerować jedno proste zdanie na podstawie najmocniejszego plusa i najważniejszej niewiadomej lub słabości, np.:

- `Stała praca zdalna i bardzo dobre dopasowanie do AP.`
- `Dobra rola, ale wymagane są 3 dni w biurze.`
- `Pełna zdalność; wynagrodzenie i forma umowy nie zostały podane.`

Globalny przycisk `Jak liczy Szafir?` otwiera legendę wag i zasad. Nie należy powtarzać pełnego matematycznego opisu na każdej karcie.

## 9. Ranking sesyjny

Początkowo lista używa jawnych grup priorytetu:

1. oferty z Sosnowca i Katowic z polskim lub nieustalonym językiem;
2. pozostałe oferty z polskim lub nieustalonym językiem;
3. oferty rozpoznane jako niepolskojęzyczne.

W obrębie każdej grupy:

```text
rankingValue = baseScore
```

Po reakcji użytkownika:

- wybrana oferta `Podoba mi się`: priorytet na górze bieżącej listy;
- oferty podobne: dodatni modyfikator do `rankingValue`;
- wybrana oferta `Nie dla mnie`: priorytet na końcu bieżącej listy;
- oferty podobne: ujemny modyfikator do `rankingValue`.

Startowa wartość modyfikatora podobieństwa to `±15` punktów rankingowych, ograniczona łącznie do przedziału `-30…+30`. Jest to parametr techniczny do kalibracji, nie część bazowej oceny.

Podobieństwo jest deterministycznie liczone z:

- rodziny roli i rozpoznanych obowiązków;
- trybu pracy oraz liczby dni w biurze;
- klastra lokalizacji;
- formy umowy.

Modyfikator:

- działa wyłącznie w pamięci bieżącej sesji;
- jest odwracalny;
- nie ukrywa ofert;
- nie zmienia wyświetlanego `baseScore`;
- powinien być wyjaśniony komunikatem `Kolejność dostosowana w tej sesji`.

## 10. Testy obowiązkowe

- każdy próg punktowy i kolor;
- dokładnie 84% bez pieczęci oraz 85% z pieczęcią;
- brak danych nie daje zera i poprawnie obniża `confidence`;
- rola rozpoznana z obowiązków mimo nietypowego tytułu;
- poprawne liczenie tygodniowego dojazdu;
- pełna zdalność nadal otrzymuje osobny wynik lokalizacji;
- każda forma umowy pozostaje dopuszczalna;
- reakcje zmieniają ranking, ale nie `baseScore`;
- reset reakcji odtwarza kolejność bazową.
- lokalna oferta trafia przed ofertę spoza preferowanego obszaru;
- oferta rozpoznana jako niepolskojęzyczna trafia na koniec listy;
- nieustalony język obniża pewność, a nie sam wynik.
