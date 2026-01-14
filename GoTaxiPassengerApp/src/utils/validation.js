/**
 * Utilidades de validación y sanitización
 */

/**
 * Valida que una cadena no esté vacía y tenga la longitud correcta
 * @param {string} str - Cadena a validar
 * @param {number} min - Longitud mínima
 * @param {number} max - Longitud máxima
 * @returns {boolean} - True si es válida
 */
export const isValidString = (str, min = 1, max = Infinity) => {
  return typeof str === 'string' &&
         str.trim().length >= min &&
         str.length <= max;
};

/**
 * Valida rango numérico
 * @param {number} num - Número a validar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {boolean} - True si está en el rango
 */
export const isValidRange = (num, min = -Infinity, max = Infinity) => {
  const number = parseFloat(num);
  return !isNaN(number) &&
         number >= min &&
         number <= max;
};

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} - True si es un email válido
 */
export const isValidEmail = (email) => {
  if (typeof email !== 'string') return false;

  // Validar longitud máxima (254 caracteres según RFC 5321)
  if (email.length > 254) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida formato de teléfono
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} - True si es un teléfono válido
 */
export const isValidPhone = (phone) => {
  if (typeof phone !== 'string' || !phone) return false;

  // Limpiar el teléfono de espacios y guiones
  const cleanPhone = phone.replace(/[\s\-]/g, '');

  // Validar formato: acepta números internacionales (+1234567890) o locales (1234567890)
  // También acepta formato argentino con código de área
  const phoneRegex = /^(\+\d{1,3})?\d{6,15}$/;

  return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10 && cleanPhone.length <= 15;
};

/**
 * Valida que un valor no sea null o undefined
 * @param {any} value - Valor a validar
 * @returns {boolean} - True si no es null ni undefined
 */
export const isNotNullOrUndefined = (value) => {
  return value !== null && value !== undefined;
};

/**
 * Sanitiza una cadena removiendo caracteres peligrosos
 * @param {string} str - Cadena a sanitizar
 * @param {number} maxLength - Longitud máxima (default: 1000)
 * @returns {string} - Cadena sanitizada
 */
export const sanitizeString = (str, maxLength = 1000) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[\x00-\x1F\x7F]/g, '') // Remover caracteres de control
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .substring(0, maxLength) // Limitar longitud
    .trim();
};

/**
 * Sanitiza un objeto recursivamente
 * @param {any} data - Datos a sanitizar
 * @returns {any} - Datos sanitizados
 */
export const sanitizeObject = (data) => {
  if (Array.isArray(data)) {
    return data.map(item => sanitizeObject(item));
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitized[key] = sanitizeObject(data[key]);
      }
    }
    return sanitized;
  }

  if (typeof data === 'string') {
    return sanitizeString(data);
  }

  return data;
};

/**
 * Sanitiza datos de entrada
 * @param {any} data - Datos a sanitizar
 * @returns {any} - Datos sanitizados
 */
export const sanitizeInput = (data) => {
  if (typeof data === 'string') {
    return sanitizeString(data);
  }

  if (typeof data === 'object' && data !== null) {
    return sanitizeObject(data);
  }

  return data;
};

/**
 * Valida y sanitiza datos de entrada
 * @param {any} data - Datos a validar y sanitizar
 * @param {Function} validator - Función de validación
 * @returns {Object} - Objeto con datos sanitizados y resultado de validación
 */
export const validateAndSanitize = (data, validator) => {
  const sanitizedData = sanitizeInput(data);
  const validation = validator(sanitizedData);

  return {
    data: sanitizedData,
    validation,
  };
};

/**
 * Valida que un array no esté vacío
 * @param {Array} arr - Array a validar
 * @returns {boolean} - True si el array no está vacío
 */
export const isNotEmptyArray = (arr) => {
  return Array.isArray(arr) && arr.length > 0;
};

/**
 * Valida que un objeto tenga las propiedades requeridas
 * @param {Object} obj - Objeto a validar
 * @param {Array} requiredProps - Propiedades requeridas
 * @returns {boolean} - True si tiene todas las propiedades requeridas
 */
export const hasRequiredProperties = (obj, requiredProps) => {
  if (typeof obj !== 'object' || obj === null) return false;

  return requiredProps.every(prop =>
    Object.prototype.hasOwnProperty.call(obj, prop) &&
    obj[prop] !== null &&
    obj[prop] !== undefined,
  );
};

/**
 * Valida formato de fecha ISO
 * @param {string} dateString - Fecha en formato string
 * @returns {boolean} - True si es una fecha ISO válida
 */
export const isValidISODate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date &&
         !isNaN(date) &&
         date.toISOString() === dateString;
};

