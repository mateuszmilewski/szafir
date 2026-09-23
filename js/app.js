(function () {
  "use strict";

  const Szafir = window.Szafir;
  const elements = {
    form: document.querySelector("#search-form"),
    origin: document.querySelector("#origin"),
    originError: document.querySelector("#origin-error"),
    searchButton: document.querySelector("#search-button"),
    emptyState: document.querySelector("#empty-state"),
    loadingPanel: document.querySelector("#loading-panel"),
    resultsPanel: document.querySelector("#results-panel"),
    progress: document.querySelector("#search-progress"),
    progressLabel: document.querySelector("#progress-label"),
    sourceList: document.querySelector("#source-list"),
    resultsSummary: document.querySelector("#results-summary"),
    jobsList: document.querySelector("#jobs-list"),
    sessionMessage: document.querySelector("#session-message"),
    partialWarning: document.querySelector("#partial-warning"),
    externalSearchNotice: document.querySelector("#external-search-notice"),
    externalSearchList: document.querySelector("#external-search-list"),
    openImport: document.querySelector("#open-import"),
    importDialog: document.querySelector("#import-dialog"),
    importForm: document.querySelector("#import-form"),
    closeImport: document.querySelector("#close-import"),
    cancelImport: document.querySelector("#cancel-import"),
    importUrl: document.querySelector("#import-url"),
    importWork: document.querySelector("#import-work"),
    importOfficeDays: document.querySelector("#import-office-days"),
    importError: document.querySelector("#import-error"),
    undoButton: document.querySelector("#undo-button"),
    resetButton: document.querySelector("#reset-button"),
    scoringDialog: document.querySelector("#scoring-dialog"),
    openScoring: document.querySelector("#open-scoring"),
    closeScoring: document.querySelector("#close-scoring"),
  };

  const state = {
    preferences: null,
    baseItems: [],
    rankedItems: [],
    reactions: {},
    lastChange: null,
    manualImportCount: 0,
    sourceStates: Szafir.adapters.map((adapter) => ({ key: adapter.key, label: adapter.label, status: "idle" })),
  };

  function preferencesFromForm() {
    const mode = elements.form.querySelector("input[name='commute-mode']:checked").value;
    return {
      origin: { label: elements.origin.value.trim() },
      commuteMode: mode,
      targetRoleFamilies: ["accounts-payable", "invoice-processing", "procure-to-pay", "finance-operations"],
      preferredContract: "employment",
      searchStartedAt: new Date().toISOString(),
    };
  }

  function validateForm() {
    const valid = Boolean(elements.origin.value.trim());
    elements.origin.setAttribute("aria-invalid", String(!valid));
    elements.originError.textContent = valid ? "" : "Wpisz lub wybierz punkt startowy dojazdu.";
    if (!valid) elements.origin.focus();
    return valid;
  }

  function setSearchState(isSearching) {
    elements.searchButton.disabled = isSearching;
    elements.searchButton.querySelector("span:first-child").textContent = isSearching ? "Szukamy…" : "Szukaj ofert";
    elements.emptyState.hidden = true;
    elements.loadingPanel.hidden = !isSearching;
    if (isSearching) elements.resultsPanel.hidden = true;
  }

  function updateSource(sourceKey, status, jobCount) {
    const source = state.sourceStates.find((entry) => entry.key === sourceKey);
    if (source) {
      source.status = status;
      source.jobCount = jobCount || 0;
    }
    const completed = state.sourceStates.filter((entry) => !["idle", "loading"].includes(entry.status)).length;
    elements.progress.value = completed;
    elements.progressLabel.textContent = `${completed} z ${state.sourceStates.length}`;
    Szafir.ui.renderSources(elements.sourceList, state.sourceStates);
  }

  function prepareLoadingState() {
    state.sourceStates.forEach((source) => {
      source.status = "loading";
      source.jobCount = 0;
    });
    elements.progress.max = state.sourceStates.length;
    elements.progress.value = 0;
    elements.progressLabel.textContent = `0 z ${state.sourceStates.length}`;
    Szafir.ui.renderSources(elements.sourceList, state.sourceStates);
  }

  function evaluateJobs(jobs) {
    return jobs.map((job) => {
      const commute = Szafir.scoring.estimateCommute(job, state.preferences);
      return {
        job,
        commute,
        evaluation: Szafir.scoring.evaluateJob(job, commute),
        session: { reaction: null, similarityAdjustment: 0 },
        rankingValue: 0,
      };
    });
  }

  function renderRanking(message) {
    state.rankedItems = Szafir.ranking.applyRanking(state.baseItems, state.reactions);
    Szafir.ui.renderJobs(elements.jobsList, state.rankedItems, handleReaction);
    const hasReactions = Object.keys(state.reactions).length > 0;
    elements.resetButton.hidden = !hasReactions;
    elements.undoButton.hidden = !state.lastChange;
    elements.sessionMessage.hidden = !message;
    elements.sessionMessage.textContent = message || "";
  }

  function handleReaction(jobId, reaction) {
    const previous = state.reactions[jobId] || null;
    const next = previous === reaction ? null : reaction;
    state.lastChange = { jobId, previous };
    if (next) state.reactions[jobId] = next;
    else delete state.reactions[jobId];
    const message = next === "liked"
      ? "Podobne oferty przesunęliśmy wyżej w tej sesji. Bazowe oceny pozostają bez zmian."
      : next === "disliked"
        ? "Podobne oferty przesunęliśmy niżej w tej sesji. Żadna oferta nie została ukryta."
        : "Reakcja została cofnięta. Kolejność dostosowaliśmy ponownie.";
    renderRanking(message);
    const movedCard = elements.jobsList.querySelector(`[data-job-id="${CSS.escape(jobId)}"]`);
    const movedButton = movedCard && movedCard.querySelector(`[data-reaction="${reaction}"]`);
    if (movedButton) movedButton.focus({ preventScroll: true });
  }

  function undoLastChange() {
    if (!state.lastChange) return;
    const { jobId, previous } = state.lastChange;
    if (previous) state.reactions[jobId] = previous;
    else delete state.reactions[jobId];
    state.lastChange = null;
    renderRanking("Ostatnia zmiana została cofnięta.");
  }

  function resetReactions() {
    state.reactions = {};
    state.lastChange = null;
    renderRanking("Przywróciliśmy kolejność opartą wyłącznie na Ocenie Szafira.");
  }

  function updateResultsSummary() {
    const count = state.baseItems.length;
    const recommended = state.baseItems.filter((item) => item.evaluation.seal).length;
    const noun = count === 1 ? "ofertę" : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? "oferty" : "ofert";
    elements.resultsSummary.textContent = `Na wspólnej liście mamy ${count} ${noun}. ${recommended} ${recommended === 1 ? "otrzymała" : "otrzymało"} wyróżnienie „Szafir poleca”.`;
  }

  function showResults(sourceResults) {
    const jobs = sourceResults.flatMap((result) => result.jobs || []);
    state.baseItems = evaluateJobs(jobs);
    state.reactions = {};
    state.lastChange = null;
    updateResultsSummary();

    const unavailable = sourceResults.filter((result) => ["error", "timeout"].includes(result.status));
    const notes = [];
    if (unavailable.length) notes.push(`${unavailable.length === 1 ? "Jedno źródło nie odpowiedziało" : `${unavailable.length} źródła nie odpowiedziały`} — pokazujemy pozostałe wyniki.`);
    if (jobs.length === 0) notes.push("W tym wyszukiwaniu źródło publiczne nie zwróciło dopasowanych ofert.");
    elements.partialWarning.hidden = notes.length === 0;
    elements.partialWarning.textContent = notes.join(" ");

    setSearchState(false);
    elements.resultsPanel.hidden = false;
    elements.externalSearchNotice.hidden = false;
    renderRanking("");
    elements.resultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function startSearch(preferences) {
    state.preferences = preferences || preferencesFromForm();
    setSearchState(true);
    prepareLoadingState();

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), Szafir.CONFIG.searchTimeoutMs);
    const searches = Szafir.adapters.map(async (adapter) => {
      const result = await adapter.fetchJobs(controller.signal);
      updateSource(adapter.key, result.status, result.jobs.length);
      return result;
    });

    const settled = await Promise.all(searches);
    window.clearTimeout(timeoutId);
    showResults(settled);
    return {
      offers: state.baseItems.length,
      recommended: state.baseItems.filter((item) => item.evaluation.seal).length,
      sourceStatuses: state.sourceStates.map(({ key, status }) => ({ key, status })),
    };
  }

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    void startSearch();
  });

  elements.origin.addEventListener("input", () => {
    if (elements.origin.value.trim()) {
      elements.origin.setAttribute("aria-invalid", "false");
      elements.originError.textContent = "";
    }
  });

  function closeImportDialog() {
    elements.importDialog.close();
    elements.importError.textContent = "";
  }

  function updateOfficeDaysField() {
    const isHybrid = elements.importWork.value === "hybrid";
    elements.importOfficeDays.disabled = !isHybrid;
    if (!isHybrid) elements.importOfficeDays.value = "";
  }

  function handleManualImport(event) {
    event.preventDefault();
    elements.importError.textContent = "";
    elements.importUrl.setCustomValidity("");

    let parsedUrl;
    try {
      parsedUrl = new URL(elements.importUrl.value.trim());
      if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new Error("protocol");
    } catch (_error) {
      elements.importUrl.setCustomValidity("Wklej pełny link zaczynający się od https:// lub http://.");
      elements.importUrl.reportValidity();
      return;
    }

    if (!elements.importForm.reportValidity()) return;
    if (state.baseItems.some((item) => item.job.source && item.job.source.url === parsedUrl.href)) {
      elements.importError.textContent = "Ta oferta znajduje się już na wspólnej liście.";
      elements.importUrl.focus();
      return;
    }

    const formData = new FormData(elements.importForm);
    state.manualImportCount += 1;
    const job = Szafir.adapterUtils.normalizeManualJob({
      id: `${Date.now()}:${state.manualImportCount}`,
      url: parsedUrl.href,
      title: formData.get("title"),
      company: formData.get("company"),
      location: formData.get("location"),
      workArrangement: formData.get("workArrangement"),
      officeDaysPerWeek: formData.get("officeDaysPerWeek"),
      contractType: formData.get("contractType"),
      descriptionText: formData.get("descriptionText"),
    });
    const [item] = evaluateJobs([job]);
    state.baseItems.push(item);
    updateResultsSummary();
    renderRanking(`Dodaliśmy ofertę z ${job.source.label.replace(" · import ręczny", "")} i policzyliśmy jej Ocenę Szafira.`);
    elements.importForm.reset();
    updateOfficeDaysField();
    closeImportDialog();

    const importedCard = elements.jobsList.querySelector(`[data-job-id="${CSS.escape(job.id)}"]`);
    if (importedCard) importedCard.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  elements.undoButton.addEventListener("click", undoLastChange);
  elements.resetButton.addEventListener("click", resetReactions);
  elements.openImport.addEventListener("click", () => {
    elements.importError.textContent = "";
    elements.importDialog.showModal();
    elements.importUrl.focus();
  });
  elements.closeImport.addEventListener("click", closeImportDialog);
  elements.cancelImport.addEventListener("click", closeImportDialog);
  elements.importForm.addEventListener("submit", handleManualImport);
  elements.importWork.addEventListener("change", updateOfficeDaysField);
  elements.importUrl.addEventListener("input", () => elements.importUrl.setCustomValidity(""));
  elements.importDialog.addEventListener("click", (event) => {
    if (event.target === elements.importDialog) closeImportDialog();
  });
  elements.openScoring.addEventListener("click", () => elements.scoringDialog.showModal());
  elements.closeScoring.addEventListener("click", () => elements.scoringDialog.close());
  elements.scoringDialog.addEventListener("click", (event) => {
    if (event.target === elements.scoringDialog) elements.scoringDialog.close();
  });

  Szafir.ui.renderExternalSearches(elements.externalSearchList, Szafir.CONFIG.externalSearches);

  function registerWebMcpTools() {
    const context = document.modelContext;
    if (!context || typeof context.registerTool !== "function") return;
    const lifecycle = new AbortController();

    Promise.resolve(context.registerTool({
      name: "start_job_search",
      title: "Szukaj ofert pracy",
      description: "Uruchamia widoczne wyszukiwanie ofert dla punktu startowego i sposobu dojazdu. Dane są używane tylko w tej sesji.",
      inputSchema: {
        type: "object",
        properties: {
          origin: { type: "string", minLength: 1, description: "Punkt startowy dojazdu." },
          commuteMode: { type: "string", enum: ["car", "walk"] },
        },
        required: ["origin", "commuteMode"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: true },
      async execute(input) {
        if (!input || typeof input.origin !== "string" || !input.origin.trim() || !["car", "walk"].includes(input.commuteMode)) {
          throw new Error("Podaj niepusty punkt startowy i commuteMode równy car lub walk.");
        }
        elements.origin.value = input.origin.trim();
        const radio = elements.form.querySelector(`input[name='commute-mode'][value='${input.commuteMode}']`);
        radio.checked = true;
        return startSearch(preferencesFromForm());
      },
    }, { signal: lifecycle.signal })).catch(() => {});

    Promise.resolve(context.registerTool({
      name: "set_job_reaction",
      title: "Ustaw reakcję na ofertę",
      description: "Ustawia lub cofa reakcję na widoczną ofertę i przelicza kolejność tylko w bieżącej sesji.",
      inputSchema: {
        type: "object",
        properties: {
          jobId: { type: "string", minLength: 1 },
          reaction: { type: "string", enum: ["liked", "disliked", "none"] },
        },
        required: ["jobId", "reaction"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        const item = state.baseItems.find((entry) => entry.job.id === input.jobId);
        if (!item || !["liked", "disliked", "none"].includes(input.reaction)) throw new Error("Nieprawidłowa oferta lub reakcja.");
        const previous = state.reactions[input.jobId] || null;
        state.lastChange = { jobId: input.jobId, previous };
        if (input.reaction === "none") delete state.reactions[input.jobId];
        else state.reactions[input.jobId] = input.reaction;
        renderRanking("Kolejność dostosowana w tej sesji.");
        return { jobId: input.jobId, reaction: state.reactions[input.jobId] || null, baseScore: item.evaluation.baseScore };
      },
    }, { signal: lifecycle.signal })).catch(() => {});
  }

  registerWebMcpTools();
})();
