// src/api.js
import axios from 'axios';
import { auth } from './firebase';

const apiClient = axios.create({
  baseURL: 'https://psilydev-versery.hf.space/api',
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