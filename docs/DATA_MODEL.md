# Szafir — model danych v0.1

## 1. Zasada przepływu

```text
zewnętrzne źródło
  → SourceJob (format adaptera)
  → NormalizedJob
  → JobEvaluation
  → RankedJob w pamięci sesji
  → karta i szczegóły UI
```

Adapter nie powinien liczyć wyniku ani renderować UI. Scoring nie powinien znać formatu konkretnego źródła.

## 2. Preferencje sesji

```ts
type SessionPreferences = {
  origin: {
    label: string;
    latitude?: number;
    longitude?: number;
  };
  commuteMode: "car" | "walk";
  targetRoleFamilies: RoleFamily[];
  preferredContract: "employment";
  searchStartedAt?: string;
};
```

`origin` jest wartością ulotną. Nie należy go zapisywać w trwałej pamięci przeglądarki ani wysyłać gdziekolwiek poza usługę routingu niezbędną do obliczenia trasy.

## 3. Znormalizowana oferta

```ts
type NormalizedJob = {
  id: string;
  source: {
    key: string;
    label: string;
    sourceJobId?: string;
    url: string;
    fetchedAt: string;
  };

  title: string;
  company: string;
  descriptionText: string;
  requirementsText?: string;
  publishedAt?: string;

  location: {
    raw: string;
    city?: string;
    region?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };

  workArrangement: {
    type: "remote" | "hybrid" | "onsite" | "unknown";
    officeDaysPerWeek?: number;
    occasionalOfficeDaysPerMonth?: number;
    isPermanent?: boolean;
    flexibleHours?: boolean;
    raw?: string;
  };

  role: {
    family: RoleFamily | "unknown";
    matchedTerms: string[];
    evidence: string[];
    level?: string;
  };

  language: {
    status: "polish" | "not-polish" | "unknown";
    evidence: string[];
  };

  salary: {
    disclosed: boolean;
    min?: number;
    max?: number;
    currency?: string;
    period?: "hour" | "month" | "year";
    gross?: boolean;
    raw?: string;
  };

  contractTypes: ContractType[];
};
```

```ts
type RoleFamily =
  | "accounts-payable"
  | "invoice-processing"
  | "procure-to-pay"
  | "finance-operations"
  | "accounting"
  | "accounts-receivable"
  | "order-to-cash"
  | "billing"
  | "other-finance";

type ContractType =
  | "employment"
  | "b2b"
  | "mandate"
  | "temporary"
  | "other"
  | "unknown";
```

## 4. Dane dojazdu

```ts
type CommuteEstimate = {
  status: "ready" | "not-needed" | "unknown" | "error";
  mode: "car" | "walk";
  oneWayMinutes?: number;
  officeDaysPerWeek?: number;
  weeklyMinutes?: number;
  provider?: string;
  confidence: "high" | "medium" | "low";
  note?: string;
};
```

Jeśli oferta jest stale w pełni zdalna, `weeklyMinutes` wynosi `0`. `not-needed` nie oznacza braku lokalizacji firmy; lokalizacja jest nadal oceniana osobno.

## 5. Ocena

```ts
type ScoreComponentKey =
  | "location"
  | "work-arrangement"
  | "language"
  | "role"
  | "commute"
  | "contract";

type ScoreComponent = {
  key: ScoreComponentKey;
  weight: number;
  status: "known" | "unknown";
  fit?: number;          // 0.0–1.0
  awardedPoints?: number;
  reason: string;
  evidence: string[];
};

type JobEvaluation = {
  baseScore: number;     // 0–100
  confidence: number;    // 0–100
  label:
    | "Świetne dopasowanie"
    | "Dobre dopasowanie"
    | "Warto sprawdzić"
    | "Słabe dopasowanie"
    | "Raczej nie dla Ciebie";
  seal: "Szafir poleca" | null;
  summary: string;
  warnings: string[];
  components: ScoreComponent[];
};
```

Każdy komponent przechowuje `evidence`, aby UI mogło wyjaśnić wynik na podstawie danych oferty.

## 6. Stan sesyjny i ranking

```ts
type SessionReaction = "liked" | "disliked" | null;

type RankedJob = {
  job: NormalizedJob;
  commute: CommuteEstimate;
  evaluation: JobEvaluation;
  session: {
    reaction: SessionReaction;
    similarityAdjustment: number;
    forcedPosition?: "top" | "bottom";
  };
  rankingValue: number;
};
```

Żadna z tych wartości nie jest trwała w v1.

## 7. Adapter źródła

```ts
type SourceStatus =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "timeout"
  | "error";

type SourceResult = {
  sourceKey: string;
  status: Exclude<SourceStatus, "idle" | "loading">;
  jobs: NormalizedJob[];
  receivedAt: string;
  errorMessage?: string;
};

interface JobSourceAdapter {
  key: string;
  label: string;
  fetchJobs(signal: AbortSignal): Promise<SourceResult>;
}
```

Każdy adapter:

- wykonuje maksymalnie jedno zapytanie na ogólne źródło albo obserwowaną firmę;
- respektuje wspólny `AbortSignal` i globalny timeout;
- zwraca pustą tablicę oraz status zamiast wywracać całą aplikację;
- mapuje dane do `NormalizedJob`;
- nigdy nie przekazuje surowego HTML bez sanitizacji.

## 8. Identyfikatory i duplikaty

`id` powinno być stabilne w obrębie bieżącego pobrania, np.:

```text
{sourceKey}:{sourceJobId}
```

Jeżeli źródło nie udostępnia identyfikatora, można użyć deterministycznego skrótu z URL-a. Łączenie duplikatów między źródłami nie jest wymagane w v1.

## 9. Zasady jakości danych

- Nie zamieniać brakującego pola na wartość negatywną.
- Zachować surową wartość obok wartości znormalizowanej, gdy interpretacja może być niepewna.
- Nie wyciągać precyzyjnej liczby dni w biurze z niejednoznacznego zwrotu typu `elastyczna hybryda`.
- Nie oznaczać oferty jako stałej pracy zdalnej bez wystarczającego dowodu.
- Nie oznaczać języka jako polskiego bez dowodu w treści lub wymaganiach ogłoszenia.
- Tekst do wyświetlenia ma pochodzić z bezpiecznego plain textu.
- Każda oferta musi zachować źródło i oryginalny URL.
