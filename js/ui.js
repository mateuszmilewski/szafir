(function () {
  "use strict";

  window.Szafir = window.Szafir || {};

  const componentLabels = {
    "work-arrangement": "Tryb pracy",
    language: "Język oferty",
    role: "Rola",
    commute: "Dojazd",
    location: "Lokalizacja",
    contract: "Umowa",
  };

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function formatWork(job) {
    const arrangement = job.workArrangement || {};
    if (arrangement.type === "remote") return "Praca zdalna";
    if (arrangement.type === "hybrid" && arrangement.officeDaysPerWeek) {
      const daysLabel = arrangement.officeDaysPerWeek === 1 ? "1 dzień" : `${arrangement.officeDaysPerWeek} dni`;
      return `Hybryda · ${daysLabel} w biurze`;
    }
    if (arrangement.type === "hybrid") return "Hybryda · dni niepodane";
    if (arrangement.type === "onsite") return "Praca stacjonarna";
    return "Tryb pracy: nie podano";
  }

  function formatSalary(salary) {
    if (!salary || !salary.disclosed) return "Wynagrodzenie: nie podano";
    if (salary.raw) return salary.raw;
    const formatter = new Intl.NumberFormat("pl-PL");
    const range = salary.min && salary.max
      ? `${formatter.format(salary.min)}–${formatter.format(salary.max)}`
      : formatter.format(salary.min || salary.max);
    return `${range} ${salary.currency || ""} / ${salary.period === "yearly" || salary.period === "year" ? "rok" : salary.period === "hourly" || salary.period === "hour" ? "godz." : "mies."}`.trim();
  }

  function formatContract(types) {
    const labels = { employment: "Umowa o pracę", b2b: "B2B", mandate: "Umowa zlecenie", temporary: "Umowa tymczasowa", other: "Inna umowa" };
    const known = (types || []).filter((type) => type !== "unknown").map((type) => labels[type] || "Inna umowa");
    return known.length ? known.join(", ") : "Umowa: nie podano";
  }

  function formatLanguage(language) {
    if (language && language.status === "polish") return "Język: polski";
    if (language && language.status === "not-polish") return "Język: inny niż polski";
    return "Język: nie ustalono";
  }

  function formatCommute(commute) {
    if (!commute || commute.weeklyMinutes === undefined) return "Dojazd: brak danych";
    if (commute.weeklyMinutes === 0) return "Dojazd: 0 min / tydz.";
    return `Dojazd: ${commute.oneWayMinutes} min w jedną stronę · ${commute.weeklyMinutes} min / tydz.`;
  }

  function confidenceLabel(value) {
    if (value >= 80) return `Pewność danych: ${value}%`;
    if (value >= 60) return `Ograniczona pewność · ${value}% danych`;
    return `Mało danych do pełnej oceny · ${value}%`;
  }

  function sourceStatusText(status) {
    const labels = {
      idle: "oczekuje",
      loading: "szukamy",
      success: "gotowe",
      empty: "brak wyników",
      timeout: "pominięte · timeout",
      error: "pominięte · błąd",
    };
    return labels[status] || status;
  }

  function renderSources(container, sources) {
    container.replaceChildren();
    sources.forEach((source) => {
      const row = element("li", "source-row");
      const icon = element("span", "source-icon", source.status === "success" ? "✓" : source.status === "error" || source.status === "timeout" ? "–" : "·");
      icon.setAttribute("aria-hidden", "true");
      row.append(icon, element("span", "source-name", source.label), element("span", "source-status", sourceStatusText(source.status)));
      container.append(row);
    });
  }

  function renderExternalSearches(container, searches) {
    const fragment = document.createDocumentFragment();
    searches.forEach((search) => {
      const row = element("li", "external-source-row");
      const text = element("div", "external-source-copy");
      text.append(element("strong", "", search.label), element("span", "", search.note));
      const link = element("a", "button button-quiet", "Otwórz ↗");
      link.href = search.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", `Otwórz wyszukiwanie ${search.label} w nowej karcie`);
      row.append(text, link);
      fragment.append(row);
    });
    container.replaceChildren(fragment);
  }

  function renderComponentList(item) {
    const list = element("ul", "component-list");
    item.evaluation.components.forEach((component) => {
      const row = element("li");
      row.append(
        element("span", "component-name", componentLabels[component.key]),
        element("span", "component-reason", component.reason),
        element("span", "component-score", component.status === "known" ? `${component.awardedPoints} / ${component.weight} pkt` : "brak danych"),
      );
      list.append(row);
    });
    return list;
  }

  function renderJobCard(item, onReaction) {
    const card = element("article", "job-card");
    card.dataset.jobId = item.job.id;
    card.style.setProperty("--score-color", item.evaluation.color);

    const top = element("div", "job-topline");
    const scoreCluster = element("div", "score-cluster");
    const score = element("span", "score-pill");
    score.append(element("strong", "", `${item.evaluation.baseScore}%`), document.createTextNode(item.evaluation.label));
    scoreCluster.append(score);
    if (item.evaluation.seal) scoreCluster.append(element("span", "seal", `🐾 ${item.evaluation.seal}`));
    if (window.Szafir.ranking.isPreferredLocal(item.job)) scoreCluster.append(element("span", "local-badge", "Lokalna oferta"));
    const confidence = element("span", "confidence", confidenceLabel(item.evaluation.confidence));
    top.append(scoreCluster, confidence);

    const title = element("h3", "job-title", item.job.title);
    const company = element("p", "company-line", `${item.job.company} · ${item.job.location.raw || "Nie podano lokalizacji"}`);
    const facts = element("ul", "facts-list");
    [formatWork(item.job), formatLanguage(item.job.language), formatCommute(item.commute), formatSalary(item.job.salary), formatContract(item.job.contractTypes)].forEach((fact) => facts.append(element("li", "", fact)));

    const why = element("p", "why");
    why.append(element("strong", "", "Dlaczego tak? "), document.createTextNode(item.evaluation.summary));
    const warning = element("p", "warning-line", item.evaluation.warnings[0] ? `? ${item.evaluation.warnings[0]}` : "Wszystkie główne dane potrzebne do oceny są dostępne.");
    const sourceLine = element("p", "source-line", `Źródło: ${item.job.source.label}`);

    const actions = element("div", "job-actions");
    const primaryActions = element("div", "job-actions-primary");
    const link = element("a", "link-button", "Zobacz oryginalną ofertę ↗");
    link.href = item.job.source.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    primaryActions.append(link);

    const reactions = element("div", "reaction-group");
    [
      ["liked", "Podoba mi się"],
      ["disliked", "Nie dla mnie"],
    ].forEach(([reaction, label]) => {
      const button = element("button", "reaction-button", label);
      button.type = "button";
      button.dataset.reaction = reaction;
      button.setAttribute("aria-pressed", String(item.session.reaction === reaction));
      button.addEventListener("click", () => onReaction(item.job.id, reaction));
      reactions.append(button);
    });
    actions.append(primaryActions, reactions);

    const details = element("details", "job-details");
    details.append(element("summary", "", "Pokaż szczegóły i rozbicie oceny"));
    const detailsContent = element("div", "details-content");
    detailsContent.append(element("h4", "", "Opis oferty"));
    const safeDescription = item.job.descriptionText.length > 2200 ? `${item.job.descriptionText.slice(0, 2200)}…` : item.job.descriptionText;
    detailsContent.append(element("p", "description-text", safeDescription));
    detailsContent.append(element("h4", "", "Rozbicie Oceny Szafira"), renderComponentList(item));
    details.append(detailsContent);

    card.append(top, title, company, facts, why, warning, sourceLine, actions, details);
    return card;
  }

  function renderJobs(container, items, onReaction) {
    const fragment = document.createDocumentFragment();
    items.forEach((item) => fragment.append(renderJobCard(item, onReaction)));
    container.replaceChildren(fragment);
  }

  window.Szafir.ui = { renderExternalSearches, renderJobs, renderSources };
})();
