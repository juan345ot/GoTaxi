import axios from 'axios';
import secureStorage from '../utils/secureStorage';
import { showToast } from '../utils/toast';

/**
 * Cliente HTTP seguro con manejo mejorado de tokens y headers de seguridad
 */
class SecureHttpClient {
  constructor() {
    this.client = axios.create({
      baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-App-Version': '1.0.0',
        'X-Platform': 'mobile',
      },
    });
    this.setupInterceptors();
  }

  /**
   * Configura interceptores para manejo automático de tokens y errores
   */
  setupInterceptors() {
    // Interceptor de request para agregar token automáticamente
    this.client.interceptors.request.use(
      async config => {
        try {
          const tokenData = await secureStorage.getItem('secure_token');
          if (tokenData?.token) {
            config.headers.Authorization = `Bearer ${tokenData.token}`;
          }
        } catch {
          // Error getting token - handled by error handler
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      },
    );

    // Interceptor de response para manejo de errores y refresh de tokens
    this.client.interceptors.response.use(
      response => {
        return response;
      },
      async error => {
        const originalRequest = error.config;
        // Si el error es 401 y no hemos intentado refrescar el token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            // Intentar refrescar el token
            const refreshToken = await secureStorage.getItem('secure_refresh_token');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              if (response.success) {
                // Guardar nuevo token
                await secureStorage.setItem('secure_token', {
                  token: response.data.accessToken,
                  timestamp: Date.now(),
                });
                // Reintentar la petición original
                originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                return this.client(originalRequest);
              }
            }
          } catch {
            // Token refresh failed - handled by error handler
            // Si falla el refresh, limpiar sesión
            await this.clearSession();
          }
        }
        // Manejar otros errores
        this.handleError(error);
        return Promise.reject(error);
      },
    );
  }

  /**
   * Refresca el token de acceso
   */
  async refreshToken(refreshToken) {
    const response = await axios.post(`${this.client.defaults.baseURL}/auth/refresh`, {
      refreshToken,
    });
    return response.data;
  }

  /**
   * Limpia la sesión del usuario
   */
  async clearSession() {
    try {
      await secureStorage.clear();
      // Opcional: redirigir al login
      // NavigationService.navigate('Auth');
    } catch {
      // Error clearing session - handled by error handler
    }
  }

  /**
   * Maneja errores de respuesta
   */
  handleError(error) {
    let message = 'Ocurrió un error inesperado';
    if (error.response) {
      // Error del servidor
      const { status, data } = error.response;
      switch (status) {
        case 400:
          message = data.message || 'Solicitud inválida';
          break;
        case 401:
          message = 'Sesión expirada. Por favor, iniciá sesión nuevamente';
          break;
        case 403:
          message = 'No tenés permisos para realizar esta acción';
          break;
        case 404:
          message = 'Recurso no encontrado';
          break;
        case 422:
          message = data.message || 'Datos inválidos';
          break;
        case 429:
          message = 'Demasiadas solicitudes. Intentá nuevamente en unos minutos';
          break;
        case 500:
          message = 'Error del servidor. Intentá nuevamente más tarde';
          break;
        default:
          message = data.message || `Error ${status}`;
      }
    } else if (error.request) {
      // Error de red
      message = 'Error de conexión. Verificá tu internet';
    } else {
      // Otro tipo de error
      message = error.message || 'Error inesperado';
    }
    // Mostrar toast solo si no es un error de autenticación (para evitar spam)
    if (!error.response || error.response.status !== 401) {
      showToast(message);
    }
  }

  /**
   * Realiza una petición GET
   */
  async get(url, config = {}) {
    return this.client.get(url, config);
  }

  /**
   * Realiza una petición POST
   */
  async post(url, data = {}, config = {}) {
    return this.client.post(url, data, config);
  }

  /**
   * Realiza una petición PUT
   */
  async put(url, data = {}, config = {}) {
    return this.client.put(url, data, config);
  }

  /**
   * Realiza una petición PATCH
   */
  async patch(url, data = {}, config = {}) {
    return this.client.patch(url, data, config);
  }

  /**
   * Realiza una petición DELETE
   */
  async delete(url, config = {}) {
    return this.client.delete(url, config);
  }

  /**
   * Realiza una petición con archivos (multipart/form-data)
   */
  async upload(url, formData, config = {}) {
    return this.client.post(url, formData, {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Obtiene el cliente axios subyacente
   */
  getAxiosClient() {
    return this.client;
  }

  /**
   * Actualiza la URL base
   */
  setBaseURL(baseURL) {
    this.client.defaults.baseURL = baseURL;
  }

  /**
   * Actualiza el timeout
   */
  setTimeout(timeout) {
    this.client.defaults.timeout = timeout;
  }

  /**
   * Agrega un header personalizado
   */
  setHeader(name, value) {
    this.client.defaults.headers.common[name] = value;
  }

  /**
   * Remueve un header personalizado
   */
  removeHeader(name) {
    delete this.client.defaults.headers.common[name];
  }
}

// Instancia singleton
const secureHttpClient = new SecureHttpClient();
export default secureHttpClient;
