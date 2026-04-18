const axios = require('axios')

async function generateLLMResponse(patientName, disease, query, location, topResults) {
  try {
    console.log('Calling Groq API...')

    const prompt = `You are Curalink, an expert AI medical research assistant.
Analyze the provided research data and give a comprehensive detailed response.
Use the provided research data as your primary source.
Be specific, detailed, and helpful. Do not hallucinate.

Respond in exactly these sections:

## Condition Overview
Provide a detailed explanation of ${disease}.
Include what it is, symptoms, causes, and current treatment landscape.

## Research Insights
Summarize key findings from the provided publications.
Mention specific studies, findings, and implications.
Be detailed - reference study titles when possible.

## Clinical Trials
List all relevant clinical trials from provided data.
Include: trial title, status, location, eligibility.
If no trials available, describe current trial landscape.

## Personalized Notes
Based on patient context and query, provide specific relevant notes.
Directly address this question: ${query}

## Sources
List all provided sources with title, year, source platform.

---
Patient Name: ${patientName}
Disease: ${disease}
Question: ${query}
Location: ${location}

Research Data:
${JSON.stringify(topResults, null, 2)}
`

    const response = await axios({
      method: 'post',
      url: 'https://api.groq.com/openai/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2048
      },
      timeout: 60000
    })

    console.log('Groq response received')
    return response.data.choices[0].message.content

  } catch (error) {
    console.error('Groq error:', error.response?.data || error.message)
    throw new Error(`LLM Error: ${error.response?.data?.error?.message || error.message}`)
  }
}

module.exports = { generateLLMResponse }
