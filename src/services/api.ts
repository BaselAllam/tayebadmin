import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.origini.co.uk',
  // baseURL: 'http://127.0.0.1:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': 'en'
  }
});

const baseUrl = api.defaults.baseURL;

export const imgUrl = 'https://api.origini.co.uk'
// export const imgUrl = 'http://127.0.0.1:8000'

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    if (response && response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    return Promise.reject(error);
  }
);

export default api;