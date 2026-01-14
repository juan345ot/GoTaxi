import { validateLogin, validateUserRegistration } from './validation';
import { sanitizeInput } from './validation';
import xssProtection from './xssProtection';
import securityPolicy from './securityPolicy';
import secureStorage from './secureStorage';

/**
 * Middleware de seguridad para validación de login
 */
export const withLoginValidation = (fn) => {
  return async(data) => {
    const validation = validateLogin(data);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
      };
    }
    return fn(data);
  };
};

/**
 * Middleware de seguridad para validación de registro
 */
export const withRegistrationValidation = (fn) => {
  return async(data) => {
    const validation = validateUserRegistration(data);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
      };
    }
    return fn(data);
  };
};

/**
 * Middleware de seguridad para logging
 */
export const withSecurityLogging = (fn, action) => {
  return async(data) => {
    try {
      // Log de seguridad (en producción esto iría a un servicio de logging)
      if (__DEV__) {
        // Security logging in development
      }
      return await fn(data);
    } catch (error) {
      // Log de error de seguridad
      if (__DEV__) {
        // Security error logging in development
      }
      throw error;
    }
  };
};

/**
 * Middleware de seguridad para sanitización de datos
 */
export const withSanitization = (fn) => {
  return async(data) => {
    const sanitizedData = sanitizeInput(data);
    return fn(sanitizedData);
  };
};

/**
 * Middleware de seguridad para validación de perfil
 */
export const withProfileValidation = (fn) => {
  return async(data) => {
    const validation = validateUserRegistration(data);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
      };
    }
    return fn(data);
  };
};

/**
 * Middleware de seguridad para validación de contraseña
 */
export const withPasswordValidation = (fn) => {
  return async(data) => {
    const { currentPassword, newPassword, confirmPassword } = data;
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

    if (errors.length > 0) {
      return {
        success: false,
        error: errors.join(', '),
      };
    }

    return fn(data);
  };
};

/**
 * Middleware de seguridad para protección XSS
 * @description Aplica protección contra XSS a los datos de entrada
 * @param {Function} fn - Función a proteger
 * @param {Object} options - Opciones de sanitización
 * @returns {Function} Función protegida
 */
export const withXSSProtection = (fn, options = {}) => {
  return async(data) => {
    try {
      // Detectar intentos de XSS
      const xssDetection = xssProtection.detectXSS(JSON.stringify(data));

      if (xssDetection.isSuspicious) {
        console.warn('Intento de XSS detectado:', xssDetection);

        if (xssDetection.riskLevel === 'high') {
          return {
            success: false,
            error: 'Datos de entrada no válidos',
            securityAlert: true,
          };
        }
      }

      // Sanitizar datos según el tipo
      let sanitizedData = data;

      if (typeof data === 'object' && data !== null) {
        sanitizedData = {};
        for (const [key, value] of Object.entries(data)) {
          if (typeof value === 'string') {
            sanitizedData[key] = xssProtection.sanitizeText(value, options);
          } else {
            sanitizedData[key] = value;
          }
        }
      } else if (typeof data === 'string') {
        sanitizedData = xssProtection.sanitizeText(data, options);
      }

      return fn(sanitizedData);
    } catch (error) {
      console.error('Error en protección XSS:', error);
      return {
        success: false,
        error: 'Error de seguridad en datos de entrada',
      };
    }
  };
};

/**
 * Middleware de seguridad para validación de política de seguridad
 * @description Aplica validaciones de política de seguridad
 * @param {Function} fn - Función a proteger
 * @param {Object} options - Opciones de validación
 * @returns {Function} Función protegida
 */
export const withSecurityPolicy = (fn, options = {}) => {
  return async(data) => {
    try {
      // Validar datos de entrada según política de seguridad
      const validation = securityPolicy.validateInput(data, options);

      if (!validation.isValid) {
        return {
          success: false,
          error: 'Datos no cumplen con la política de seguridad',
          details: validation.warnings,
        };
      }

      // Si hay advertencias, logearlas
      if (validation.warnings.length > 0) {
        console.warn('Advertencias de seguridad:', validation.warnings);
      }

      return fn(validation.data);
    } catch (error) {
      console.error('Error en validación de política de seguridad:', error);
      return {
        success: false,
        error: 'Error de validación de seguridad',
      };
    }
  };
};

/**
 * Middleware de seguridad para almacenamiento seguro
 * @description Aplica almacenamiento seguro a datos sensibles
 * @param {Function} fn - Función a proteger
 * @param {Array} sensitiveFields - Campos sensibles a encriptar
 * @returns {Function} Función protegida
 */
export const withSecureStorage = (fn, sensitiveFields = []) => {
  return async(data) => {
    try {
      // Verificar integridad del almacenamiento
      const integrityReport = await secureStorage.verifyIntegrity();

      if (integrityReport.corruptedKeys > 0) {
        console.warn('Datos corruptos detectados:', integrityReport.corruptedKeys);
        await secureStorage.cleanCorruptedData();
      }

      // Procesar datos sensibles
      const processedData = { ...data };

      for (const field of sensitiveFields) {
        if (processedData[field]) {
          // Encriptar campo sensible
          const encryptedValue = secureStorage.encrypt(processedData[field]);
          processedData[`${field}_encrypted`] = encryptedValue;
          delete processedData[field]; // Remover valor original
        }
      }

      return fn(processedData);
    } catch (error) {
      console.error('Error en almacenamiento seguro:', error);
      return {
        success: false,
        error: 'Error de seguridad en almacenamiento',
      };
    }
  };
};

