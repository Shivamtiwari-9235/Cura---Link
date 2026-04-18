const axios = require('axios')

async function fetchClinicalTrials(disease, maxResults = 20) {
  try {
    const response = await axios.get('https://clinicaltrials.gov/api/v2/studies', {
      params: {
        'query.cond': disease,
        'filter.overallStatus': 'RECRUITING',
        pageSize: maxResults,
        format: 'json'
      },
      timeout: 15000
    })

    const studies = response.data.studies || []

    return studies.map(study => {
      const protocol = study.protocolSection
      const identification = protocol?.identificationModule
      const status = protocol?.statusModule
      const eligibility = protocol?.eligibilityModule
      const contacts = protocol?.contactsLocationsModule

      const nctId = identification?.nctId || ''
      const title = identification?.briefTitle || ''
      const overallStatus = status?.overallStatus || ''
      const eligibilityCriteria = eligibility?.eligibilityCriteria || ''

      const locationsList = contacts?.locations || []
      const firstLocation = locationsList[0]
      const location = firstLocation
        ? `${firstLocation.city || ''}, ${firstLocation.country || ''}`.trim()
        : 'Location not specified'

      const centralContacts = contacts?.centralContacts || []
      const contactsList = centralContacts.map(c => ({
        name: c.name || '',
        email: c.email || ''
      }))

      return {
        type: 'trial',
        title,
        status: overallStatus,
        eligibility: eligibilityCriteria.substring(0, 300),
        location,
        contacts: contactsList,
        url: `https://clinicaltrials.gov/study/${nctId}`
      }
    }).filter(t => t.title)

  } catch (error) {
    console.error('ClinicalTrials error:', error.message)
    return []
  }
}

module.exports = { fetchClinicalTrials }