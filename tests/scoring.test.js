(function () {
  "use strict";

  const results = [];
  function test(name, callback) {
    try {
      callback();
      results.push({ name, passed: true });
    } catch (error) {
      results.push({ name, passed: false, error: error.message });
    }
  }
  function equal(actual, expected) {
    if (actual !== expected) throw new Error(`Oczekiwano ${expected}, otrzymano ${actual}`);
  }
  function truthy(value) {
    if (!value) throw new Error("Oczekiwano wartości prawdziwej");
  }
  function baseJob(overrides) {
    return {
      id: "test:1",
      location: { raw: "Katowice", city: "Katowice", country: "Polska" },
      workArrangement: { type: "remote", officeDaysPerWeek: 0, isPermanent: true },
      role: { family: "accounts-payable", evidence: ["faktury"] },
      language: { status: "polish", evidence: ["Treść po polsku"] },
      salary: { disclosed: false },
      contractTypes: ["employment"],
      ...overrides,
    };
  }
  const zeroCommute = { status: "not-needed", mode: "car", weeklyMinutes: 0, oneWayMinutes: 0, officeDaysPerWeek: 0 };

  test("84% nie otrzymuje pieczęci", () => equal(window.Szafir.scoring.getScoreMeta(84).seal, null));
  test("85% otrzymuje pieczęć Szafir poleca", () => equal(window.Szafir.scoring.getScoreMeta(85).seal, "Szafir poleca"));
  test("Wszystkie progi mają właściwe etykiety", () => {
    equal(window.Szafir.scoring.getScoreMeta(100).label, "Świetne dopasowanie");
    equal(window.Szafir.scoring.getScoreMeta(70).label, "Dobre dopasowanie");
    equal(window.Szafir.scoring.getScoreMeta(55).label, "Warto sprawdzić");
    equal(window.Szafir.scoring.getScoreMeta(35).label, "Słabe dopasowanie");
    equal(window.Szafir.scoring.getScoreMeta(34).label, "Raczej nie dla Ciebie");
  });
  test("Każdy poziom ma właściwy kolor semantyczny", () => {
    equal(window.Szafir.scoring.getScoreMeta(85).color, "#17633f");
    equal(window.Szafir.scoring.getScoreMeta(70).color, "#28744e");
    equal(window.Szafir.scoring.getScoreMeta(55).color, "#9a6300");
    equal(window.Szafir.scoring.getScoreMeta(35).color, "#a24a43");
    equal(window.Szafir.scoring.getScoreMeta(0).color, "#715b5b");
  });
  test("Brak danych obniża pewność, nie daje automatycznie zera", () => {
    const evaluation = window.Szafir.scoring.evaluateJob(baseJob({ location: { raw: "Nie podano" }, contractTypes: ["unknown"] }), zeroCommute);
    truthy(evaluation.baseScore > 0);
    equal(evaluation.confidence, 60);
  });
  test("Rola jest rozpoznawana z obowiązków mimo ogólnego tytułu", () => {
    const role = window.Szafir.adapterUtils.classifyRole("Specjalista", "Obsługa faktur i księgowanie faktur zakupowych");
    equal(role.family, "invoice-processing");
  });
  test("Tygodniowy dojazd jest liczony w obie strony", () => {
    const commute = window.Szafir.scoring.estimateCommute(
      baseJob({ workArrangement: { type: "hybrid", officeDaysPerWeek: 2 }, commuteMinutes: { car: 30, walk: 120 } }),
      { origin: { label: "Zagłębiowska Mediateka, Sosnowiec" }, commuteMode: "car" },
    );
    equal(commute.weeklyMinutes, 120);
  });
  test("Pełna zdalność nadal ma osobny komponent lokalizacji", () => {
    const evaluation = window.Szafir.scoring.evaluateJob(baseJob(), zeroCommute);
    const location = evaluation.components.find((component) => component.key === "location");
    equal(location.status, "known");
    equal(location.weight, 35);
  });
  test("Inna forma umowy pozostaje dopuszczalna", () => {
    const evaluation = window.Szafir.scoring.evaluateJob(baseJob({ contractTypes: ["b2b"] }), zeroCommute);
    const contract = evaluation.components.find((component) => component.key === "contract");
    equal(contract.fit, 0.6);
  });
  test("Reakcja zmienia kolejność, ale nie bazowy wynik", () => {
    const first = { job: baseJob({ id: "a" }), evaluation: { baseScore: 90 }, commute: zeroCommute };
    const second = { job: baseJob({ id: "b", role: { family: "accounts-payable" } }), evaluation: { baseScore: 80 }, commute: zeroCommute };
    const ranked = window.Szafir.ranking.applyRanking([first, second], { b: "liked" });
    equal(ranked[0].job.id, "b");
    equal(ranked[0].evaluation.baseScore, 80);
  });
  test("Reset reakcji odtwarza kolejność bazową", () => {
    const first = { job: baseJob({ id: "a" }), evaluation: { baseScore: 90 }, commute: zeroCommute };
    const second = { job: baseJob({ id: "b" }), evaluation: { baseScore: 80 }, commute: zeroCommute };
    const ranked = window.Szafir.ranking.applyRanking([first, second], {});
    equal(ranked[0].job.id, "a");
  });
  test("Preferowana lokalizacja trafia przed ofertę spoza regionu", () => {
    const local = { job: baseJob({ id: "local", location: { raw: "Katowice", city: "Katowice", country: "Polska" } }), evaluation: { baseScore: 70 }, commute: zeroCommute };
    const remote = { job: baseJob({ id: "remote", location: { raw: "Europa" } }), evaluation: { baseScore: 99 }, commute: zeroCommute };
    const ranked = window.Szafir.ranking.applyRanking([remote, local], {});
    equal(ranked[0].job.id, "local");
  });
  test("Oferta bez polskiego języka pozostaje na końcu", () => {
    const polish = { job: baseJob({ id: "pl" }), evaluation: { baseScore: 40 }, commute: zeroCommute };
    const english = { job: baseJob({ id: "en", language: { status: "not-polish", evidence: [] } }), evaluation: { baseScore: 99 }, commute: zeroCommute };
    const ranked = window.Szafir.ranking.applyRanking([english, polish], {});
    equal(ranked[ranked.length - 1].job.id, "en");
  });
  test("Detektor rozpoznaje polską treść ogłoszenia", () => {
    const language = window.Szafir.adapterUtils.detectLanguage("Specjalista AP", "Do obowiązków należy księgowanie faktur oraz współpraca z zespołem.");
    equal(language.status, "polish");
  });
  test("Obcy HTML jest zamieniany na bezpieczny tekst", () => {
    const text = window.Szafir.adapterUtils.plainText("<p>Faktury</p><script>złyKod()</script><style>body{display:none}</style>");
    equal(text, "Faktury");
  });
  test("Niebezpieczny protokół linku jest odrzucany", () => {
    equal(window.Szafir.adapterUtils.safeExternalUrl("javascript:alert(1)"), "https://jobicy.com/");
  });
  test("Lista zewnętrznych wyszukiwań zawiera wszystkie wskazane portale", () => {
    const searches = window.Szafir.CONFIG.externalSearches;
    ["pracuj", "rocketjobs", "nofluffjobs", "solidjobs", "linkedin", "olx", "epraca"].forEach((key) => {
      truthy(searches.some((search) => search.key === key));
    });
    const url = new URL(searches.find((search) => search.key === "pracuj").url);
    equal(url.protocol, "https:");
    equal(url.hostname, "www.pracuj.pl");
    equal(url.searchParams.get("rd"), "10");
    equal(url.searchParams.get("tc"), "0");
    truthy(url.pathname.includes("katowice;wp"));
    truthy(url.pathname.includes("hybrid"));
  });
  test("SmartRecruiters normalizuje lokalną polską ofertę do wspólnego modelu", () => {
    const job = window.Szafir.adapterUtils.normalizeSmartRecruiters({
      id: "123",
      name: "Specjalista ds. księgowości",
      company: { identifier: "Firma", name: "Firma" },
      location: { city: "Katowice", country: "pl", fullLocation: "Katowice, Poland", hybrid: true, remote: false },
      function: { label: "Finance" },
      department: { label: "Księgowość" },
      language: { code: "pl" },
      customField: [{ fieldLabel: "Type of Contract", valueLabel: "Permanent" }],
    });
    equal(job.location.city, "Katowice");
    equal(job.language.status, "polish");
    equal(job.workArrangement.type, "hybrid");
    equal(job.contractTypes[0], "employment");
    equal(job.source.key, "smartrecruiters");
  });
  test("Adapter SmartRecruiters nie dodaje ogólnej roli tylko dlatego, że leży w dziale Finance", () => {
    equal(window.Szafir.adapterUtils.isFinanceRelevant({ name: "Asystent z językiem obcym", function: { label: "Finance" } }), false);
    equal(window.Szafir.adapterUtils.isFinanceRelevant({ name: "Junior Financial Controller" }), true);
  });
  test("Import ręczny tworzy ocenialną ofertę bez trwałego zapisu", () => {
    const job = window.Szafir.adapterUtils.normalizeManualJob({
      id: "test-import",
      url: "https://www.pracuj.pl/praca/specjalista-ap,oferta,123",
      title: "Specjalista Accounts Payable",
      company: "Przykładowa firma",
      location: "Katowice",
      workArrangement: "hybrid",
      officeDaysPerWeek: "2",
      contractType: "employment",
      descriptionText: "Do obowiązków należy księgowanie faktur oraz współpraca z polskim zespołem.",
    });
    equal(job.source.label, "Pracuj.pl · import ręczny");
    equal(job.workArrangement.officeDaysPerWeek, 2);
    equal(job.language.status, "polish");
    equal(job.role.family, "accounts-payable");
    equal(job.contractTypes[0], "employment");
  });
  test("Lokalizacja ma większą wagę niż tryb pracy", () => {
    truthy(window.Szafir.CONFIG.weights.location > window.Szafir.CONFIG.weights["work-arrangement"]);
    equal(window.Szafir.CONFIG.weights.location, 35);
    equal(window.Szafir.CONFIG.weights["work-arrangement"], 15);
  });

  const list = document.querySelector("#results");
  results.forEach((result) => {
    const item = document.createElement("li");
    item.className = result.passed ? "pass" : "fail";
    item.textContent = result.passed ? `✓ ${result.name}` : `✕ ${result.name}: ${result.error}`;
    list.append(item);
  });
  const passed = results.filter((result) => result.passed).length;
  document.querySelector("#summary").textContent = `${passed} z ${results.length} testów zaliczonych.`;
  document.title = `${passed === results.length ? "OK" : "BŁĄD"} · Testy scoringu Szafira`;
})();