/**
 * Middleware de seguridad para validación de formularios
 * @description Aplica validación y sanitización completa a formularios
 * @param {Function} fn - Función a proteger
 * @param {Object} formRules - Reglas de validación por campo
 * @returns {Function} Función protegida
 */
export const withFormSecurity = (fn, formRules = {}) => {
  return async(formData) => {
    try {
      // Sanitizar datos del formulario
      const sanitizedResult = xssProtection.sanitizeFormData(formData, formRules);

      if (!sanitizedResult.isValid) {
        return {
          success: false,
          error: 'Datos del formulario no válidos',
          fieldErrors: sanitizedResult.errors,
        };
      }

      // Aplicar política de seguridad
      const securityValidation = securityPolicy.validateInput(sanitizedResult.data);

      if (!securityValidation.isValid) {
        return {
          success: false,
          error: 'Datos no cumplen con política de seguridad',
          details: securityValidation.warnings,
        };
      }

      return fn(securityValidation.data);
    } catch (error) {
      console.error('Error en validación de formulario:', error);
      return {
        success: false,
        error: 'Error de validación de formulario',
      };
    }
  };
};

/**
 * Middleware de seguridad para logging avanzado
 * @description Implementa logging de seguridad avanzado
 * @param {Function} fn - Función a proteger
 * @param {string} action - Acción que se está realizando
 * @param {Object} options - Opciones de logging
 * @returns {Function} Función protegida
 */
export const withAdvancedSecurityLogging = (fn, action, options = {}) => {
  return async(data) => {
    const startTime = Date.now();
    const sessionId = options.sessionId || 'unknown';

    try {
      // Log de inicio de operación
      console.log(`[SECURITY] Iniciando ${action} - Session: ${sessionId}`);

      // Detectar patrones sospechosos
      const xssDetection = xssProtection.detectXSS(JSON.stringify(data));
      if (xssDetection.isSuspicious) {
        console.warn(`[SECURITY] Patrones sospechosos detectados en ${action}:`, xssDetection);
      }

      const result = await fn(data);
      const duration = Date.now() - startTime;

      // Log de éxito
      console.log(`[SECURITY] ${action} completado exitosamente - Duration: ${duration}ms`);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log de error de seguridad
      console.error(`[SECURITY] Error en ${action} - Duration: ${duration}ms`, {
        error: error.message,
        sessionId,
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  };
};

/**
 * Middleware de seguridad para validación de tokens
 * @description Valida tokens de autenticación de forma segura
 * @param {Function} fn - Función a proteger
 * @param {Object} options - Opciones de validación
 * @returns {Function} Función protegida
 */
export const withTokenValidation = (fn, options = {}) => {
  return async(data) => {
    try {
      const { token } = data;

      if (!token) {
        return {
          success: false,
          error: 'Token de autenticación requerido',
        };
      }

      // Validar formato del token
      if (typeof token !== 'string' || token.length < 10) {
        return {
          success: false,
          error: 'Formato de token inválido',
        };
      }

      // Verificar que el token no contenga caracteres peligrosos
      const tokenValidation = securityPolicy.validateInput(token, {
        maxLength: 1000,
        allowHTML: false,
        allowScripts: false,
      });

      if (!tokenValidation.isValid) {
        return {
          success: false,
          error: 'Token contiene caracteres no válidos',
        };
      }

      return fn(data);
    } catch (error) {
      console.error('Error en validación de token:', error);
      return {
        success: false,
        error: 'Error de validación de token',
      };
    }
  };
};

/**
 * Middleware de seguridad para rate limiting
 * @description Implementa rate limiting básico
 * @param {Function} fn - Función a proteger
 * @param {Object} options - Opciones de rate limiting
 * @returns {Function} Función protegida
 */
export const withRateLimiting = (fn, options = {}) => {
  const requests = new Map();
  const config = {
    maxRequests: options.maxRequests || 10,
    windowMs: options.windowMs || 60000, // 1 minuto
    ...options,
  };

  return async(data) => {
    try {
      const identifier = data.userId || data.email || 'anonymous';
      const now = Date.now();
      const windowStart = now - config.windowMs;

      // Limpiar requests antiguos
      if (requests.has(identifier)) {
        const userRequests = requests.get(identifier).filter(time => time > windowStart);
        requests.set(identifier, userRequests);
      } else {
        requests.set(identifier, []);
      }

      const userRequests = requests.get(identifier);

      if (userRequests.length >= config.maxRequests) {
        return {
          success: false,
          error: 'Demasiadas solicitudes. Intenta más tarde.',
          retryAfter: Math.ceil((userRequests[0] + config.windowMs - now) / 1000),
        };
      }

      // Registrar request
      userRequests.push(now);
      requests.set(identifier, userRequests);

      return fn(data);
    } catch (error) {
      console.error('Error en rate limiting:', error);
      return {
        success: false,
        error: 'Error de rate limiting',
      };
    }
  };
};
