import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
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