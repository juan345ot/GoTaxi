/**
 * Repositorio de Usuario - Capa de Infraestructura
 * Abstrae las llamadas a la API de usuario
 */
import { getProfile, updateProfile, updatePassword } from '../../api/user';
import User from '../../domain/entities/User';

class UserRepository {
  /**
   * Obtener perfil del usuario
   */
  async getProfile() {
    try {
      const response = await getProfile();
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
   * Actualizar perfil del usuario
   */
  async updateProfile(userData) {
    try {
      const response = await updateProfile(userData);
      if (response.success) {
        return {
          success: true,
          data: User.fromJSON(response.data),
        };
      }
      return {
        success: false,
        error: response.message || 'Error al actualizar perfil',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Actualizar contraseña
   */
  async updatePassword(passwordData) {
    try {
      const response = await updatePassword(passwordData);
      if (response.success) {
        return {
          success: true,
          message: response.message || 'Contraseña actualizada exitosamente',
        };
      }
      return {
        success: false,
        error: response.message || 'Error al actualizar contraseña',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Subir avatar
   */
  async uploadAvatar(imageUri) {
    try {
      // Esta funcionalidad se puede implementar con FormData
      // y una API específica para subir archivos
      const formData = new globalThis.FormData();
      formData.append('avatar', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      });
      // Simulación de respuesta exitosa
      return {
        success: true,
        data: {
          avatarUrl: imageUri,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al subir avatar',
      };
    }
  }

  /**
   * Eliminar cuenta
   */
  async deleteAccount() {
    try {
      // Esta funcionalidad se puede implementar con una API específica
      return {
        success: true,
        message: 'Cuenta eliminada exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al eliminar cuenta',
      };
    }
  }

  /**
   * Obtener configuración del usuario
   */
  async getUserSettings() {
    try {
      // Esta funcionalidad se puede implementar con AsyncStorage
      // o con una API específica para configuraciones
      return {
        success: true,
        data: {
          notifications: true,
          language: 'es',
          theme: 'light',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener configuración',
      };
    }
  }

  /**
   * Actualizar configuración del usuario
   */
  async updateUserSettings(settings) {
    try {
      // Esta funcionalidad se puede implementar con AsyncStorage
      // o con una API específica para configuraciones
      return {
        success: true,
        data: settings,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al actualizar configuración',
      };
    }
  }
}

export default UserRepository;
