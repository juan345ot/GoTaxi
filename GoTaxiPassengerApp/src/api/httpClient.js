import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dev from '../config/dev';
import { toast } from '../utils/toast';

const client = axios.create({
  baseURL: dev.API_URL,
  timeout: 15000, // 15s
  headers: { 'Content-Type': 'application/json' },
});

// Cache del token en memoria para evitar lecturas repetidas de AsyncStorage
let tokenCache = null;

// Función para actualizar el cache del token
export const updateTokenCache = async() => {
  try {
    tokenCache = await AsyncStorage.getItem('token');
    return tokenCache;
  } catch {
    tokenCache = null;
    return null;
  }
};

// Inicializar el cache al cargar el módulo
updateTokenCache();

// Interceptor para agregar token de autenticación
client.interceptors.request.use(async(config) => {
  try {
    // Usar cache primero, luego actualizar desde AsyncStorage si es necesario
    let token = tokenCache;
    if (!token) {
      token = await updateTokenCache();
    }
    
    // Si el config tiene un token explícito, usarlo (para casos especiales)
    if (config.token) {
      token = config.token;
      delete config.token; // Remover del config para no enviarlo como parte del body
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // console.log('Error getting token');
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

    // Casos típicos - solo mostrar para errores críticos
    if (error.code === 'ECONNABORTED') {
      // Timeout - solo log, no bloquear
      console.warn('Timeout en petición:', error.config?.url);
      // Solo mostrar toast para operaciones críticas
      if (error.config?.method && ['post', 'put', 'delete'].includes(error.config.method.toLowerCase())) {
      toast.error('El servidor no respondió (timeout).');
      }
    } else if (!error.response) {
      // Sin respuesta del servidor - solo mostrar para operaciones críticas
      console.warn('Error de red:', error.config?.url);
      if (error.config?.method && ['post', 'put', 'delete'].includes(error.config.method.toLowerCase())) {
        toast.error('Error de conexión. Verificá tu internet.');
      }
    } else if (error.response.status >= 500) {
      // Error del servidor - solo mostrar para operaciones críticas
      if (error.config?.method && ['post', 'put', 'delete'].includes(error.config.method.toLowerCase())) {
      toast.error('Error del servidor. Intentalo más tarde.');
      }
    } else if (error.response.status === 401) {
      // Error de autenticación - limpiar token y cache
      console.warn('Error de autenticación:', error.response?.data?.code || 'UNKNOWN');
      const errorCode = error.response?.data?.code;
      
      // Si el token está expirado o es inválido, limpiar el cache
      if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN' || errorCode === 'MALFORMED_TOKEN') {
        tokenCache = null;
        AsyncStorage.removeItem('token').catch(() => {});
      }
      // No mostrar toast aquí, se maneja en AuthContext
    } else if (error.response.status !== 404) {
      // Para otros errores (excepto 404), mostrar mensaje solo si hay uno y es crítico
      if (msg && error.config?.method && ['post', 'put', 'delete'].includes(error.config.method.toLowerCase())) {
      toast.error(msg);
      }
    }

    return Promise.reject(error);
  },
);

export default client;
