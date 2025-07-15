import axios from 'axios';

console.log('BASE URL:', process.env.NEXT_PUBLIC_BASE_URL);

const serverHandler = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

serverHandler.interceptors.request.use((config) => {
  // Try serviceToken first, then adminToken
  const token = localStorage.getItem('serviceToken') || localStorage.getItem('adminToken');
  if (token) {
    if (!config.headers) config.headers = {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default serverHandler; 