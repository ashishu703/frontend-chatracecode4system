import axios from 'axios';

const serverHandler = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4500',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Client-side interceptor (only runs in browser)
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  serverHandler.interceptors.request.use((config) => {
    // Try serviceToken first, then adminToken
    const token = localStorage.getItem('serviceToken') || localStorage.getItem('adminToken');
    if (token) {
      if (!config.headers) config.headers = {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  });
}

export default serverHandler; 