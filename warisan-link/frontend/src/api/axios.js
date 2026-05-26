import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
});

api.interceptors.request.use((config) => {
  // Baca token dari persisted zustand store
  try {
    const stored = JSON.parse(localStorage.getItem('warisan-auth') || '{}');
    const token = stored?.state?.token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch { /* abaikan jika parse gagal */ }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('warisan-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
