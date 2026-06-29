import axios from 'axios';

const saApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/super-admin` : `http://${window.location.hostname}:3000/api/super-admin`,
});

saApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('sa_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

saApi.interceptors.response.use((response) => {
  return response;
}, (error) => {
  // Se for erro de login, não redireciona, deixa o catch do formulário pegar
  if (error.response?.status === 401 && !error.config.url?.includes('/login')) {
    localStorage.removeItem('sa_token');
    window.location.href = '/super-admin/login';
  }
  return Promise.reject(error);
});

export default saApi;
