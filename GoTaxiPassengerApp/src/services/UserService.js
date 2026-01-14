/**
 * Servicio de Usuario - Capa de Servicios
 * Contiene la lógica de negocio para usuarios
 */
import UserRepository from '../infrastructure/repositories/UserRepository';
import User from '../domain/entities/User';

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Obtener perfil del usuario
   */
  async getProfile() {
    const result = await this.userRepository.getProfile();
    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    }
    return result;
  }

  /**
   * Actualizar perfil del usuario
   */
  async updateProfile(userData) {
    // Crear entidad de usuario con los datos actualizados
    const user = new User(userData);
    // Validar datos
    const validation = user.validate();
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
      };
    }

    const result = await this.userRepository.updateProfile(userData);
    if (result.success) {
      return {
        success: true,
        data: result.data,
        message: 'Perfil actualizado exitosamente',
      };
    }
    return result;
  }

  /**
   * Actualizar contraseña
   */
  async updatePassword(currentPassword, newPassword, confirmPassword) {
    // Validar datos de entrada
    const validation = this.validatePasswordChange(currentPassword, newPassword, confirmPassword);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
      };
    }

    const passwordData = {
      currentPassword,
      newPassword,
    };

    const result = await this.userRepository.updatePassword(passwordData);
    if (result.success) {
      return {
        success: true,
        message: result.message || 'Contraseña actualizada exitosamente',
      };
    }
    return result;
  }

  /**
   * Subir avatar
   */
  async uploadAvatar(imageUri) {
    if (!imageUri) {
      return {
        success: false,
        error: 'Imagen requerida',
      };
    }

    const result = await this.userRepository.uploadAvatar(imageUri);
    if (result.success) {
      return {
        success: true,
        data: result.data,
        message: 'Avatar actualizado exitosamente',
      };
    }
    return result;
  }

  /**
   * Eliminar cuenta
   */
  async deleteAccount() {
    const result = await this.userRepository.deleteAccount();
    if (result.success) {
      return {
        success: true,
        message: result.message || 'Cuenta eliminada exitosamente',
      };
    }
    return result;
  }

  /**
   * Obtener configuración del usuario
   */
  async getUserSettings() {
    const result = await this.userRepository.getUserSettings();
    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    }
    return result;
  }

  /**
   * Actualizar configuración del usuario
   */
  async updateUserSettings(settings) {
    // Validar configuración
    const validation = this.validateUserSettings(settings);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
      };
    }

    const result = await this.userRepository.updateUserSettings(settings);
    if (result.success) {
      return {
        success: true,
        data: result.data,
        message: 'Configuración actualizada exitosamente',
      };
    }
    return result;
  }

  /**
   * Validar cambio de contraseña
   */
  validatePasswordChange(currentPassword, newPassword, confirmPassword) {
    const errors = [];
    if (!currentPassword) {
      errors.push('La contraseña actual es requerida');
    }
    if (!newPassword) {
      errors.push('La nueva contraseña es requerida');
    } else if (newPassword.length < 6) {
      errors.push('La nueva contraseña debe tener al menos 6 caracteres');
    }
    if (!confirmPassword) {
      errors.push('La confirmación de contraseña es requerida');
    } else if (newPassword !== confirmPassword) {
      errors.push('Las contraseñas no coinciden');
    }
    if (currentPassword === newPassword) {
      errors.push('La nueva contraseña debe ser diferente a la actual');
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validar configuración del usuario
   */
  validateUserSettings(settings) {
    const errors = [];
    if (settings.language && !['es', 'en'].includes(settings.language)) {
      errors.push('El idioma debe ser válido');
    }
    if (settings.theme && !['light', 'dark'].includes(settings.theme)) {
      errors.push('El tema debe ser válido');
    }
    if (typeof settings.notifications !== 'boolean') {
      errors.push('Las notificaciones deben ser un valor booleano');
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generar iniciales del usuario
   */
  generateInitials(user) {
    if (!user.name || !user.lastname) {
      return 'U';
    }
    return `${user.name.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();
  }

  /**
   * Verificar si el usuario puede editar su perfil
   */
  canEditProfile(user) {
    return user && user.canPerformActions();
  }

  /**
   * Obtener información de contacto del usuario
   */
  getContactInfo(user) {
    const contactInfo = {
      email: user.email,
      phone: user.phone || 'No disponible',
    };
    return contactInfo;
  }
}

export default UserService;
