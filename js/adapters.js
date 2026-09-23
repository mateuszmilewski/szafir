(function () {
  "use strict";

  window.Szafir = window.Szafir || {};

  function plainText(value) {
    if (!value) return "";
    const documentNode = new DOMParser().parseFromString(String(value), "text/html");
    documentNode.querySelectorAll("script, style, noscript, template").forEach((node) => node.remove());
    return (documentNode.body.textContent || "").replace(/\s+/g, " ").trim();
  }

  function safeExternalUrl(value, fallback) {
    try {
      const url = new URL(String(value || ""));
      return ["http:", "https:"].includes(url.protocol) ? url.href : (fallback || "https://jobicy.com/");
    } catch (_error) {
      return fallback || "https://jobicy.com/";
    }
  }

  function detectLanguage(title, description) {
    const text = `${title || ""} ${description || ""}`.toLocaleLowerCase("pl");
    if (!text.trim()) return { status: "unknown", evidence: [] };

    const explicitPolish = /język polski|jezyk polski|polish language|fluent polish|polish speaker/.test(text);
    const polishMarkers = text.match(/\b(praca|pracy|pracę|oraz|obowiązki|wymagania|oferujemy|doświadczenie|znajomość|księgowość|faktur|płatności|zespole|stanowisku|umowa)\b/g) || [];
    const polishCharacters = text.match(/[ąćęłńóśźż]/g) || [];
    const englishMarkers = text.match(/\b(the|and|with|for|requirements|responsibilities|experience|you will|we are|accounting team)\b/g) || [];

    if (explicitPolish || polishMarkers.length >= 3 || polishCharacters.length >= 3) {
      return { status: "polish", evidence: [explicitPolish ? "Wymieniono język polski." : "Treść ogłoszenia jest po polsku."] };
    }
    if (englishMarkers.length >= 2) return { status: "not-polish", evidence: ["Treść ogłoszenia jest w innym języku niż polski."] };
    return { status: "unknown", evidence: ["Nie udało się wiarygodnie ustalić języka ogłoszenia."] };
  }

  function classifyRole(title, description) {
    const haystack = `${title} ${description}`.toLocaleLowerCase("pl");
    const rules = [
      ["accounts-payable", ["accounts payable", " account payable", " ap specialist", "ap clerk"]],
      ["invoice-processing", ["invoice processing", "invoice processor", "księgowanie faktur", "obsługa faktur"]],
      ["procure-to-pay", ["procure-to-pay", "procure to pay", "p2p"]],
      ["accounts-receivable", ["accounts receivable", " ar specialist", "cash application", "collections specialist", "collection specialist"]],
      ["order-to-cash", ["order-to-cash", "order to cash", "o2c"]],
      ["billing", ["billing", "invoicing"]],
      ["finance-operations", ["finance operations", "financial operations", "payment operations"]],
      ["accounting", ["accountant", "accounting", "księgowy", "księgowa", "księgowość", "księgowości"]],
      ["other-finance", ["finance", "financial", "finanse", "controller", "controlling", "treasury"]],
    ];

    for (const [family, terms] of rules) {
      const matchedTerms = terms.filter((term) => haystack.includes(term.trim()));
      if (matchedTerms.length > 0) {
        return {
          family,
          matchedTerms,
          evidence: matchedTerms.map((term) => `Rozpoznano: ${term.trim()}`),
        };
      }
    }

    return { family: "unknown", matchedTerms: [], evidence: [] };
  }

  function normalizeJobicy(job) {
    const title = plainText(job.jobTitle) || "Nie podano stanowiska";
    const descriptionText = plainText(job.jobDescription || job.jobExcerpt);
    const role = classifyRole(title, descriptionText);
    const language = detectLanguage(title, descriptionText);
    const salaryDisclosed = Number.isFinite(Number(job.salaryMin)) || Number.isFinite(Number(job.salaryMax));
    const jobTypes = Array.isArray(job.jobType) ? job.jobType.map(plainText) : [plainText(job.jobType)].filter(Boolean);

    return {
      id: `jobicy:${String(job.id || job.url || title)}`,
      source: {
        key: "jobicy",
        label: "Jobicy",
        sourceJobId: String(job.id || ""),
        url: safeExternalUrl(job.url),
        fetchedAt: new Date().toISOString(),
      },
      title,
      company: plainText(job.companyName) || "Nie podano firmy",
      descriptionText: descriptionText || "Źródło nie udostępniło opisu w czytelnym formacie.",
      requirementsText: "Nie podano osobno.",
      publishedAt: job.pubDate || undefined,
      location: {
        raw: plainText(job.jobGeo) || "Nie podano",
        country: undefined,
      },
      workArrangement: {
        type: "remote",
        officeDaysPerWeek: 0,
        isPermanent: undefined,
        raw: "Oferta zdalna; trwałość modelu niepotwierdzona",
      },
      role,
      language,
      salary: {
        disclosed: salaryDisclosed,
        min: salaryDisclosed && job.salaryMin !== null ? Number(job.salaryMin) || undefined : undefined,
        max: salaryDisclosed && job.salaryMax !== null ? Number(job.salaryMax) || undefined : undefined,
        currency: plainText(job.salaryCurrency) || undefined,
        period: plainText(job.salaryPeriod) || undefined,
        raw: salaryDisclosed ? undefined : "Nie podano",
      },
      contractTypes: jobTypes.some((type) => /full.?time/i.test(type)) ? ["unknown"] : ["unknown"],
    };
  }

  function smartRecruitersMetadata(job) {
    const customFields = Array.isArray(job.customField) ? job.customField : [];
    return [
      job.function && job.function.label,
      job.department && job.department.label,
      ...customFields.map((field) => field && field.valueLabel),
    ].map(plainText).filter(Boolean).join(" · ");
  }

  function isFinanceRelevant(job) {
    const title = plainText(job.name).toLocaleLowerCase("pl");
    return /accounts? payable|accounts? receivable|accountant|accounting|finance|financial|controller|controlling|collections?|invoice|księgow|finans|faktur|p2p|treasury|billing|bookkeep|cash application|order.?to.?cash/.test(title);
  }

  function smartRecruitersContractTypes(job) {
    const values = (Array.isArray(job.customField) ? job.customField : [])
      .map((field) => `${field && field.fieldLabel ? field.fieldLabel : ""} ${field && field.valueLabel ? field.valueLabel : ""}`)
      .join(" ")
      .toLocaleLowerCase("pl");

    if (/contract of employment|umowa o prac|\bpermanent\b/.test(values)) return ["employment"];
    if (/\bb2b\b/.test(values)) return ["b2b"];
    if (/civil contract|mandate|zlecen|zleceń/.test(values)) return ["mandate"];
    if (/fixed.?term|temporary/.test(values)) return ["temporary"];
    return ["unknown"];
  }

  function smartRecruitersWorkArrangement(job) {
    const location = job.location || {};
    if (location.remote === true) {
      return {
        type: "remote",
        officeDaysPerWeek: 0,
        isPermanent: undefined,
        raw: "Praca zdalna według SmartRecruiters; trwałość modelu niepotwierdzona",
      };
    }
    if (location.hybrid === true) {
      return {
        type: "hybrid",
        officeDaysPerWeek: undefined,
        isPermanent: undefined,
        raw: "Praca hybrydowa; źródło nie podaje liczby dni w biurze",
      };
    }
    return {
      type: "onsite",
      officeDaysPerWeek: 5,
      isPermanent: undefined,
      raw: "Praca stacjonarna według SmartRecruiters",
    };
  }

  function normalizeSmartRecruiters(job) {
    const title = plainText(job.name) || "Nie podano stanowiska";
    const metadata = smartRecruitersMetadata(job);
    const companyIdentifier = plainText(job.company && job.company.identifier);
    const companyName = plainText(job.company && job.company.name) || "Nie podano firmy";
    const languageCode = plainText(job.language && job.language.code).toLocaleLowerCase("pl");
    const location = job.location || {};
    const sourceUrl = `https://jobs.smartrecruiters.com/${encodeURIComponent(companyIdentifier)}/${encodeURIComponent(String(job.id || ""))}`;
    const language = languageCode === "pl"
      ? { status: "polish", evidence: ["Język ogłoszenia według SmartRecruiters: polski."] }
      : languageCode
        ? { status: "not-polish", evidence: [`Język ogłoszenia według SmartRecruiters: ${languageCode}.`] }
        : detectLanguage(title, metadata);

    return {
      id: `smartrecruiters:${companyIdentifier}:${String(job.id || job.uuid || title)}`,
      source: {
        key: "smartrecruiters",
        label: `SmartRecruiters · ${companyName}`,
        sourceJobId: String(job.id || job.uuid || ""),
        url: safeExternalUrl(sourceUrl, "https://jobs.smartrecruiters.com/"),
        fetchedAt: new Date().toISOString(),
      },
      title,
      company: companyName,
      descriptionText: metadata
        ? `Dane skrócone z publicznego API: ${metadata}. Pełny opis znajduje się w oryginalnym ogłoszeniu.`
        : "Publiczne API udostępniło podstawowe dane. Pełny opis znajduje się w oryginalnym ogłoszeniu.",
      requirementsText: "Pełne wymagania są dostępne w oryginalnym ogłoszeniu.",
      publishedAt: job.releasedDate || undefined,
      location: {
        raw: plainText(location.fullLocation) || [plainText(location.city), plainText(location.region)].filter(Boolean).join(", ") || "Nie podano",
        city: plainText(location.city) || undefined,
        region: plainText(location.region) || undefined,
        country: plainText(location.country) || undefined,
      },
      workArrangement: smartRecruitersWorkArrangement(job),
      role: classifyRole(title, metadata),
      language,
      salary: { disclosed: false, raw: "Nie podano" },
      contractTypes: smartRecruitersContractTypes(job),
    };
  }

  function manualSourceLabel(url) {
    let hostname = "inne źródło";
    try {
      hostname = new URL(url).hostname.replace(/^www\./, "").toLocaleLowerCase("pl");
    } catch (_error) {
      return "Inne źródło · import ręczny";
    }
    const labels = {
      "pracuj.pl": "Pracuj.pl",
      "rocketjobs.pl": "RocketJobs",
      "nofluffjobs.com": "No Fluff Jobs",
      "solid.jobs": "Solid.Jobs",
      "linkedin.com": "LinkedIn",
      "olx.pl": "OLX Praca",
      "oferty.praca.gov.pl": "ePraca",
    };
    return `${labels[hostname] || hostname} · import ręczny`;
  }

  function normalizeManualJob(input) {
    const title = plainText(input.title) || "Nie podano stanowiska";
    const descriptionText = plainText(input.descriptionText) || "Nie podano opisu.";
    const company = plainText(input.company) || "Nie podano firmy";
    const locationRaw = plainText(input.location) || "Nie podano";
    const arrangementType = ["remote", "hybrid", "onsite"].includes(input.workArrangement)
      ? input.workArrangement
      : "unknown";
    const parsedDays = Number(input.officeDaysPerWeek);
    const officeDaysPerWeek = arrangementType === "remote"
      ? 0
      : arrangementType === "onsite"
        ? 5
        : arrangementType === "hybrid" && Number.isInteger(parsedDays) && parsedDays >= 1 && parsedDays <= 5
          ? parsedDays
          : undefined;
    const rawArrangement = arrangementType === "remote"
      ? "Praca zdalna; trwałość modelu niepotwierdzona"
      : arrangementType === "hybrid"
        ? officeDaysPerWeek ? `Hybryda: ${officeDaysPerWeek} dni w biurze w tygodniu` : "Hybryda; liczba dni w biurze niepodana"
        : arrangementType === "onsite"
          ? "Praca stacjonarna"
          : "Nie podano trybu pracy";
    const contractType = ["employment", "b2b", "mandate", "temporary", "other"].includes(input.contractType)
      ? input.contractType
      : "unknown";
    const url = safeExternalUrl(input.url, "");

    return {
      id: `manual:${String(input.id || url || title)}`,
      source: {
        key: "manual",
        label: manualSourceLabel(url),
        sourceJobId: "",
        url,
        fetchedAt: new Date().toISOString(),
      },
      title,
      company,
      descriptionText,
      requirementsText: "Dane skopiowane ręcznie przez użytkownika.",
      publishedAt: undefined,
      location: { raw: locationRaw, city: locationRaw, country: undefined },
      workArrangement: {
        type: arrangementType,
        officeDaysPerWeek,
        isPermanent: undefined,
        raw: rawArrangement,
      },
      role: classifyRole(title, descriptionText),
      language: detectLanguage(title, descriptionText),
      salary: { disclosed: false, raw: "Nie podano" },
      contractTypes: [contractType],
    };
  }

  function sourceResult(sourceKey, status, jobs, errorMessage) {
    return {
      sourceKey,
      status,
      jobs,
      receivedAt: new Date().toISOString(),
      errorMessage,
    };
  }

  const jobicyAdapter = {
    key: "jobicy",
    label: "Jobicy · oferty zdalne",
    async fetchJobs(signal) {
      try {
        const response = await fetch("https://jobicy.com/api/v2/remote-jobs?count=18&geo=europe&tag=accounting", {
          method: "GET",
          headers: { Accept: "application/json" },
          signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = await response.json();
        const jobs = Array.isArray(payload.jobs) ? payload.jobs.map(normalizeJobicy) : [];
        return sourceResult("jobicy", jobs.length ? "success" : "empty", jobs);
      } catch (error) {
        const timedOut = error && error.name === "AbortError";
        return sourceResult(
          "jobicy",
          timedOut ? "timeout" : "error",
          [],
          timedOut ? "Przekroczono czas odpowiedzi." : "Źródło chwilowo nie odpowiedziało.",
        );
      }
    },
  };

  const smartRecruitersCompanies = Object.freeze([
    Object.freeze({ identifier: "Eurofins", city: "Katowice" }),
    Object.freeze({ identifier: "SopraSteria1", city: "Katowice" }),
    Object.freeze({ identifier: "SGS", city: "Katowice" }),
  ]);

  const smartRecruitersAdapter = {
    key: "smartrecruiters",
    label: "SmartRecruiters · Katowice",
    async fetchJobs(signal) {
      const requests = smartRecruitersCompanies.map(async (company) => {
        const params = new URLSearchParams({ limit: "100", city: company.city, country: "pl" });
        const endpoint = `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(company.identifier)}/postings?${params}`;
        const response = await fetch(endpoint, {
          method: "GET",
          headers: { Accept: "application/json" },
          signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = await response.json();
        return (Array.isArray(payload.content) ? payload.content : [])
          .filter(isFinanceRelevant)
          .map(normalizeSmartRecruiters);
      });

      const settled = await Promise.allSettled(requests);
      const successful = settled.filter((result) => result.status === "fulfilled");
      const jobs = successful.flatMap((result) => result.value);
      if (successful.length > 0) return sourceResult("smartrecruiters", jobs.length ? "success" : "empty", jobs);

      const timedOut = settled.some((result) => result.status === "rejected" && result.reason && result.reason.name === "AbortError");
      return sourceResult(
        "smartrecruiters",
        timedOut ? "timeout" : "error",
        [],
        timedOut ? "Przekroczono czas odpowiedzi." : "Źródło chwilowo nie odpowiedziało.",
      );
    },
  };

  window.Szafir.adapters = [smartRecruitersAdapter, jobicyAdapter];

  window.Szafir.adapterUtils = {
    classifyRole,
    detectLanguage,
    isFinanceRelevant,
    normalizeManualJob,
    normalizeJobicy,
    normalizeSmartRecruiters,
    plainText,
    safeExternalUrl,
    smartRecruitersContractTypes,
  };
})();
