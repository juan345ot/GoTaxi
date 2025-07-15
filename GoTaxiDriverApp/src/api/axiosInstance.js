import axios from 'axios';
import { API_BASE_URL } from '../config/env';

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
});

instance.interceptors.request.use(
  async config => {
    // Podés agregar token desde storage/context aquí
    return config;
  },
  error => Promise.reject(error)
);

export default instance;
