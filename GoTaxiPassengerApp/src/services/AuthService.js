/**
 * Servicio de Autenticación - Capa de Servicios
 * Contiene la lógica de negocio para autenticación con caché local y validaciones avanzadas
 */
import AuthRepository from '../infrastructure/repositories/AuthRepository';
import User from '../domain/entities/User';
import secureStorage from '../utils/secureStorage';
import { sanitizeFormData, detectXSS } from '../utils/xssProtection';
import { validateInput, getSecurityHeaders } from '../utils/securityPolicy';
import {
  withLoginValidation,
  withRegistrationValidation,
  withSecurityLogging,
  withXSSProtection,
  withSecurityPolicy,
  withSecureStorage,
  withFormSecurity,
  withAdvancedSecurityLogging,
  withTokenValidation,
} from '../utils/securityMiddleware';

class AuthService {
  constructor() {
    this.authRepository = new AuthRepository();
    this.secureStorage = secureStorage;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 segundo

    // Configuración de seguridad
    this.securityConfig = {
      enableXSSProtection: true,
      enableInputValidation: true,
      enableSecureStorage: true,
      enableSecurityLogging: true,
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutos
    };

    // Inicializar métricas de seguridad
    this.securityMetrics = {
      loginAttempts: 0,
      failedAttempts: 0,
      xssDetections: 0,
      securityViolations: 0,
      lastLoginAttempt: null,
    };
  }

  /**
   * Iniciar sesión con medidas de seguridad avanzadas
   * @param {Object} data - Datos de login
   * @param {string} data.email - Email del usuario
   * @param {string} data.password - Contraseña del usuario
   * @returns {Promise<Object>} Resultado del login
   */
  login = withAdvancedSecurityLogging(
    withFormSecurity(
      withXSSProtection(
        withSecurityPolicy(
          withSecureStorage(
            withLoginValidation(async data => {
              try {
                // Verificar límite de intentos de login
                if (this.isAccountLocked()) {
                  return {
                    success: false,
                    error: 'Cuenta bloqueada temporalmente por múltiples intentos fallidos',
                    code: 'ACCOUNT_LOCKED',
                    retryAfter: this.getLockoutTimeRemaining(),
                  };
                }

                // Sanitizar y validar datos de entrada
                const sanitizedData = this.sanitizeLoginData(data);
                const validation = this.validateLoginData(sanitizedData.email, sanitizedData.password);

                if (!validation.isValid) {
                  this.recordFailedAttempt();
                  return {
                    success: false,
                    error: validation.errors.join(', '),
                    code: 'VALIDATION_ERROR',
                    details: validation.errors,
                  };
                }

                // Ejecutar login con retry logic
                const result = await this.executeWithRetry(async() => {
                  return await this.authRepository.login(sanitizedData.email, sanitizedData.password);
                });

                if (!result.success) {
                  this.recordFailedAttempt();
                  return {
                    success: false,
                    error: result.error || 'Error al iniciar sesión',
                    code: result.code || 'LOGIN_ERROR',
                  };
                }

                // Resetear contador de intentos fallidos
                this.resetFailedAttempts();

                // Lógica adicional de negocio si es necesaria
                const user = result.data;

                // Verificar si el usuario puede realizar acciones
                if (!user.canPerformActions()) {
                  return {
                    success: false,
                    error: 'Tu cuenta está inactiva. Contacta al soporte.',
                    code: 'ACCOUNT_INACTIVE',
                  };
                }

                // Guardar datos sensibles en almacenamiento seguro
                await this.secureStorage.setItem('user_id', user.id);
                await this.secureStorage.setItem('user_email', user.email);
                await this.secureStorage.setItem('last_login', Date.now().toString());

                // Guardar en caché local
                this.setCache('user_profile', user);
                this.setCache('last_login', Date.now());

                // Registrar intento exitoso
                this.recordSuccessfulLogin();

                return {
                  success: true,
                  data: result.data,
                  message: this.generateWelcomeMessage(user),
                  securityInfo: {
                    lastLogin: new Date().toISOString(),
                    securityLevel: this.getSecurityLevel(),
                  },
                };
              } catch (_error) {
                this.recordFailedAttempt();
                return {
                  success: false,
                  error: 'Error interno del servidor',
                  code: 'INTERNAL_ERROR',
                };
              }
            }),
            ['user_id', 'user_email', 'last_login'],
          ),
          {
            email: { type: 'email', required: true, maxLength: 255 },
            password: { type: 'password', required: true, minLength: 6, maxLength: 128 },
          },
        ),
        { enableDetection: true, enableSanitization: true },
      ),
      { enableValidation: true, enableSanitization: true },
    ),
    'LOGIN',
    { includeUserData: false, logSecurityEvents: true },
  );

