const Chat = require('../models/Chat')
const { expandQuery } = require('../utils/queryExpander')
const { rankResults } = require('../utils/rankingUtils')
const { fetchPubMedArticles } = require('../services/pubmedService')
const { fetchOpenAlexArticles } = require('../services/openalexService')
const { fetchClinicalTrials } = require('../services/trialsService')
const { generateLLMResponse } = require('../services/llmService')

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

    const answer = await generateLLMResponse(
      patientName || 'Patient',
      disease,
      query,
      location || '',
      topResults
    )

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

    const answer = await generateLLMResponse(
      patientName,
      disease,
      fullQuery,
      location,
      topResults
    )

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
