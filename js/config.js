(function () {
  "use strict";

  window.Szafir = window.Szafir || {};

  window.Szafir.CONFIG = Object.freeze({
    searchTimeoutMs: 15000,
    externalSearches: Object.freeze([
      Object.freeze({
        key: "pracuj",
        label: "Pracuj.pl",
        note: "Katowice · hybryda · wskazane kategorie finansowe",
        url: "https://www.pracuj.pl/praca/katowice;wp/praca%20hybrydowa;wm,hybrid?rd=10&cc=5001002%2C5001004%2C5001005%2C5001006%2C5003001%2C5003002%2C5003003%2C5003004%2C5008001%2C5008002%2C5008004%2C5008005%2C5008007%2C5008003&tc=0",
      }),
      Object.freeze({
        key: "rocketjobs",
        label: "RocketJobs",
        note: "Śląsk · finanse",
        url: "https://rocketjobs.pl/oferty-pracy/slask/finanse",
      }),
      Object.freeze({
        key: "nofluffjobs",
        label: "No Fluff Jobs",
        note: "Katowice · finance",
        url: "https://nofluffjobs.com/pl/katowice/finance",
      }),
      Object.freeze({
        key: "solidjobs",
        label: "Solid.Jobs",
        note: "Katowice · finanse i księgowość",
        url: "https://solid.jobs/offers/finances;cities=Katowice;categories=Ksi%C4%99gowo%C5%9B%C4%87;subcategories=Ksi%C4%99gowo%C5%9B%C4%87;remotePossible=",
      }),
      Object.freeze({
        key: "linkedin",
        label: "LinkedIn",
        note: "Katowice · finanse",
        url: "https://www.linkedin.com/jobs/search/?keywords=finanse&location=Katowice%2C%20Woj.%20%C5%9Al%C4%85skie%2C%20Polska",
      }),
      Object.freeze({
        key: "olx",
        label: "OLX Praca",
        note: "Katowice · finanse",
        url: "https://www.olx.pl/praca/katowice/q-finanse/",
      }),
      Object.freeze({
        key: "epraca",
        label: "ePraca",
        note: "Publiczna baza ofert · ustaw Katowice lub Sosnowiec",
        url: "https://oferty.praca.gov.pl/portal/lista-ofert",
      }),
    ]),
    similarityAdjustment: 15,
    maxSimilarityAdjustment: 30,
    weights: Object.freeze({
      location: 35,
      "work-arrangement": 15,
      language: 20,
      role: 20,
      commute: 5,
      contract: 5,
    }),
    preferredLocalCities: Object.freeze(["sosnowiec", "katowice"]),
    workFit: Object.freeze({
      remotePermanent: 0.9,
      remoteOccasional: 0.9,
      remoteUnconfirmed: 0.8,
      hybridByDays: Object.freeze({ 1: 1, 2: 0.95, 3: 0.9, 4: 0.8 }),
      onsite: 0.65,
    }),
    roleFit: Object.freeze({
      "accounts-payable": 1,
      "invoice-processing": 1,
      "procure-to-pay": 1,
      "finance-operations": 0.8,
      accounting: 0.3,
      "accounts-receivable": 0.55,
      "order-to-cash": 0.55,
      billing: 0.55,
      "other-finance": 0.3,
    }),
  });
})();
