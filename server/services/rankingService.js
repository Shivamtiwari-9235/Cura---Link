function rankResults(results, disease, query) {
  const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean);
  const diseaseLower = disease.toLowerCase();

  const scored = results.map(result => {
    let score = 0;
    const title = (result.title || '').toLowerCase();
    const summary = (result.summary || result.abstract || '').toLowerCase();

    if (title.includes(diseaseLower) || summary.includes(diseaseLower)) {
      score += 3;
    }

    if (queryWords.some(word => title.includes(word) || summary.includes(word))) {
      score += 2;
    }

    const year = parseInt(result.year, 10);
    if (!Number.isNaN(year)) {
      if (year >= 2022) score += 2;
      else if (year >= 2019) score += 1;
    }

    if (result.type === 'pubmed') score += 2;
    if (result.type === 'openalex') score += 1;
    if (result.type === 'trial') score += 2;

    if (result.source === 'ClinicalTrials.gov') score += 1;
    if (result.source === 'PubMed') score += 1;

    return { ...result, score };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, 8);
}

module.exports = { rankResults };