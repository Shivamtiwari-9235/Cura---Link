import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.data) {
      return Promise.reject(new Error(error.response.data.error || error.response.data.message || 'API request failed'));
    }
    return Promise.reject(new Error(error.message || 'API request failed'));
  }
);

export const sendQuery = async (data) => {
  try {
    const res = await api.post('/api/chat/query', data);
    return res.data;
  } catch (error) {
    console.error('sendQuery error:', error);
    throw error;
  }
};

export const sendFollowUp = async (data) => {
  try {
    const res = await api.post('/api/chat/followup', data);
    return res.data;
  } catch (error) {
    console.error('sendFollowUp error:', error);
    throw error;
  }
};

export const getHistory = async (id) => {
  try {
    const res = await api.get(`/api/history/${id}`);
    return res.data;
  } catch (error) {
    console.error('getHistory error:', error);
    throw error;
  }
};