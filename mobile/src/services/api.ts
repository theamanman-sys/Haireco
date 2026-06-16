import axios from 'axios';

const API_URL = __DEV__ ? 'http://localhost:4000/api' : 'https://api.haireco.com/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  // Token would be stored via AsyncStorage in production
  if (config.headers) {
    // config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
