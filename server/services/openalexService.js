const axios = require('axios')

function decodeInvertedIndex(invertedIndex) {
  if (!invertedIndex) return ''
  const positions = {}
  for (const [word, pos] of Object.entries(invertedIndex)) {
    pos.forEach(p => { positions[p] = word })
  }
  return Object.keys(positions)
    .sort((a, b) => a - b)
    .map(p => positions[p])
    .join(' ')
}

async function fetchOpenAlexArticles(expandedQuery, maxResults = 40) {
  try {
    const response = await axios.get('https://api.openalex.org/works', {
      params: {
        search: expandedQuery,
        'per-page': maxResults,
        sort: 'relevance_score:desc',
        filter: 'from_publication_date:2018-01-01'
      },
      headers: {
        'User-Agent': 'Curalink/1.0 (mailto:curalink@research.com)'
      },
      timeout: 15000
    })

    const results = response.data.results || []

    return results.map(work => {
      const abstract = decodeInvertedIndex(work.abstract_inverted_index)
      const authors = (work.authorships || [])
        .map(a => a.author?.display_name)
        .filter(Boolean)
        .slice(0, 5)

      const url = work.doi
        ? `https://doi.org/${work.doi.replace('https://doi.org/', '')}`
        : work.primary_location?.landing_page_url || ''

      return {
        type: 'publication',
        title: work.display_name || '',
        abstract: abstract.substring(0, 500),
        authors,
        year: work.publication_year?.toString() || '2024',
        source: 'OpenAlex',
        url
      }
    }).filter(a => a.title)

  } catch (error) {
    console.error('OpenAlex error:', error.message)
    return []
  }
}

module.exports = { fetchOpenAlexArticles }