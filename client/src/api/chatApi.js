import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://cura-link-1rf0.onrender.com'

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(config => {
  console.log('API Request to:', config.baseURL + config.url)
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.error || error.message || 'Request failed'
    return Promise.reject(new Error(message))
  }
)

export const sendQuery = async (data) => {
  const res = await api.post('/api/chat/query', data)
  return res.data
}

export const sendFollowUp = async (data) => {
  const res = await api.post('/api/chat/followup', data)
  return res.data
}

export const getHistory = async (id) => {
  const res = await api.get(`/api/chat/history/${id}`)
  return res.data
}
