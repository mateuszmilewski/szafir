# Szafir — rejestr decyzji produktowych

Ten dokument rozstrzyga sprzeczności między wcześniejszymi pomysłami a późniejszym, zawężonym zakresem MVP. Obowiązują decyzje poniżej, dopóki użytkownik jawnie ich nie zmieni.

## D-001 — Jedna statyczna aplikacja

MVP działa jako jedna statyczna strona na GitHub Pages. Nie ma backendu ani logowania.

## D-002 — Brak trwałego zapisu w v1

Odrzucono na ten etap wcześniejszy wariant `localStorage`/`IndexedDB` i eksportu kopii. Preferencje, wyniki i reakcje istnieją tylko w bieżącej sesji. Utrata ich po zamknięciu lub odświeżeniu jest akceptowalna.

## D-003 — Wyszukiwanie uruchamiane ręcznie

Aplikacja nie pobiera ofert przy samym wejściu i nic nie robi w tle. Użytkownik wybiera punkt startowy, a następnie świadomie klika `Szukaj ofert`.

## D-004 — Profil finansowy jako jedyny profil MVP

MVP skupia się na AP, fakturach, P2P i finansach operacyjnych. Wcześniejszy pomysł osobnego profilu managerskiego pozostaje kierunkiem na później.

## D-005 — Lokalność ma pierwszeństwo przed trybem zdalnym

Końcowe wagi to: lokalizacja 35, tryb pracy 15, język oferty 20, rola 20, dojazd 5, umowa 5. Oferty z Sosnowca i Katowic są w rankingu pokazywane przed pozostałymi ofertami z polskim lub nieustalonym językiem. Bytom, Dąbrowa Górnicza i Będzin pozostają wysoko punktowaną bliską okolicą, ale nie należą do pierwszej grupy. Zastępuje to wariant, w którym lokalizacja i zdalność miały po 25 punktów.

## D-006 — Wynagrodzenie nie wpływa na wynik

W v1 wszystkie poziomy wynagrodzenia są dopuszczalne. Widełki są pokazywane, jeżeli istnieją, ale nie filtrują i nie punktują.

## D-007 — Brak twardych wykluczeń

Nawet 5 dni w biurze lub mniej preferowana rola pozostają na liście. Słabe oferty trafiają niżej zamiast znikać.

## D-008 — Brakujące dane obniżają pewność

Brak informacji nie jest interpretowany jako `nie`. Nie odbiera punktów, lecz obniża widoczną pewność wyniku.

## D-009 — Jedna pieczęć

Istnieje jeden specjalny poziom rekomendacji: `Szafir poleca`, od 85%. Nie ma dodatkowego progu „super top”. `Pieczęć Szafira` jest nazwą motywu wyróżnienia, a nie osobnym poziomem.

## D-010 — Punkt startowy jest wybierany

Użytkownik wybiera punkt startowy każdej sesji, aby aplikacja nie sugerowała przechowywania prywatnego adresu. Okolice Zagłębiowskiej Mediateki przy ul. Kościelnej w Sosnowcu mogą być wygodną propozycją, ale nie zaszytym na stałe adresem domowym.

## D-011 — Lokalizacja nadal liczy się przy full remote

Informacja o lokalizacji biura pozostaje częścią oceny nawet dla obecnie zdalnej oferty, ponieważ zasady pracy mogą się zmienić.

## D-012 — Dynamiczne reakcje tylko w sesji

`Podoba mi się` silnie podbija podobne oferty, a `Nie dla mnie` obniża podobne. Wybrana oferta trafia odpowiednio wysoko lub nisko. Bazowa Ocena Szafira pozostaje widoczna i niezmieniona.

## D-013 — Duplikaty są akceptowalne

Deduplikacja nie jest wymogiem MVP. Powtórzona oferta z dwóch źródeł jest mniej szkodliwa niż skomplikowanie pierwszej wersji.

## D-014 — Szczegóły bez zmiany strony

Oferta rozwija się w miejscu, w panelu bocznym albo mobilnym bottom sheet. Użytkownik nie traci kontekstu listy.

## D-015 — Źródła muszą być legalne i odporne na awarie

Wskazane w rozmowach API i systemy ATS są kandydatami do ponownej weryfikacji. Pojedyncza awaria jest pomijana, a aplikacja pokazuje częściowe wyniki. Bez obchodzenia zabezpieczeń i bez sekretnego klucza w kodzie strony.

## D-016 — Dalszy rozwój jest odłożony

Mapa, rozbudowane filtry, zapis lokalny, eksport/import, CV Studio, tracker aplikacji i wiele profili są dobrymi kierunkami, ale nie należą do v1.

## D-017 — Polski język jest mocnym priorytetem

Oferta po polsku albo wyraźnie wymagająca języka polskiego otrzymuje pełne punkty za język. Oferta rozpoznana jako niepolskojęzyczna pozostaje dostępna, ale trafia na koniec listy. Nieustalony język obniża pewność, a nie wynik.

## D-018 — Zamknięte portale pozostają w obrębie `index.html`

MVP nie otrzymuje rozszerzenia przeglądarkowego, lokalnego robota ani serwera pośredniczącego. Dla portali bez dozwolonego API użytkownik może otworzyć link, a następnie ręcznie wkleić dane pojedynczej oferty. Szafir normalizuje je, ocenia i dodaje do wspólnej listy wyłącznie w bieżącej sesji. Nie jest to automatyczny scraping ani trwały import/eksport sesji.
