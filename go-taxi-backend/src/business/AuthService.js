/* eslint-disable no-console, operator-linebreak */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserRepository } = require('../repositories/UserRepository');
const UserEntity = require('../domain/entities/User');

/**
 * Servicio de lógica de negocio para Autenticación
 * Contiene la lógica de negocio para login, registro y gestión de tokens
 *
 * @class AuthService
 * @description Maneja toda la lógica de autenticación y autorización del sistema
 */
class AuthService {
  /**
   * Constructor del servicio de autenticación
   * @description Inicializa el repositorio de usuarios y configuración JWT
   */
  constructor() {
    this.userRepository = new UserRepository();
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    this.refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
  }

  /**
   * Registrar un nuevo usuario en el sistema
   * @param {Object} userData - Datos del usuario a registrar
   * @param {string} userData.name - Nombre del usuario
   * @param {string} userData.lastname - Apellido del usuario
   * @param {string} userData.email - Email del usuario
   * @param {string} userData.password - Contraseña del usuario
   * @param {string} userData.phone - Teléfono del usuario
   * @param {string} [userData.role='pasajero'] - Rol del usuario
   * @returns {Promise<Object>} Usuario creado con tokens de autenticación
   * @throws {Error} Si los datos son inválidos o el email ya existe
   */
  async register(userData) {
    try {
      // Crear entidad de dominio
      const userEntity = new UserEntity({
        ...userData,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Validar la entidad
      const validation = userEntity.validate();
      if (!validation.isValid) {
        throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
      }

      // Verificar si el email ya existe
      const emailExists = await this.userRepository.emailExists(userEntity.email);
      if (emailExists) {
        throw new Error('El email ya está registrado');
      }

      // Encriptar password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Crear usuario en la base de datos
      const createdUser = await this.userRepository.create({
        ...userEntity.toJSON(),
        password: hashedPassword,
      });

      // Generar tokens
      const tokens = this.generateTokens(createdUser);

      return {
        success: true,
        data: {
          user: createdUser,
          ...tokens,
        },
        message: 'Usuario registrado exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Iniciar sesión de un usuario
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<Object>} Resultado del login con tokens de autenticación
   * @throws {Error} Si las credenciales son inválidas o el usuario está inactivo
   */
  async login(email, password) {
    try {
      // Buscar usuario con password
      const user = await this.userRepository.findByEmailWithPassword(email);
      if (!user) {
        throw new Error('Credenciales inválidas');
      }

      // Verificar si el usuario está activo
      if (!user.activo) {
        throw new Error('Usuario inactivo');
      }

      // Verificar password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Credenciales inválidas');
      }

      // Convertir a entidad
      const userEntity = this.userRepository.toEntity(user);

      // Generar tokens
      const tokens = this.generateTokens(userEntity);

      return {
        success: true,
        data: {
          user: userEntity,
          ...tokens,
        },
        message: 'Inicio de sesión exitoso',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Refrescar token de acceso usando refresh token
   * @description Renueva el token de acceso usando un refresh token válido
   * @param {string} refreshToken - Token de refresh válido
   * @returns {Promise<Object>} Resultado de la operación con nuevos tokens
   * @returns {boolean} result.success - Indica si la operación fue exitosa
   * @returns {Object} result.data - Nuevos tokens de autenticación
   * @returns {string} result.message - Mensaje de confirmación
   * @returns {string} result.error - Mensaje de error si la operación falló
   * @throws {Error} Si el refresh token es inválido o el usuario no existe
   * @example
   * const result = await authService.refreshToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
   * if(result.success) {
   *   console.log('Nuevo token:', result.data.accessToken);
   * }
   */
  async refreshToken(refreshToken) {
    try {
      // Verificar refresh token
      const decoded = jwt.verify(refreshToken, this.jwtSecret);

      // Buscar usuario
      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (!user.canPerformActions()) {
        throw new Error('Usuario inactivo');
      }

      // Generar nuevos tokens
      const tokens = this.generateTokens(user);

      return {
        success: true,
        data: tokens,
        message: 'Token refrescado exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Token de refresh inválido',
      };
    }
  }

  /**
   * Obtener perfil del usuario por ID
   * @description Recupera la información completa del perfil de un usuario
   * @param {string} userId - ID único del usuario
   * @returns {Promise<Object>} Resultado de la operación
   * @returns {boolean} result.success - Indica si la operación fue exitosa
   * @returns {Object} result.data - Datos del perfil del usuario
   * @returns {string} result.error - Mensaje de error si la operación falló
   * @throws {Error} Si el usuario no existe
   * @example
   * const result = await authService.getProfile('507f1f77bcf86cd799439011');
   * if(result.success) {
   *   console.log('Usuario:', result.data.name);
   * }
   */
  async getProfile(userId) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Actualizar perfil del usuario
   * @description Actualiza la información del perfil de un usuario existente
   * @param {string} userId - ID único del usuario
   * @param {Object} updateData - Datos a actualizar
   * @param {string} [updateData.name] - Nuevo nombre del usuario
   * @param {string} [updateData.lastname] - Nuevo apellido del usuario
   * @param {string} [updateData.email] - Nuevo email del usuario
   * @param {string} [updateData.phone] - Nuevo teléfono del usuario
   * @returns {Promise<Object>} Resultado de la operación
   * @returns {boolean} result.success - Indica si la operación fue exitosa
   * @returns {Object} result.data - Datos actualizados del usuario
   * @returns {string} result.message - Mensaje de confirmación
   * @returns {string} result.error - Mensaje de error si la operación falló
   * @throws {Error} Si el usuario no existe o los datos son inválidos
   * @example
   * const result = await authService.updateProfile('507f1f77bcf86cd799439011', {
   *   name: 'Juan',
   *   email: 'juan@example.com'
   * });
   * if(result.success) {
   *   console.log('Perfil actualizado:', result.data);
   * }
   */
  async updateProfile(userId, updateData) {
    try {
      // Verificar que el usuario existe
      const existingUser = await this.userRepository.findById(userId);
      if (!existingUser) {
        throw new Error('Usuario no encontrado');
      }

      // Si se está actualizando el email, verificar que no esté en uso
      if (updateData.email && updateData.email !== existingUser.email) {
        const emailExists = await this.userRepository.emailExists(updateData.email, userId);
        if (emailExists) {
          throw new Error('El email ya está en uso');
        }
      }

      // Crear entidad con datos actualizados
      const updatedUserEntity = new UserEntity({
        ...existingUser.toJSON(),
        ...updateData,
        id: userId,
      });

      // Validar la entidad actualizada
      const validation = updatedUserEntity.validate();
      if (!validation.isValid) {
        throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
      }

      // Actualizar en la base de datos
      const updatedUser = await this.userRepository.update(userId, updateData);

      return {
        success: true,
        data: updatedUser,
        message: 'Perfil actualizado exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Cambiar contraseña del usuario
   * @description Cambia la contraseña de un usuario verificando la contraseña actual
   * @param {string} userId - ID único del usuario
   * @param {string} currentPassword - Contraseña actual del usuario
   * @param {string} newPassword - Nueva contraseña del usuario
   * @returns {Promise<Object>} Resultado de la operación
   * @returns {boolean} result.success - Indica si la operación fue exitosa
   * @returns {string} result.message - Mensaje de confirmación
   * @returns {string} result.error - Mensaje de error si la operación falló
   * @throws {Error} Si el usuario no existe, la contraseña actual es incorrecta
   * o la nueva contraseña es inválida
   * @example
   * const result = await authService.changePassword(
   *   '507f1f77bcf86cd799439011',
   *   'oldpass123',
   *   'newpass456'
   * );
   * if(result.success) {
   *   console.log('Contraseña actualizada exitosamente');
   * }
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Buscar usuario primero para obtener el email
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Buscar usuario con password usando el email
      const userWithPassword = await this.userRepository.findByEmailWithPassword(user.email);
      if (!userWithPassword) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar contraseña actual
      const isValidPassword = await bcrypt.compare(currentPassword, userWithPassword.password);
      if (!isValidPassword) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Validar nueva contraseña
      if (!newPassword || newPassword.length < 6) {
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
      }

      // Encriptar nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Actualizar contraseña
      await this.userRepository.updatePassword(userId, hashedPassword);

      return {
        success: true,
        message: 'Contraseña actualizada exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verificar token de autenticación
   * @description Verifica la validez de un token JWT y retorna la información del usuario
   * @param {string} token - Token JWT a verificar
   * @returns {Promise<Object>} Resultado de la verificación
   * @returns {boolean} result.success - Indica si el token es válido
   * @returns {Object} result.data - Información del usuario y token
   * @returns {Object} result.data.user - Datos del usuario
   * @returns {string} result.data.userId - ID del usuario
   * @returns {string} result.data.role - Rol del usuario
   * @returns {string} result.error - Mensaje de error si el token es inválido
   * @throws {Error} Si el token es inválido, expirado o el usuario no existe
   * @example
   * const result = await authService.verifyToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
   * if(result.success) {
   *   console.log('Usuario autenticado:', result.data.user.email);
   * }
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);

      // Buscar usuario
      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (!user.canPerformActions()) {
        throw new Error('Usuario inactivo');
      }

      return {
        success: true,
        data: {
          user,
          userId: decoded.userId,
          role: decoded.role,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Token inválido',
      };
    }
  }

  /**
   * Generar tokens JWT para autenticación
   * @description Genera un par de tokens(access y refresh) para un usuario
   * @param {Object} user - Objeto del usuario
   * @param {string} user.id - ID único del usuario
   * @param {string} user.email - Email del usuario
   * @param {string} user.role - Rol del usuario
   * @returns {Object} Objeto con los tokens generados
   * @returns {string} accessToken - Token de acceso con expiración corta
   * @returns {string} refreshToken - Token de refresh con expiración larga
   * @returns {string} tokenType - Tipo de token(Bearer)
   * @returns {string} expiresIn - Tiempo de expiración del access token
   * @example
   * const tokens = authService.generateTokens({
   *   id: '507f1f77bcf86cd799439011',
   *   email: 'user@example.com',
   *   role: 'pasajero'
   * });
   * console.log('Access Token:', tokens.accessToken);
   */
  generateTokens(user) {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    const refreshExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
    };

    const accessToken = jwt.sign(payload, secret, {
      expiresIn,
      algorithm: 'HS256',
    });

    const refreshToken = jwt.sign({ ...payload, type: 'refresh' }, secret, {
      expiresIn: refreshExpiresIn,
      algorithm: 'HS256',
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn,
    };
  }

  /**
   * Validar formato de email
   * @description Verifica si un email tiene un formato válido usando regex
   * @param {string} email - Email a validar
   * @returns {boolean} True si el email es válido, false en caso contrario
   * @example
   * if(authService.isValidEmail('user@example.com')) {
   *   console.log('Email válido');
   * }
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar contraseña
   * @description Verifica si una contraseña cumple con los requisitos mínimos
   * @param {string} password - Contraseña a validar
   * @returns {boolean} True si la contraseña es válida, false en caso contrario
   * @example
   * if(authService.isValidPassword('password123')) {
   *   console.log('Contraseña válida');
   * }
   */
  isValidPassword(password) {
    return password && password.length >= 6;
  }

  /**
   * Generar código de verificación
   * @description Genera un código numérico de 6 dígitos para verificación
   * @returns {string} Código de verificación de 6 dígitos
   * @example
   * const code = authService.generateVerificationCode();
   * console.log('Código de verificación:', code); // "123456"
   */
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Obtener estadísticas de autenticación
   * @description Recupera estadísticas generales del sistema de autenticación
   * @returns {Promise<Object>} Resultado de la operación
   * @returns {boolean} result.success - Indica si la operación fue exitosa
   * @returns {Object} result.data - Estadísticas del sistema
   * @returns {number} result.data.totalUsers - Total de usuarios registrados
   * @returns {number} result.data.activeUsers - Total de usuarios activos
   * @returns {number} result.data.passengers - Total de pasajeros
   * @returns {number} result.data.drivers - Total de conductores
   * @returns {number} result.data.admins - Total de administradores
   * @returns {string} result.error - Mensaje de error si la operación falló
   * @throws {Error} Si hay un error al consultar la base de datos
   * @example
   * const result = await authService.getAuthStats();
   * if(result.success) {
   *   console.log('Total usuarios:', result.data.totalUsers);
   * }
   */
  async getAuthStats() {
    try {
      const totalUsers = await this.userRepository.findWithFilters({}, { limit: 1 });
      const activeUsers = await this.userRepository.findWithFilters(
        { isActive: true },
        { limit: 1 },
      );
      const passengers = await this.userRepository.findWithFilters(
        { role: 'pasajero' },
        { limit: 1 },
      );
      const drivers = await this.userRepository.findWithFilters(
        { role: 'conductor' },
        { limit: 1 },
      );
      const admins = await this.userRepository.findWithFilters({ role: 'admin' }, { limit: 1 });

      return {
        success: true,
        data: {
          totalUsers: totalUsers.pagination.total,
          activeUsers: activeUsers.pagination.total,
          passengers: passengers.pagination.total,
          drivers: drivers.pagination.total,
          admins: admins.pagination.total,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = { AuthService };
