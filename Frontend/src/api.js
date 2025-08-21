// src/api.js
import axios from 'axios';
import { auth } from './firebase';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Your FastAPI backend URL
});

// Interceptor to add the auth token to every request
apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient; 