/**
 * Valida que un valor esté en una lista de opciones válidas
 * @param {any} value - Valor a validar
 * @param {Array} validOptions - Opciones válidas
 * @returns {boolean} - True si el valor está en las opciones válidas
 */
export const isValidOption = (value, validOptions) => {
  return validOptions.includes(value);
};

/**
 * Valida contraseña fuerte
 * @param {string} password - Contraseña a validar
 * @returns {boolean} - True si es una contraseña válida
 */
export const isValidPassword = (password) => {
  if (typeof password !== 'string') return false;

  // Al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Valida nombre de persona
 * @param {string} name - Nombre a validar
 * @returns {boolean} - True si es un nombre válido
 */
export const isValidName = (name) => {
  if (typeof name !== 'string') return false;

  // Al menos 2 caracteres, solo letras, espacios y algunos caracteres especiales
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/;
  return nameRegex.test(name.trim());
};

/**
 * Valida coordenadas geográficas
 * @param {number} latitude - Latitud
 * @param {number} longitude - Longitud
 * @returns {boolean} - True si son coordenadas válidas
 */
export const isValidCoordinates = (latitude, longitude) => {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  return !isNaN(lat) && !isNaN(lng) &&
         lat >= -90 && lat <= 90 &&
         lng >= -180 && lng <= 180;
};

/**
 * Valida datos de registro de usuario
 * @param {Object} data - Datos de registro
 * @returns {Object} - Resultado de validación
 */
export const validateUserRegistration = (data) => {
  const errors = [];

  if (!isValidName(data.name)) {
    errors.push('El nombre debe tener al menos 2 caracteres y solo contener letras');
  }

  if (!isValidEmail(data.email)) {
    errors.push('El email no tiene un formato válido');
  }

  if (data.email && data.email.length > 254) {
    errors.push('El email es demasiado largo');
  }

  if (!isValidPassword(data.password)) {
    errors.push('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial');
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.push('El teléfono no tiene un formato válido');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida datos de login
 * @param {Object} data - Datos de login
 * @returns {Object} - Resultado de validación
 */
export const validateLogin = (data) => {
  const errors = [];

  if (!isValidEmail(data.email)) {
    errors.push('El email no tiene un formato válido');
  }

  if (!isValidString(data.password, 1)) {
    errors.push('La contraseña es requerida');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida datos de actualización de perfil
 * @param {Object} data - Datos del perfil
 * @returns {Object} - Resultado de validación
 */
export const validateProfileUpdate = (data) => {
  const errors = [];

  if (data.name && !isValidName(data.name)) {
    errors.push('El nombre debe tener al menos 2 caracteres y solo contener letras');
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.push('El email no tiene un formato válido');
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.push('El teléfono no tiene un formato válido');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida cambio de contraseña
 * @param {Object} data - Datos de cambio de contraseña
 * @returns {Object} - Resultado de validación
 */
export const validatePasswordChange = (data) => {
  const errors = [];

  if (!isValidString(data.currentPassword, 1)) {
    errors.push('La contraseña actual es requerida');
  }

  if (!isValidPassword(data.newPassword)) {
    errors.push('La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial');
  }

  if (data.newPassword !== data.confirmPassword) {
    errors.push('Las contraseñas no coinciden');
  }

  if (data.currentPassword === data.newPassword) {
    errors.push('La nueva contraseña debe ser diferente a la actual');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida datos de solicitud de viaje
 * @param {Object} data - Datos del viaje
 * @returns {Object} - Resultado de validación
 */
export const validateTripRequest = (data) => {
  const errors = [];

  // Validar origen
  if (!data.origin || !data.origin.address || !isValidString(data.origin.address, 1)) {
    errors.push('La dirección de origen es requerida');
  }

  if (!data.origin || !isValidCoordinates(data.origin.lat, data.origin.lng)) {
    errors.push('Las coordenadas de origen no son válidas');
  }

  // Validar destino
  if (!data.destination || !data.destination.address || !isValidString(data.destination.address, 1)) {
    errors.push('La dirección de destino es requerida');
  }

  if (!data.destination || !isValidCoordinates(data.destination.lat, data.destination.lng)) {
    errors.push('Las coordenadas de destino no son válidas');
  }

  // Validar que origen y destino no sean iguales
  if (data.origin && data.destination &&
      data.origin.lat === data.destination.lat &&
      data.origin.lng === data.destination.lng) {
    errors.push('El origen y destino no pueden ser iguales');
  }

  // Validar método de pago
  if (!data.paymentMethod || !isValidString(data.paymentMethod, 1)) {
    errors.push('El método de pago es requerido');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
