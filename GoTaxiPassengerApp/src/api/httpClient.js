import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dev from '../config/dev';
import { toast } from '../utils/toast';

const client = axios.create({
  baseURL: dev.API_URL,
  timeout: 15000, // 15s
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para agregar token de autenticación
client.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.log('Error getting token:', error);
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
    // Mensaje “bonito”
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Ocurrió un error';

    // Casos típicos
    if (error.code === 'ECONNABORTED') {
      toast.error('El servidor no respondió (timeout).');
    } else if (!error.response) {
      // Sin respuesta del servidor ⇒ red/DNS/puerto incorrecto
      toast.error('Network Error: no se pudo conectar con el servidor.');
    } else if (error.response.status >= 500) {
      toast.error('Error del servidor. Intentalo más tarde.');
    } else {
      toast.error(msg);
    }

    return Promise.reject(error);
  }
);

export default client;