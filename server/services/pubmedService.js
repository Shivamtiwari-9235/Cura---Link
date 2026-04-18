const axios = require('axios')
const xml2js = require('xml2js')

async function fetchPubMedArticles(expandedQuery, maxResults = 40) {
  try {
    const searchRes = await axios.get(
      'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi',
      {
        params: {
          db: 'pubmed',
          term: expandedQuery,
          retmax: maxResults,
          retmode: 'json',
          sort: 'pub date'
        },
        timeout: 15000
      }
    )

    const ids = searchRes.data.esearchresult.idlist
    if (!ids || ids.length === 0) return []

    const fetchRes = await axios.get(
      'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi',
      {
        params: {
          db: 'pubmed',
          id: ids.join(','),
          retmode: 'xml'
        },
        timeout: 15000
      }
    )

    const parsed = await xml2js.parseStringPromise(fetchRes.data)
    const articles = parsed?.PubmedArticleSet?.PubmedArticle || []

    return articles.map(article => {
      const medline = article?.MedlineCitation?.[0]
      const articleData = medline?.Article?.[0]
      const pmid = medline?.PMID?.[0]?._ || medline?.PMID?.[0]

      const title = articleData?.ArticleTitle?.[0] || ''
      const abstractArr = articleData?.Abstract?.[0]?.AbstractText || []
      const abstract = Array.isArray(abstractArr)
        ? abstractArr.map(a => (typeof a === 'string' ? a : a._ || '')).join(' ')
        : ''

      const authorList = articleData?.AuthorList?.[0]?.Author || []
      const authors = authorList.map(a => {
        const last = a.LastName?.[0] || ''
        const fore = a.ForeName?.[0] || ''
        return `${last} ${fore}`.trim()
      }).filter(Boolean)

      const year = medline?.Article?.[0]?.Journal?.[0]?.JournalIssue?.[0]?.PubDate?.[0]?.Year?.[0]
        || medline?.DateCompleted?.[0]?.Year?.[0]
        || '2024'

      return {
        type: 'publication',
        title: typeof title === 'string' ? title : title._ || '',
        abstract: abstract.substring(0, 500),
        authors,
        year,
        source: 'PubMed',
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}`
      }
    }).filter(a => a.title)

  } catch (error) {
    console.error('PubMed error:', error.message)
    return []
  }
}

module.exports = { fetchPubMedArticles }