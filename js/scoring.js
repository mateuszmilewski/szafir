(function () {
  "use strict";

  window.Szafir = window.Szafir || {};

  const CONFIG = window.Szafir.CONFIG;

  function knownComponent(key, fit, reason, evidence) {
    const weight = CONFIG.weights[key];
    return {
      key,
      weight,
      status: "known",
      fit,
      awardedPoints: Number((weight * fit).toFixed(1)),
      reason,
      evidence: evidence || [],
    };
  }

  function unknownComponent(key, reason) {
    return {
      key,
      weight: CONFIG.weights[key],
      status: "unknown",
      reason,
      evidence: [],
    };
  }

  function scoreWorkArrangement(job) {
    const arrangement = job.workArrangement || { type: "unknown" };
    if (arrangement.type === "remote") {
      if (arrangement.isPermanent === true) {
        return knownComponent("work-arrangement", CONFIG.workFit.remotePermanent, "Stała praca w pełni zdalna.", [arrangement.raw || "remote"]);
      }
      if ((arrangement.occasionalOfficeDaysPerMonth || 0) <= 1 && arrangement.occasionalOfficeDaysPerMonth !== undefined) {
        return knownComponent("work-arrangement", CONFIG.workFit.remoteOccasional, "Praca zdalna z najwyżej jedną wizytą w miesiącu.", [arrangement.raw || "remote"]);
      }
      return knownComponent("work-arrangement", CONFIG.workFit.remoteUnconfirmed, "Oferta jest zdalna, lecz trwałość tego modelu nie została potwierdzona.", [arrangement.raw || "remote"]);
    }

    if (arrangement.type === "hybrid") {
      const days = arrangement.officeDaysPerWeek;
      const fit = CONFIG.workFit.hybridByDays[days];
      if (fit !== undefined) {
        return knownComponent("work-arrangement", fit, `${days} ${days === 1 ? "dzień" : "dni"} w biurze w tygodniu.`, [arrangement.raw || "hybryda"]);
      }
      return unknownComponent("work-arrangement", "Hybryda bez wiarygodnej liczby dni w biurze.");
    }

    if (arrangement.type === "onsite") {
      return knownComponent("work-arrangement", CONFIG.workFit.onsite, "Praca stacjonarna przez 5 dni w tygodniu.", [arrangement.raw || "stacjonarnie"]);
    }

    return unknownComponent("work-arrangement", "Nie podano wiarygodnego trybu pracy.");
  }

  function scoreRole(job) {
    const family = job.role && job.role.family;
    const fit = CONFIG.roleFit[family];
    if (fit === undefined) return unknownComponent("role", "Nie udało się wiarygodnie rozpoznać rodziny roli.");

    const reasons = {
      "accounts-payable": "Bardzo dobre dopasowanie do Accounts Payable.",
      "invoice-processing": "Bardzo dobre dopasowanie do obsługi faktur.",
      "procure-to-pay": "Bardzo dobre dopasowanie do procesu P2P.",
      "finance-operations": "Mocno powiązana rola w operacjach finansowych.",
      accounting: "Ogólna rola księgowa, częściowo zgodna z profilem.",
      "accounts-receivable": "Rola AR jest dopuszczalna, ale mniej preferowana.",
      "order-to-cash": "Rola O2C jest dopuszczalna, ale mniej preferowana.",
      billing: "Billing jest dopuszczalny, ale mniej preferowany.",
      "other-finance": "Rola finansowa bez mocnego związku z docelowym obszarem.",
    };
    return knownComponent("role", fit, reasons[family], (job.role && job.role.evidence) || []);
  }

  function scoreLanguage(job) {
    const language = job.language || { status: "unknown", evidence: [] };
    if (language.status === "polish") {
      return knownComponent("language", 1, "Oferta jest po polsku lub wyraźnie wymaga języka polskiego.", language.evidence);
    }
    if (language.status === "not-polish") {
      return knownComponent("language", 0, "Oferta nie jest dostępna w języku polskim.", language.evidence);
    }
    return unknownComponent("language", "Nie udało się wiarygodnie ustalić języka oferty.");
  }

  function scoreCommute(commute) {
    if (!commute || (commute.status !== "ready" && commute.status !== "not-needed") || commute.weeklyMinutes === undefined) {
      return unknownComponent("commute", (commute && commute.note) || "Nie można wiarygodnie policzyć tygodniowego dojazdu.");
    }

    const minutes = commute.weeklyMinutes;
    let fit = 0.1;
    if (minutes <= 60) fit = 1;
    else if (minutes <= 120) fit = 0.85;
    else if (minutes <= 240) fit = 0.6;
    else if (minutes <= 400) fit = 0.35;
    return knownComponent("commute", fit, minutes === 0 ? "Brak cotygodniowego dojazdu." : `${minutes} min dojazdu łącznie w tygodniu.`, []);
  }

  function scoreLocation(job) {
    const city = (job.location && job.location.city) || "";
    const country = (job.location && job.location.country) || "";
    const raw = (job.location && job.location.raw) || "";
    const normalized = `${city} ${country} ${raw}`.toLocaleLowerCase("pl");

    if (/sosnowiec|katowice/.test(normalized)) return knownComponent("location", 1, "Najwyżej preferowana lokalizacja: Sosnowiec lub Katowice.", [raw]);
    if (/bytom|dąbrowa górnicza|dabrowa gornicza|będzin|bedzin/.test(normalized)) return knownComponent("location", 0.85, "Bliska lokalizacja w regionie.", [raw]);
    if (/gliwice|tychy|chorzów|chorzow|zabrze|mysłowice|myslowice/.test(normalized)) return knownComponent("location", 0.65, "Inna rozsądnie bliska lokalizacja w regionie.", [raw]);
    if (/polska|poland|\bpl\b/.test(normalized)) return knownComponent("location", 0.2, "Lokalizacja w Polsce poza preferowanym obszarem.", [raw]);
    return unknownComponent("location", "Nie znamy lokalizacji biura, niezależnie od aktualnego trybu pracy.");
  }

  function scoreContract(job) {
    const types = job.contractTypes || [];
    if (types.includes("employment")) return knownComponent("contract", 1, "Umowa o pracę.", ["employment"]);
    const knownOther = types.find((type) => type && type !== "unknown");
    if (knownOther) return knownComponent("contract", 0.6, "Inna dopuszczalna forma współpracy.", [knownOther]);
    return unknownComponent("contract", "Nie podano wiarygodnej formy umowy.");
  }

  function getScoreMeta(score) {
    if (score >= 85) return { label: "Świetne dopasowanie", seal: "Szafir poleca", color: "#17633f" };
    if (score >= 70) return { label: "Dobre dopasowanie", seal: null, color: "#28744e" };
    if (score >= 55) return { label: "Warto sprawdzić", seal: null, color: "#9a6300" };
    if (score >= 35) return { label: "Słabe dopasowanie", seal: null, color: "#a24a43" };
    return { label: "Raczej nie dla Ciebie", seal: null, color: "#715b5b" };
  }

  function buildSummary(components, warnings) {
    const known = components.filter((component) => component.status === "known");
    const strongest = known.sort((a, b) => b.awardedPoints - a.awardedPoints)[0];
    const unknown = components.find((component) => component.status === "unknown");
    const first = strongest ? strongest.reason : "Mamy za mało danych do wiarygodnego podsumowania.";
    const caveat = warnings[0] || (unknown && unknown.reason);
    return caveat ? `${first} ${caveat}` : first;
  }

  function evaluateJob(job, commute) {
    const components = [
      scoreLocation(job),
      scoreWorkArrangement(job),
      scoreLanguage(job),
      scoreRole(job),
      scoreCommute(commute),
      scoreContract(job),
    ];
    const known = components.filter((component) => component.status === "known");
    const knownWeight = known.reduce((sum, component) => sum + component.weight, 0);
    const weightedFit = known.reduce((sum, component) => sum + component.weight * component.fit, 0);
    const baseScore = knownWeight ? Math.round((100 * weightedFit) / knownWeight) : 0;
    const meta = getScoreMeta(baseScore);
    const warnings = [];

    if (job.language && job.language.status === "not-polish") {
      warnings.push("Oferta nie jest po polsku, dlatego pozostaje na końcu listy.");
    }
    if (job.workArrangement && job.workArrangement.type === "remote" && job.workArrangement.isPermanent !== true) {
      warnings.push("Nie potwierdzono, czy praca zdalna jest stała.");
    }
    if (!job.salary || !job.salary.disclosed) warnings.push("Nie podano wynagrodzenia.");

    return {
      baseScore,
      confidence: knownWeight,
      label: meta.label,
      seal: meta.seal,
      color: meta.color,
      summary: buildSummary(components, warnings),
      warnings,
      components,
    };
  }

  function estimateCommute(job, preferences) {
    if (job.workArrangement && job.workArrangement.type === "remote" && job.workArrangement.officeDaysPerWeek === 0) {
      return {
        status: "not-needed",
        mode: preferences.commuteMode,
        oneWayMinutes: 0,
        officeDaysPerWeek: 0,
        weeklyMinutes: 0,
        confidence: job.workArrangement.isPermanent ? "high" : "medium",
        note: job.workArrangement.isPermanent ? undefined : "Tryb zdalny nie został potwierdzony jako stały.",
      };
    }

    const supportedOrigin = /Zagłębiowska Mediateka|Dworzec PKP Sosnowiec Główny/i.test(preferences.origin.label);
    const oneWayMinutes = supportedOrigin && job.commuteMinutes ? job.commuteMinutes[preferences.commuteMode] : undefined;
    const officeDays = job.workArrangement && job.workArrangement.officeDaysPerWeek;
    if (Number.isFinite(oneWayMinutes) && Number.isFinite(officeDays)) {
      return {
        status: "ready",
        mode: preferences.commuteMode,
        oneWayMinutes,
        officeDaysPerWeek: officeDays,
        weeklyMinutes: oneWayMinutes * 2 * officeDays,
        provider: "szacunek orientacyjny",
        confidence: "low",
        note: "Orientacyjny czas dla proponowanego punktu startowego.",
      };
    }

    return {
      status: "unknown",
      mode: preferences.commuteMode,
      confidence: "low",
      note: supportedOrigin ? "Źródło nie podało danych potrzebnych do obliczenia dojazdu." : "Dla wpisanego punktu startowego nie mamy jeszcze usługi wyznaczania trasy.",
    };
  }

  window.Szafir.scoring = {
    evaluateJob,
    estimateCommute,
    getScoreMeta,
    scoreCommute,
    scoreLanguage,
  };
})();
