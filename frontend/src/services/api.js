import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");
const API_PREFIX = "/api"; // keep this if your Express mounts routes under /api

const api = axios.create({
  baseURL: `${API_BASE}${API_PREFIX}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
    console.log(error);
  }
);

export const getUserProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data.user;
  } catch (error) {
    throw new Error('Failed to fetch user profile');
  }
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const getLabs = () => api.get('/labs');

export const getEquipment = () => api.get('/equipment');

export default api;