  /**
   * Registrar usuario con medidas de seguridad avanzadas
   * @param {Object} userData - Datos del usuario
   * @param {string} userData.name - Nombre del usuario
   * @param {string} userData.lastname - Apellido del usuario
   * @param {string} userData.email - Email del usuario
   * @param {string} userData.password - Contraseña del usuario
   * @param {string} userData.phone - Teléfono del usuario
   * @returns {Promise<Object>} Resultado del registro
   */
  register = withAdvancedSecurityLogging(
    withFormSecurity(
      withXSSProtection(
        withSecurityPolicy(
          withSecureStorage(
            withRegistrationValidation(async userData => {
              try {
                // Sanitizar datos de entrada
                const sanitizedData = this.sanitizeRegistrationData(userData);

                // Crear entidad de usuario
                const user = new User({
                  ...sanitizedData,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                });

                // Validar datos de la entidad
                const validation = user.validate();
                if (!validation.isValid) {
                  return {
                    success: false,
                    error: validation.errors.join(', '),
                    code: 'VALIDATION_ERROR',
                    details: validation.errors,
                  };
                }

                // Llamar al repositorio con retry logic
                const result = await this.executeWithRetry(async() => {
                  return await this.authRepository.register(sanitizedData);
                });

                if (!result.success) {
                  return {
                    success: false,
                    error: result.error || 'Error al registrar usuario',
                    code: result.code || 'REGISTER_ERROR',
                  };
                }

                // Guardar datos sensibles en almacenamiento seguro
                if (result.data) {
                  await this.secureStorage.setItem('user_id', result.data.id);
                  await this.secureStorage.setItem('user_email', result.data.email);
                  await this.secureStorage.setItem('registration_date', new Date().toISOString());

                  // Guardar en caché
                  this.setCache('user_profile', result.data);
                }

                return {
                  success: true,
                  data: result.data,
                  message: 'Usuario registrado exitosamente',
                  securityInfo: {
                    registrationDate: new Date().toISOString(),
                    securityLevel: this.getSecurityLevel(),
                  },
                };
              } catch (_error) {
                return {
                  success: false,
                  error: 'Error interno del servidor',
                  code: 'INTERNAL_ERROR',
                };
              }
            }),
            ['user_id', 'user_email', 'registration_date'],
          ),
          {
            name: { type: 'text', required: true, maxLength: 100, pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/ },
            lastname: { type: 'text', required: true, maxLength: 100, pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/ },
            email: { type: 'email', required: true, maxLength: 255 },
            password: { type: 'password', required: true, minLength: 8, maxLength: 128 },
            phone: { type: 'phone', required: true, pattern: /^\+?[\d\s\-\(\)]+$/ },
          },
        ),
        { enableDetection: true, enableSanitization: true },
      ),
      { enableValidation: true, enableSanitization: true },
    ),
    'REGISTER',
    { includeUserData: false, logSecurityEvents: true },
  );

  /**
   * Obtener perfil del usuario autenticado
   * @description Recupera el perfil completo del usuario desde el servidor con lógica de retry
   * @returns {Promise<Object>} Resultado de la operación
   * @returns {boolean} result.success - Indica si la operación fue exitosa
   * @returns {Object} result.data - Datos del perfil del usuario
   * @returns {string} result.error - Mensaje de error si la operación falló
   * @returns {string} result.code - Código de error específico
   * @example
   * const result = await authService.getProfile();
   * if (result.success) {
   *   console.log('Usuario:', result.data.name);
   * }
   */
  async getProfile() {
    try {
      const result = await this.executeWithRetry(async() => {
        return await this.authRepository.getProfile();
      });

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Error al obtener perfil',
          code: result.code || 'PROFILE_ERROR',
        };
      }

      // Guardar en caché
      this.setCache('user_profile', result.data);

