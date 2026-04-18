function rankResults(results, disease, query) {
  const diseaseWords = disease.toLowerCase().split(' ')
  const queryWords = query.toLowerCase().split(' ')

  const scored = results.map(result => {
    const text = `${result.title} ${result.abstract}`.toLowerCase()
    let score = 0

    diseaseWords.forEach(word => {
      if (word.length > 3 && text.includes(word)) score += 3
    })

    queryWords.forEach(word => {
      if (word.length > 3 && text.includes(word)) score += 2
    })

    const year = parseInt(result.year) || 0
    if (year >= 2023) score += 3
    else if (year >= 2021) score += 2
    else if (year >= 2019) score += 1

    if (result.source === 'PubMed') score += 2
    else if (result.source === 'OpenAlex') score += 1
    else if (result.type === 'trial') score += 2

    if (result.abstract && result.abstract.length > 50) score += 1

    return { ...result, score }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
}

module.exports = { rankResults }