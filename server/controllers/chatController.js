const Chat = require('../models/Chat')
const { expandQuery } = require('../utils/queryExpander')
const { rankResults } = require('../utils/rankingUtils')
const { fetchPubMedArticles } = require('../services/pubmedService')
const { fetchOpenAlexArticles } = require('../services/openalexService')
const { fetchClinicalTrials } = require('../services/trialsService')
const { generateLLMResponse } = require('../services/llmService')

function generateFallbackAnswer(disease, query, topResults) {
  const researchList = topResults.slice(0, 5).map(result => `- ${result.title || 'Research item'} (${result.source || 'Unknown'})`).join('\n')
  const trialsList = topResults.filter(r => r.type === 'trial').slice(0, 3).map(trial => `- ${trial.title || 'Trial'} (${trial.status || 'Unknown'})`).join('\n')

  return `## Condition Overview\n${disease} is a medical condition requiring review of the latest research and clinical trials.\n\n## Research Insights\n${researchList || 'No research items available currently.'}\n\n## Clinical Trials\n${trialsList || 'No clinical trials were found in the current search results.'}\n\n## Personalized Notes\nPlease review the sources below and consult a medical professional for personalized guidance.\n\n## Sources\n${topResults.map(src => `- ${src.title || 'Source'} (${src.year || 'N/A'}, ${src.source || 'Unknown'})`).join('\n')}`
}

exports.handleQuery = async (req, res) => {
  try {
    const { patientName, disease, query, location } = req.body
    console.log('Processing query:', disease, query)

    if (!disease || !query) {
      return res.status(400).json({ error: 'Disease and query are required' })
    }

    const expandedQuery = expandQuery(query, disease)

    const [pubmedResult, openalexResult, trialsResult] = await Promise.allSettled([
      fetchPubMedArticles(expandedQuery, 40),
      fetchOpenAlexArticles(expandedQuery, 40),
      fetchClinicalTrials(disease, 20)
    ])

    const pubmedData = pubmedResult.status === 'fulfilled' ? pubmedResult.value : []
    const openalexData = openalexResult.status === 'fulfilled' ? openalexResult.value : []
    const trialsData = trialsResult.status === 'fulfilled' ? trialsResult.value : []

    console.log('PubMed:', pubmedData.length, 'OpenAlex:', openalexData.length, 'Trials:', trialsData.length)

    const allResults = [...pubmedData, ...openalexData, ...trialsData]
    const topResults = rankResults(allResults, disease, query)

    let answer
    try {
      answer = await generateLLMResponse(
        patientName || 'Patient',
        disease,
        query,
        location || '',
        topResults
      )
    } catch (llmError) {
      console.error('LLM generation error, using fallback answer:', llmError)
      answer = generateFallbackAnswer(disease, query, topResults)
    }

    const chat = new Chat({
      disease,
      patientName: patientName || 'Patient',
      location: location || '',
      messages: [
        { role: 'user', text: query, time: new Date() },
        { role: 'assistant', text: answer, time: new Date() }
      ]
    })
    await chat.save()

    res.json({
      answer,
      sources: topResults,
      expandedQuery,
      chatId: chat._id
    })

  } catch (error) {
    console.error('handleQuery error:', error)
    res.status(500).json({ error: error.message })
  }
}

exports.handleFollowUp = async (req, res) => {
  try {
    const { chatId, query } = req.body

    if (!query) {
      return res.status(400).json({ error: 'Query is required' })
    }

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
        const lastMessages = previousChat.messages.slice(-4)
        previousContext = lastMessages.map(m => `${m.role}: ${m.text}`).join('\n')
      }
    }

    const expandedQuery = expandQuery(query, disease)

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

    const fullQuery = previousContext
      ? `Previous conversation:\n${previousContext}\n\nNew question: ${query}`
      : query

    let answer
    try {
      answer = await generateLLMResponse(
        patientName,
        disease,
        fullQuery,
        location,
        topResults
      )
    } catch (llmError) {
      console.error('LLM generation error, using fallback answer:', llmError)
      answer = generateFallbackAnswer(disease, query, topResults)
    }

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
    console.error('handleFollowUp error:', error)
    res.status(500).json({ error: error.message })
  }
}
