function rankResults(results, disease, query) {
  const diseaseLower = disease.toLowerCase()
  const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 0)

  const scoredResults = results.map(result => {
    let score = 0
    const titleLower = String(result.title || '').toLowerCase()
    const abstractLower = String(result.abstract || '').toLowerCase()

    if (titleLower.includes(diseaseLower) || abstractLower.includes(diseaseLower)) {
      score += 3
    }

    if (queryWords.some(word => titleLower.includes(word) || abstractLower.includes(word))) {
      score += 2
    }

    const year = parseInt(result.year, 10)
    if (!Number.isNaN(year)) {
      if (year >= 2023) {
        score += 3
      } else if (year >= 2021) {
        score += 2
      } else if (year >= 2019) {
        score += 1
      }
    }

    if (result.source === 'PubMed') {
      score += 2
    } else if (result.source === 'OpenAlex') {
      score += 1
    } else if (result.type === 'trial') {
      score += 2
    }

    if (result.abstract && result.abstract.length > 50) {
      score += 1
    }

    return { ...result, score }
  })

  scoredResults.sort((a, b) => b.score - a.score)
  return scoredResults.slice(0, 3)
}

module.exports = { rankResults }