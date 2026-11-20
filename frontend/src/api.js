import axios from 'axios';

// Local dev: '/api' is proxied to Express by Vite.
// Production: set VITE_API_URL to your deployed backend URL (ending in /api).
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

// Attach the JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('glowvia_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turns any axios error into a readable message
export const errMsg = (e) => e?.response?.data?.message || e?.message || 'Something went wrong';

export default api;
