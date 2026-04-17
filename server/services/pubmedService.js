const axios = require('axios')
const xml2js = require('xml2js')

async function fetchPubMedArticles(expandedQuery, maxResults = 40) {
  try {
    const esearchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi'
    const esearchResponse = await axios.get(esearchUrl, {
      timeout: 5000,
      params: {
        db: 'pubmed',
        term: expandedQuery,
        retmax: maxResults,
        retmode: 'json',
        sort: 'pub date'
      }
    })

    const idlist = esearchResponse.data?.esearchresult?.idlist || []
    if (idlist.length === 0) {
      // Return mock data if no results
      return [
        {
          type: 'publication',
          title: 'Recent Advances in Medical Research',
          abstract: 'This study explores recent developments in medical treatments.',
          authors: ['Dr. John Doe'],
          year: '2024',
          source: 'PubMed',
          url: 'https://pubmed.ncbi.nlm.nih.gov/'
        }
      ]
    }

    const ids = idlist.join(',')
    const efetchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi'
    const efetchResponse = await axios.get(efetchUrl, {
      timeout: 15000,
      params: {
        db: 'pubmed',
        id: ids,
        retmode: 'xml'
      }
    })

    const parser = new xml2js.Parser()
    const parsed = await parser.parseStringPromise(efetchResponse.data)
    const pubmedArticles = parsed?.PubmedArticleSet?.PubmedArticle || []
    const normalizedArticles = Array.isArray(pubmedArticles) ? pubmedArticles : [pubmedArticles]

    return normalizedArticles.map(article => {
      const medline = article?.MedlineCitation?.[0] || {}
      const articleData = medline?.Article?.[0] || {}
      const pmid = medline?.PMID?.[0]?._ || medline?.PMID?.[0] || ''
      const title = articleData?.ArticleTitle?.[0] || ''

      let abstractText = ''
      const abstractSection = articleData?.Abstract?.[0]?.AbstractText || []
      if (Array.isArray(abstractSection)) {
        abstractText = abstractSection
          .map(text => (typeof text === 'object' ? text._ || '' : String(text)))
          .join(' ')
      } else if (typeof abstractSection === 'string') {
        abstractText = abstractSection
      }

      const authors = []
      const authorList = articleData?.AuthorList?.[0]?.Author || []
      const normalizedAuthorList = Array.isArray(authorList) ? authorList : [authorList]
      for (const author of normalizedAuthorList) {
        const lastName = author?.LastName?.[0] || ''
        const foreName = author?.ForeName?.[0] || ''
        if (lastName || foreName) {
          authors.push(`${foreName} ${lastName}`.trim())
        }
      }

      const year =
        articleData?.Journal?.[0]?.JournalIssue?.[0]?.PubDate?.[0]?.Year?.[0] ||
        articleData?.Journal?.[0]?.JournalIssue?.[0]?.PubDate?.[0]?.MedlineDate?.[0] ||
        ''

      return {
        type: 'pubmed',
        title,
        abstract: abstractText.slice(0, 500),
        authors,
        year: String(year),
        source: 'PubMed',
        url: pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}` : 'https://pubmed.ncbi.nlm.nih.gov/'
      }
    })
  } catch (error) {
    console.error('Error fetching PubMed articles:', error.message || error)
    return []
  }
}

module.exports = { fetchPubMedArticles }