/**
 * Repositorio de Autenticación - Capa de Infraestructura
 * Abstrae las llamadas a la API de autenticación
 */
import { login as loginAPI, register as registerAPI, profile as profileAPI } from '../../api/auth';
import User from '../../domain/entities/User';

class AuthRepository {
  /**
   * Iniciar sesión
   */
  async login(email, password) {
    try {
      const response = await loginAPI(email, password);
      if (response.success) {
        return {
          success: true,
          data: {
            user: User.fromJSON(response.data.user),
            token: response.data.token,
            refreshToken: response.data.refreshToken,
          },
        };
      }
      return {
        success: false,
        error: response.message || 'Error al iniciar sesión',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Registrar usuario
   */
  async register(userData) {
    try {
      const response = await registerAPI(userData);
      if (response.success) {
        return {
          success: true,
          data: {
            user: User.fromJSON(response.data.user),
            token: response.data.token,
            refreshToken: response.data.refreshToken,
          },
        };
      }
      return {
        success: false,
        error: response.message || 'Error al registrar usuario',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Obtener perfil del usuario
   */
  async getProfile() {
    try {
      const response = await profileAPI();
      if (response.success) {
        return {
          success: true,
          data: User.fromJSON(response.data),
        };
      }
      return {
        success: false,
        error: response.message || 'Error al obtener perfil',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated() {
    // Esta lógica puede ser implementada con AsyncStorage
    // o con el contexto de autenticación
    return false; // Placeholder
  }

  /**
   * Obtener token de autenticación
   */
  getToken() {
    // Esta lógica puede ser implementada con AsyncStorage
    return null; // Placeholder
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    try {
      // Aquí se puede implementar la lógica de logout
      // como invalidar el token en el servidor
      return {
        success: true,
        message: 'Sesión cerrada exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al cerrar sesión',
      };
    }
  }
}

export default AuthRepository;
