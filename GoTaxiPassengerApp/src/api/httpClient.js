import axios from 'axios';
import config from '../config';
import { showToast } from '../utils/toast';

const http = axios.create({
  baseURL: config.API_URL,
  timeout: 8000,
});

// Interceptor para errores globales
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg =
      error.response?.data?.message ||
      error.message ||
      'Error desconocido';
    showToast(msg);
    return Promise.reject(error);
  }
);

// Interceptor para agregar token si lo hubiese
http.interceptors.request.use(
  async (request) => {
    // Token simulado (podés inyectar desde context)
    const token = 'fake_token_go_taxi';
    request.headers.Authorization = `Bearer ${token}`;
    return request;
  },
  (error) => Promise.reject(error)
);

// Métodos auxiliares
export const get = async (url, config) => http.get(url, config);
export const post = async (url, data, config) => http.post(url, data, config);
export const put = async (url, data, config) => http.put(url, data, config);
export const del = async (url, config) => http.delete(url, config);

export default http;
