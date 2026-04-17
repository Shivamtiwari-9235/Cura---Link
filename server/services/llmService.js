const axios = require('axios')

async function generateLLMResponse(patientName, disease, query, location, topResults) {
  try {
    const prompt = `You are Curalink, an expert AI medical research assistant.
Analyze the provided research data carefully and give a comprehensive response.
Use ONLY the provided data. Do not hallucinate or add outside information.
Be specific, detailed, and helpful.

Respond in exactly these sections:

## Condition Overview
Provide a clear explanation of the condition and the specific query.

## Research Insights
Summarize key findings from the provided publications with specific details.
Mention specific study names, years, and findings.

## Clinical Trials
List relevant clinical trials with their status, location, and eligibility.
If no trials found, mention that clearly.

## Personalized Notes
Based on patient context and location, provide specific relevant notes.

## Sources
List all sources used with title, year, and source name.

---
Patient Name: ${patientName}
Disease: ${disease}
Query: ${query}
Location: ${location}

Research Data:
${JSON.stringify(topResults, null, 2)}
`

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1024
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    )

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      console.error('Unexpected LLM response structure:', response.data)
      throw new Error('Invalid response structure from LLM API')
    }

    const content = response.data.choices[0].message?.content
    if (!content) {
      console.error('No content in LLM response:', response.data)
      throw new Error('No content returned from LLM API')
    }

    return content

  } catch (error) {
    console.error('Groq LLM error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    })
    
    return `## Condition Overview
Unable to generate AI analysis at this time.
Error: ${error.message}

## Research Insights
See sources panel for research data.

## Clinical Trials
See sources panel for clinical trials.

## Personalized Notes
Please consult a medical professional for personalized advice.

## Sources
See attached sources.`
  }
}

module.exports = { generateLLMResponse }