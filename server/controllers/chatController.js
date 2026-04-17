const { expandQuery } = require('../utils/queryExpander')
const { fetchPubMedArticles } = require('../services/pubmedService')
const { fetchOpenAlexArticles } = require('../services/openalexService')
const { fetchClinicalTrials } = require('../services/trialsService')
const { generateLLMResponse } = require('../services/llmService')
const { rankResults } = require('../utils/rankingUtils')
const Chat = require('../models/Chat')

function generateFallbackAnswer(disease, query, topResults) {
  const researchInsights = topResults.slice(0, 5).map(result => 
    `- ${result.title || 'Research article'} (${result.year || 'N/A'})`
  ).join('\n')

  const clinicalTrials = topResults.filter(r => r.type === 'clinical_trial').slice(0, 3).map(trial =>
    `- ${trial.title || 'Clinical trial'} (Status: ${trial.status || 'Unknown'})`
  ).join('\n')

  return `## Condition Overview
${disease} is a medical condition. Based on available research data:

## Research Insights
${researchInsights || 'Limited research data available.'}

## Clinical Trials
${clinicalTrials || 'No clinical trials found.'}

## Personalized Notes
Please consult a medical professional for personalized advice.

## Sources
See attached sources for detailed information.`
}

async function handleQuery(req, res) {
  try {
    const { patientName, disease, query, location } = req.body

    if (!disease || !query) {
      return res.status(400).json({ error: 'Missing required fields: disease and query are required.' })
    }

    console.log('Processing query for disease: ' + disease)
    const expandedQuery = expandQuery(query, disease)

    const [pubmedResult, openalexResult, trialsResult] = await Promise.allSettled([
      fetchPubMedArticles(expandedQuery, 10),
      fetchOpenAlexArticles(expandedQuery, 10),
      fetchClinicalTrials(disease, 5)
    ])

    const pubmedArticles = pubmedResult.status === 'fulfilled' ? pubmedResult.value : []
    const openalexArticles = openalexResult.status === 'fulfilled' ? openalexResult.value : []
    const trials = trialsResult.status === 'fulfilled' ? trialsResult.value : []

    console.log(`PubMed returned ${pubmedArticles.length} results`)
    console.log(`OpenAlex returned ${openalexArticles.length} results`)
    console.log(`ClinicalTrials returned ${trials.length} results`)

    const allResults = [...pubmedArticles, ...openalexArticles, ...trials]
    const topResults = rankResults(allResults, disease, query)

    let answer
    try {
      answer = await generateLLMResponse(
        patientName || 'Patient',
        disease,
        query,
        location || 'Unknown',
        topResults
      )
    } catch (llmError) {
      console.error('LLM failed, using fallback:', llmError.message)
      answer = generateFallbackAnswer(disease, query, topResults)
    }

    const newChat = new Chat({
      disease,
      patientName: patientName || 'Patient',
      messages: [
        { role: 'user', text: query, time: new Date() },
        { role: 'assistant', text: answer, time: new Date() }
      ]
    })
    const savedChat = await newChat.save()

    return res.json({
      answer,
      sources: topResults,
      expandedQuery,
      chatId: savedChat._id
    })
  } catch (error) {
    console.error('Error in handleQuery:', error)
    return res.status(500).json({ error: error.message })
  }
}

async function handleFollowUp(req, res) {
  try {
    const { chatId, query } = req.body

    if (!query) {
      return res.status(400).json({ error: 'Query is required' })
    }

    const Chat = require('../models/Chat')

    // Load previous chat to get disease context
    let disease = 'general health'
    let patientName = 'Patient'
    let location = ''
    let previousContext = ''

    if (chatId) {
      const previousChat = await Chat.findById(chatId)
      if (previousChat) {
        disease = previousChat.disease || 'general health'
        patientName = previousChat.patientName || 'Patient'
        location = previousChat.location || ''
        // Get last 3 messages as context
        const lastMessages = previousChat.messages.slice(-3)
        previousContext = lastMessages.map(m => `${m.role}: ${m.text}`).join('\n')
      }
    }

    const { expandQuery } = require('../utils/queryExpander')
    const { rankResults } = require('../utils/rankingUtils')
    const { fetchPubMedArticles } = require('../services/pubmedService')
    const { fetchOpenAlexArticles } = require('../services/openalexService')
    const { fetchClinicalTrials } = require('../services/trialsService')
    const { generateLLMResponse } = require('../services/llmService')

    const expandedQuery = expandQuery(query, disease)

    // Fetch fresh data
    const [pubmedResult, openalexResult, trialsResult] = await Promise.allSettled([
      fetchPubMedArticles(expandedQuery, 30),
      fetchOpenAlexArticles(expandedQuery, 30),
      fetchClinicalTrials(disease, 10)
    ])

    const allResults = [
      ...(pubmedResult.status === 'fulfilled' ? pubmedResult.value : []),
      ...(openalexResult.status === 'fulfilled' ? openalexResult.value : []),
      ...(trialsResult.status === 'fulfilled' ? trialsResult.value : [])
    ]

    const topResults = rankResults(allResults, disease, query)

    // Generate answer with previous context
    let answer
    try {
      answer = await generateLLMResponse(
        patientName,
        disease,
        `Previous conversation:\n${previousContext}\n\nNew question: ${query}`,
        location,
        topResults
      )
    } catch (llmError) {
      console.error('LLM failed, using fallback:', llmError.message)
      answer = generateFallbackAnswer(disease, query, topResults)
    }

    // Save to existing chat or create new
    let chat
    if (chatId) {
      chat = await Chat.findByIdAndUpdate(
        chatId,
        {
          $push: {
            messages: {
              $each: [
                { role: 'user', text: query, time: new Date() },
                { role: 'assistant', text: answer, time: new Date() }
              ]
            }
          }
        },
        { new: true }
      )
    } else {
      chat = new Chat({
        disease,
        patientName,
        messages: [
          { role: 'user', text: query, time: new Date() },
          { role: 'assistant', text: answer, time: new Date() }
        ]
      })
      await chat.save()
    }

    res.json({
      answer,
      sources: topResults,
      expandedQuery,
      chatId: chat._id
    })

  } catch (error) {
    console.error('Follow-up error:', error)
    res.status(500).json({ error: error.message })
  }
}

module.exports = { handleQuery, handleFollowUp }