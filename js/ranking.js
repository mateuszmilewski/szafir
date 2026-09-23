(function () {
  "use strict";

  window.Szafir = window.Szafir || {};
  const CONFIG = window.Szafir.CONFIG;

  function locationCluster(job) {
    const value = `${job.location && job.location.city ? job.location.city : ""} ${job.location && job.location.raw ? job.location.raw : ""}`.toLocaleLowerCase("pl");
    if (/sosnowiec|katowice/.test(value)) return "core";
    if (/bytom|dąbrowa|dabrowa|będzin|bedzin/.test(value)) return "near";
    if (/polska|poland/.test(value)) return "poland";
    return "unknown";
  }

  function isPreferredLocal(job) {
    const value = `${job.location && job.location.city ? job.location.city : ""} ${job.location && job.location.raw ? job.location.raw : ""}`.toLocaleLowerCase("pl");
    return window.Szafir.CONFIG.preferredLocalCities.some((city) => value.includes(city));
  }

  function priorityGroup(item) {
    if (item.session.forcedPosition === "bottom") return 4;
    if (item.job.language && item.job.language.status === "not-polish") return 3;
    if (item.session.forcedPosition === "top") return -1;
    if (isPreferredLocal(item.job)) return 0;
    return 1;
  }

  function similarity(a, b) {
    let points = 0;
    if (a.role.family !== "unknown" && a.role.family === b.role.family) points += 2;
    if (a.workArrangement.type !== "unknown" && a.workArrangement.type === b.workArrangement.type) points += 1;
    if (locationCluster(a) !== "unknown" && locationCluster(a) === locationCluster(b)) points += 1;
    if ((a.contractTypes || []).some((type) => type !== "unknown" && (b.contractTypes || []).includes(type))) points += 1;
    return points;
  }

  function applyRanking(items, reactions) {
    const reactors = items.filter((item) => reactions[item.job.id]);

    return items
      .map((item) => {
        const ownReaction = reactions[item.job.id] || null;
        let adjustment = 0;
        reactors.forEach((reactor) => {
          if (reactor.job.id !== item.job.id && similarity(item.job, reactor.job) >= 2) {
            adjustment += reactions[reactor.job.id] === "liked" ? CONFIG.similarityAdjustment : -CONFIG.similarityAdjustment;
          }
        });
        adjustment = Math.max(-CONFIG.maxSimilarityAdjustment, Math.min(CONFIG.maxSimilarityAdjustment, adjustment));
        return {
          ...item,
          session: {
            reaction: ownReaction,
            similarityAdjustment: adjustment,
            forcedPosition: ownReaction === "liked" ? "top" : ownReaction === "disliked" ? "bottom" : undefined,
          },
          rankingValue: item.evaluation.baseScore + adjustment,
        };
      })
      .sort((a, b) => {
        const positionDifference = priorityGroup(a) - priorityGroup(b);
        if (positionDifference !== 0) return positionDifference;
        return b.rankingValue - a.rankingValue || b.evaluation.baseScore - a.evaluation.baseScore;
      });
  }

  window.Szafir.ranking = { applyRanking, isPreferredLocal, similarity };
})();