      return {
        success: true,
        data: result.data,
      };
    } catch (_error) {
      // console.error('Error en AuthService.getProfile:', error);
      return {
        success: false,
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
      };
    }
  }

  /**
   * Cerrar sesión del usuario
   * @description Cierra la sesión del usuario y limpia todos los datos locales
   * @returns {Promise<Object>} Resultado del logout
   * @returns {boolean} result.success - Indica si la operación fue exitosa
   * @returns {string} result.message - Mensaje de confirmación
   * @returns {string} result.error - Mensaje de error si la operación falló
   * @example
   * const result = await authService.logout();
   * if (result.success) {
   *   // Usuario deslogueado correctamente
   * }
   */
  async logout() {
    return this.logoutComplete();
  }

  /**
   * Verificar si el usuario está autenticado
   * @description Verifica si existe un token válido en el almacenamiento local
   * @returns {boolean} True si el usuario está autenticado, false en caso contrario
   * @example
   * if (authService.isAuthenticated()) {
   *   // Usuario autenticado
   * }
   */
  isAuthenticated() {
    return this.authRepository.isAuthenticated();
  }

  /**
   * Obtener token de autenticación
   * @description Recupera el token JWT del almacenamiento local
   * @returns {string|null} Token de autenticación o null si no existe
   * @example
   * const token = authService.getToken();
   * if (token) {
   *   // Usar token para requests
   * }
   */
  getToken() {
    return this.authRepository.getToken();
  }

  /**
   * Validar datos de login
   * @description Valida los datos de entrada para el login
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Object} Resultado de la validación
   * @returns {boolean} result.isValid - Indica si los datos son válidos
   * @returns {Array<string>} result.errors - Lista de errores encontrados
   * @example
   * const validation = authService.validateLoginData('user@example.com', 'password123');
   * if (!validation.isValid) {
   *   console.log('Errores:', validation.errors);
   * }
   */
  validateLoginData(email, password) {
    const errors = [];
    if (!email || !email.trim()) {
      errors.push('El email es requerido');
    } else if (!this.isValidEmail(email)) {
      errors.push('El email no es válido');
    }
    if (!password || !password.trim()) {
      errors.push('La contraseña es requerida');
    } else if (password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validar formato de email
   * @description Verifica si un email tiene un formato válido usando regex
   * @param {string} email - Email a validar
   * @returns {boolean} True si el email es válido, false en caso contrario
   * @example
   * if (authService.isValidEmail('user@example.com')) {
   *   // Email válido
   * }
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generar mensaje de bienvenida personalizado
   * @description Genera un saludo personalizado basado en la hora del día
   * @param {User} user - Instancia del usuario
   * @returns {string} Mensaje de bienvenida personalizado
   * @example
   * const message = authService.generateWelcomeMessage(user);
   * // "Buenos días, Juan Pérez"
   */
  generateWelcomeMessage(user) {
    const hour = new Date().getHours();
    let greeting = 'Buenos días';
    if (hour >= 12 && hour < 18) {
      greeting = 'Buenas tardes';
    } else if (hour >= 18) {
      greeting = 'Buenas noches';
    }
    return `${greeting}, ${user.getFullName()}`;
  }

  /**
   * Obtener datos del caché local
   * @description Recupera datos del caché en memoria con verificación de expiración
   * @param {string} key - Clave del caché
   * @returns {Object|null} Datos del caché o null si no existe o expiró
   * @example
   * const user = authService.getFromCache('user_profile');
   * if (user) {
   *   // Usar datos del caché
   * }
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Guardar datos en el caché local
   * @description Almacena datos en el caché en memoria con timestamp
   * @param {string} key - Clave del caché
   * @param {Object} data - Datos a guardar
   * @example
   * authService.setCache('user_profile', userData);
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Limpiar caché local
   * @description Elimina todos los datos del caché en memoria
   * @example
   * authService.clearCache();
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Ejecutar operación con lógica de reintentos
   * @description Ejecuta una operación con reintentos automáticos en caso de error
   * @param {Function} operation - Operación a ejecutar
   * @param {number} retries - Número de reintentos restantes
   * @returns {Promise<Object>} Resultado de la operación
   * @example
   * const result = await authService.executeWithRetry(async () => {
   *   return await apiCall();
   * });
   */
  async executeWithRetry(operation, retries = this.maxRetries) {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        await this.delay(this.retryDelay);
        return this.executeWithRetry(operation, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Verificar si un error es reintentable
   * @description Determina si un error debe ser reintentado basado en su tipo
   * @param {Error} error - Error a verificar
   * @returns {boolean} True si es reintentable, false en caso contrario
   * @example
   * if (authService.isRetryableError(error)) {
   *   // Reintentar operación
   * }
   */
  isRetryableError(error) {
    const retryableCodes = ['ECONNABORTED', 'ENOTFOUND', 'ECONNREFUSED'];
    const retryableStatuses = [408, 429, 500, 502, 503, 504];

    return retryableCodes.includes(error.code) ||
           retryableStatuses.includes(error.response?.status);
  }

  /**
   * Crear delay asíncrono
   * @description Crea una promesa que se resuelve después del tiempo especificado
   * @param {number} ms - Milisegundos a esperar
   * @returns {Promise<void>} Promise que se resuelve después del delay
   * @example
   * await authService.delay(1000); // Esperar 1 segundo
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obtener perfil con caché inteligente
   * @description Obtiene el perfil del usuario desde caché o servidor
   * @returns {Promise<Object>} Resultado de la operación
   * @returns {boolean} result.success - Indica si la operación fue exitosa
   * @returns {Object} result.data - Datos del perfil del usuario
   * @returns {boolean} result.fromCache - Indica si los datos vienen del caché
   * @example
   * const result = await authService.getProfileWithCache();
   * if (result.success) {
   *   console.log('Desde caché:', result.fromCache);
   * }
   */
  async getProfileWithCache() {
    const cacheKey = 'user_profile';
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return {
        success: true,
        data: cached,
        fromCache: true,
      };
    }

    const result = await this.getProfile();
    if (result.success) {
      this.setCache(cacheKey, result.data);
    }

    return result;
  }

  /**
   * Validar sesión y refrescar si es necesario
   * @description Verifica la validez de la sesión actual y refresca datos si es necesario
   * @returns {Promise<Object>} Estado de la sesión
   * @returns {boolean} result.valid - Indica si la sesión es válida
   * @returns {string} result.reason - Razón de invalidación si aplica
   * @returns {Object} result.user - Datos del usuario si la sesión es válida
   * @example
   * const session = await authService.validateSession();
   * if (session.valid) {
   *   console.log('Usuario:', session.user.name);
   * }
   */
  async validateSession() {
    try {
      const token = await this.secureStorage.getItem('token');
      if (!token) {
        return { valid: false, reason: 'NO_TOKEN' };
      }

      const profile = await this.getProfileWithCache();
      if (!profile.success) {
        return { valid: false, reason: 'INVALID_TOKEN' };
      }

      return { valid: true, user: profile.data };
    } catch (error) {
      return { valid: false, reason: 'ERROR', error };
    }
  }

  /**
   * Cerrar sesión completa con limpieza de datos
   * @description Cierra la sesión y limpia todos los datos locales y remotos
   * @returns {Promise<Object>} Resultado del logout
   * @returns {boolean} result.success - Indica si la operación fue exitosa
   * @returns {string} result.message - Mensaje de confirmación
   * @returns {string} result.error - Mensaje de error si la operación falló
   * @example
   * const result = await authService.logoutComplete();
   * if (result.success) {
   *   // Sesión cerrada correctamente
   * }
   */
  async logoutComplete() {
    try {
      // Limpiar caché local
      this.clearCache();

      // Limpiar almacenamiento seguro
      await this.secureStorage.clear();

      // Llamar al repositorio
      const result = await this.authRepository.logout();

      return {
        success: true,
        message: 'Sesión cerrada exitosamente',
        data: result.data,
      };
    } catch (error) {
      // Aún así limpiar datos locales
      this.clearCache();
      await this.secureStorage.clear();

      return {
        success: false,
        error: 'Error al cerrar sesión',
        code: 'LOGOUT_ERROR',
      };
    }
  }

  // ==================== MÉTODOS DE SEGURIDAD ====================

  /**
   * Sanitizar datos de login
   * @description Aplica sanitización y validación a los datos de login
   * @param {Object} data - Datos de login
   * @returns {Object} Datos sanitizados
   */
  sanitizeLoginData(data) {
    const sanitized = sanitizeFormData(data);

    // Detectar posibles ataques XSS
    const xssDetection = detectXSS(JSON.stringify(data));
    if (xssDetection.riskLevel !== 'LOW') {
      this.securityMetrics.xssDetections++;
      this.securityMetrics.securityViolations++;
    }

    return sanitized;
  }

  /**
   * Sanitizar datos de registro
   * @description Aplica sanitización y validación a los datos de registro
   * @param {Object} data - Datos de registro
   * @returns {Object} Datos sanitizados
   */
  sanitizeRegistrationData(data) {
    const sanitized = sanitizeFormData(data);

    // Detectar posibles ataques XSS
    const xssDetection = detectXSS(JSON.stringify(data));
    if (xssDetection.riskLevel !== 'LOW') {
      this.securityMetrics.xssDetections++;
      this.securityMetrics.securityViolations++;
    }

    return sanitized;
  }

  /**
   * Verificar si la cuenta está bloqueada
   * @description Verifica si la cuenta está bloqueada por múltiples intentos fallidos
   * @returns {boolean} True si está bloqueada, false en caso contrario
   */
  isAccountLocked() {
    const now = Date.now();
    const lastAttempt = this.securityMetrics.lastLoginAttempt;

    if (!lastAttempt) return false;

    const timeSinceLastAttempt = now - lastAttempt;
    const isLocked = this.securityMetrics.failedAttempts >= this.securityConfig.maxLoginAttempts &&
                     timeSinceLastAttempt < this.securityConfig.lockoutDuration;

    return isLocked;
  }

  /**
   * Obtener tiempo restante del bloqueo
   * @description Calcula el tiempo restante del bloqueo de cuenta
   * @returns {number} Tiempo restante en milisegundos
   */
  getLockoutTimeRemaining() {
    if (!this.isAccountLocked()) return 0;

    const now = Date.now();
    const lastAttempt = this.securityMetrics.lastLoginAttempt;
    const timeSinceLastAttempt = now - lastAttempt;

    return Math.max(0, this.securityConfig.lockoutDuration - timeSinceLastAttempt);
  }

  /**
   * Registrar intento fallido de login
   * @description Incrementa el contador de intentos fallidos
   */
  recordFailedAttempt() {
    this.securityMetrics.failedAttempts++;
    this.securityMetrics.lastLoginAttempt = Date.now();
  }

  /**
   * Resetear contador de intentos fallidos
   * @description Reinicia el contador de intentos fallidos
   */
  resetFailedAttempts() {
    this.securityMetrics.failedAttempts = 0;
    this.securityMetrics.lastLoginAttempt = null;
  }

  /**
   * Registrar login exitoso
   * @description Registra un login exitoso y actualiza métricas
   */
  recordSuccessfulLogin() {
    this.securityMetrics.loginAttempts++;
    this.resetFailedAttempts();
  }

  /**
   * Obtener nivel de seguridad actual
   * @description Calcula el nivel de seguridad basado en las métricas
   * @returns {string} Nivel de seguridad (LOW, MEDIUM, HIGH)
   */
  getSecurityLevel() {
    const { failedAttempts, xssDetections, securityViolations } = this.securityMetrics;

    if (securityViolations > 5 || xssDetections > 3 || failedAttempts > 3) {
      return 'HIGH';
    } else if (securityViolations > 2 || xssDetections > 1 || failedAttempts > 1) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  /**
   * Obtener métricas de seguridad
   * @description Retorna las métricas de seguridad actuales
   * @returns {Object} Métricas de seguridad
   */
  getSecurityMetrics() {
    return {
      ...this.securityMetrics,
      securityLevel: this.getSecurityLevel(),
      isLocked: this.isAccountLocked(),
      lockoutTimeRemaining: this.getLockoutTimeRemaining(),
    };
  }

  /**
   * Validar token de autenticación
   * @description Valida un token JWT usando las utilidades de seguridad
   * @param {string} token - Token a validar
   * @returns {Promise<Object>} Resultado de la validación
   */
  async validateToken(token) {
    try {
      // Usar el middleware de validación de token
      const validationResult = await withTokenValidation(async() => {
        return { valid: true, token };
      })({ token });

      return validationResult;
    } catch (_error) {
      return {
        valid: false,
        error: 'Token inválido',
        code: 'INVALID_TOKEN',
      };
    }
  }

  /**
   * Obtener configuración de seguridad
   * @description Retorna la configuración actual de seguridad
   * @returns {Object} Configuración de seguridad
   */
  getSecurityConfig() {
    return { ...this.securityConfig };
  }

  /**
   * Actualizar configuración de seguridad
   * @description Actualiza la configuración de seguridad
   * @param {Object} newConfig - Nueva configuración
   */
  updateSecurityConfig(newConfig) {
    this.securityConfig = { ...this.securityConfig, ...newConfig };
  }
}

export default AuthService;
