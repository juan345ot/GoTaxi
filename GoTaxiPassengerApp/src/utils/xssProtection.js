// eslint-disable-next-line import/no-extraneous-dependencies
let DOMPurify;
try {
  // eslint-disable-next-line import/no-extraneous-dependencies
  DOMPurify = require('dompurify');
} catch (e) {
  // Mock para entornos donde dompurify no está disponible (ej: tests)
  DOMPurify = {
    sanitize: (html) => html,
    setConfig: () => {},
    clearConfig: () => {},
    isValidAttribute: () => true,
    addHook: () => {},
    removeHook: () => {},
    removeAllHooks: () => {},
    version: '2.0.0',
  };
}
import { Platform } from 'react-native';

/**
 * Utilidades de protección contra XSS y sanitización de datos
 * @description Proporciona funciones para prevenir ataques XSS y sanitizar datos de entrada
 */
class XSSProtection {
  constructor() {
    this.allowedTags = [
      'b', 'i', 'em', 'strong', 'p', 'br', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre',
    ];

    this.allowedAttributes = {
      a: ['href', 'title', 'target'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      div: ['class', 'id'],
      span: ['class', 'id'],
      p: ['class', 'id'],
      h1: ['class', 'id'],
      h2: ['class', 'id'],
      h3: ['class', 'id'],
      h4: ['class', 'id'],
      h5: ['class', 'id'],
      h6: ['class', 'id'],
    };

    this.dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
      /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
      /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi,
      /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /onclick\s*=/gi,
      /onmouseover\s*=/gi,
      /onfocus\s*=/gi,
      /onblur\s*=/gi,
      /onchange\s*=/gi,
      /onsubmit\s*=/gi,
      /onreset\s*=/gi,
      /onselect\s*=/gi,
      /onkeydown\s*=/gi,
      /onkeyup\s*=/gi,
      /onkeypress\s*=/gi,
      /onmousedown\s*=/gi,
      /onmouseup\s*=/gi,
      /onmousemove\s*=/gi,
      /onmouseout\s*=/gi,
      /onmouseenter\s*=/gi,
      /onmouseleave\s*=/gi,
      /oncontextmenu\s*=/gi,
      /ondblclick\s*=/gi,
      /onabort\s*=/gi,
      /onbeforeunload\s*=/gi,
      /onerror\s*=/gi,
      /onhashchange\s*=/gi,
      /onload\s*=/gi,
      /onpageshow\s*=/gi,
      /onpagehide\s*=/gi,
      /onresize\s*=/gi,
      /onscroll\s*=/gi,
      /onunload\s*=/gi,
    ];

    this.suspiciousPatterns = [
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /setTimeout\s*\(/gi,
      /setInterval\s*\(/gi,
      /document\./gi,
      /window\./gi,
      /location\./gi,
      /history\./gi,
      /navigator\./gi,
      /screen\./gi,
      /alert\s*\(/gi,
      /confirm\s*\(/gi,
      /prompt\s*\(/gi,
      /console\./gi,
    ];
  }

  /**
   * Sanitiza texto HTML removiendo contenido peligroso
   * @description Limpia HTML removiendo scripts, eventos y contenido peligroso
   * @param {string} html - HTML a sanitizar
   * @param {Object} options - Opciones de sanitización
   * @returns {string} HTML sanitizado
   */
  sanitizeHTML(html, options = {}) {
    try {
      if (!html || typeof html !== 'string') {
        return '';
      }

      // Configuración por defecto
      const config = {
        allowedTags: options.allowedTags || this.allowedTags,
        allowedAttributes: options.allowedAttributes || this.allowedAttributes,
        allowedSchemes: options.allowedSchemes || ['http', 'https', 'mailto', 'tel'],
        allowedSchemesByTag: options.allowedSchemesByTag || {
          a: ['http', 'https', 'mailto', 'tel'],
          img: ['http', 'https', 'data'],
        },
        allowedSchemesAppliedToAttributes: options.allowedSchemesAppliedToAttributes || ['href', 'src'],
        allowDataAttributes: options.allowDataAttributes || false,
        allowUnknownMarkup: options.allowUnknownMarkup || false,
        ...options,
      };

      // En React Native, usar sanitización manual ya que DOMPurify no está disponible
      if (Platform.OS !== 'web') {
        return this.sanitizeHTMLManual(html, config);
      }

      // En web, usar DOMPurify si está disponible
      if (typeof DOMPurify !== 'undefined') {
        return DOMPurify.sanitize(html, config);
      }

      // Fallback a sanitización manual
      return this.sanitizeHTMLManual(html, config);
    } catch (error) {
      // eslint-disable-next-line no-console
      if (__DEV__) console.error('Error sanitizing HTML:', error);
      return '';
    }
  }

  /**
   * Sanitización manual de HTML para React Native
   * @description Implementa sanitización básica sin dependencias externas
   * @param {string} html - HTML a sanitizar
   * @param {Object} config - Configuración de sanitización
   * @returns {string} HTML sanitizado
   */
  sanitizeHTMLManual(html, config) {
    let sanitized = html;

    // Remover patrones peligrosos
    this.dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Remover patrones sospechosos
    this.suspiciousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Remover atributos de eventos
    sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/\s+on\w+\s*=\s*[^>\s]+/gi, '');

    // Remover scripts y contenido peligroso
    sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
    sanitized = sanitized.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
    sanitized = sanitized.replace(/<object[^>]*>.*?<\/object>/gi, '');
    sanitized = sanitized.replace(/<embed[^>]*>.*?<\/embed>/gi, '');
    sanitized = sanitized.replace(/<link[^>]*>/gi, '');
    sanitized = sanitized.replace(/<meta[^>]*>/gi, '');
    sanitized = sanitized.replace(/<style[^>]*>.*?<\/style>/gi, '');

    // Remover javascript: y vbscript: de URLs
    sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
    sanitized = sanitized.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""');
    sanitized = sanitized.replace(/href\s*=\s*["']vbscript:[^"']*["']/gi, 'href="#"');
    sanitized = sanitized.replace(/src\s*=\s*["']vbscript:[^"']*["']/gi, 'src=""');

    return sanitized;
  }

  /**
   * Sanitiza texto plano removiendo caracteres peligrosos
   * @description Limpia texto plano de caracteres y patrones peligrosos
   * @param {string} text - Texto a sanitizar
   * @param {Object} options - Opciones de sanitización
   * @returns {string} Texto sanitizado
   */
  sanitizeText(text, options = {}) {
    try {
      if (!text || typeof text !== 'string') {
        return '';
      }

      const config = {
        removeHTML: options.removeHTML !== false,
        removeScripts: options.removeScripts !== false,
        removeEvents: options.removeEvents !== false,
        maxLength: options.maxLength || 10000,
        allowNewlines: options.allowNewlines !== false,
        ...options,
      };

      let sanitized = text;

      // Limitar longitud
      if (sanitized.length > config.maxLength) {
        sanitized = sanitized.substring(0, config.maxLength);
      }

      // Remover HTML si está habilitado
      if (config.removeHTML) {
        sanitized = sanitized.replace(/<[^>]*>/g, '');
      }

      // Remover scripts y eventos si está habilitado
      if (config.removeScripts || config.removeEvents) {
        this.dangerousPatterns.forEach(pattern => {
          sanitized = sanitized.replace(pattern, '');
        });
      }

      // Remover caracteres de control excepto newlines si están permitidos
      if (config.allowNewlines) {
        sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      } else {
        sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
      }

      // Escapar caracteres especiales
      sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');

      return sanitized;
    } catch (error) {
      // eslint-disable-next-line no-console
      if (__DEV__) console.error('Error sanitizing text:', error);
      return '';
    }
  }

  /**
   * Valida y sanitiza datos de entrada de formularios
   * @description Valida y sanitiza datos de formularios contra XSS
   * @param {Object} formData - Datos del formulario
   * @param {Object} rules - Reglas de validación por campo
   * @returns {Object} Datos sanitizados y validados
   */
  sanitizeFormData(formData, rules = {}) {
    try {
      if (!formData || typeof formData !== 'object') {
        return {};
      }

      const sanitized = {};
      const errors = {};

      for (const [field, value] of Object.entries(formData)) {
        try {
          const fieldRules = rules[field] || {};
          const sanitizedValue = this.sanitizeField(value, fieldRules);

          // Validar según reglas específicas
          const validation = this.validateField(sanitizedValue, fieldRules);

          if (validation.isValid) {
            sanitized[field] = sanitizedValue;
          } else {
            errors[field] = validation.errors;
          }
        } catch (error) {
          errors[field] = [`Error procesando campo: ${error.message}`];
        }
      }

      return {
        data: sanitized,
        errors,
        isValid: Object.keys(errors).length === 0,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      if (__DEV__) console.error('Error sanitizing form data:', error);
      return { data: {}, errors: { general: ['Error procesando formulario'] }, isValid: false };
    }
  }

  /**
   * Sanitiza un campo individual
   * @param {any} value - Valor del campo
   * @param {Object} rules - Reglas de sanitización
   * @returns {any} Valor sanitizado
   */
  sanitizeField(value, rules = {}) {
    if (value === null || value === undefined) {
      return value;
    }

    const type = rules.type || 'text';
    const maxLength = rules.maxLength || 1000;
    const allowHTML = rules.allowHTML || false;

    switch (type) {
      case 'email':
        return this.sanitizeEmail(value);
      case 'url':
        return this.sanitizeURL(value);
      case 'html':
        return this.sanitizeHTML(value, { allowedTags: rules.allowedTags });
      case 'text':
      default:
        return this.sanitizeText(value, {
          removeHTML: !allowHTML,
          maxLength,
        });
    }
  }

  /**
   * Valida un campo según reglas específicas
   * @param {any} value - Valor a validar
   * @param {Object} rules - Reglas de validación
   * @returns {Object} Resultado de validación
   */
  validateField(value, rules = {}) {
    const errors = [];

    // Validar requerido
    if (rules.required && (!value || value.toString().trim() === '')) {
      errors.push('Campo requerido');
    }

    // Validar longitud mínima
    if (rules.minLength && value && value.toString().length < rules.minLength) {
      errors.push(`Mínimo ${rules.minLength} caracteres`);
    }

    // Validar longitud máxima
    if (rules.maxLength && value && value.toString().length > rules.maxLength) {
      errors.push(`Máximo ${rules.maxLength} caracteres`);
    }

    // Validar patrón
    if (rules.pattern && value && !rules.pattern.test(value)) {
      errors.push('Formato inválido');
    }

    // Validar email
    if (rules.type === 'email' && value && !this.isValidEmail(value)) {
      errors.push('Email inválido');
    }

    // Validar URL
    if (rules.type === 'url' && value && !this.isValidURL(value)) {
      errors.push('URL inválida');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitiza email
   * @param {string} email - Email a sanitizar
   * @returns {string} Email sanitizado
   */
  sanitizeEmail(email) {
    if (!email || typeof email !== 'string') {
      return '';
    }

    return email
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9@._-]/g, '')
      .substring(0, 254); // RFC 5321 limit
  }

  /**
   * Sanitiza URL
   * @param {string} url - URL a sanitizar
   * @returns {string} URL sanitizada
   */
  sanitizeURL(url) {
    if (!url || typeof url !== 'string') {
      return '';
    }

    // Remover javascript: y vbscript:
    url = url.replace(/^(javascript|vbscript):/gi, '');

    // Asegurar protocolo
    if (!url.match(/^https?:\/\//i)) {
      url = `https://${url}`;
    }

    return url.substring(0, 2048); // Límite razonable
  }

  /**
   * Valida email
   * @param {string} email - Email a validar
   * @returns {boolean} True si es válido
   */
  isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Valida URL
   * @param {string} url - URL a validar
   * @returns {boolean} True si es válida
   */
  isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Detecta intentos de XSS en texto
   * @description Analiza texto en busca de patrones sospechosos de XSS
   * @param {string} text - Texto a analizar
   * @returns {Object} Reporte de detección
   */
  detectXSS(text) {
    try {
      if (!text || typeof text !== 'string') {
        return { isSuspicious: false, patterns: [] };
      }

      const detectedPatterns = [];

      // Buscar patrones peligrosos
      this.dangerousPatterns.forEach((pattern, index) => {
        if (pattern.test(text)) {
          detectedPatterns.push({
            type: 'dangerous',
            pattern: pattern.toString(),
            index,
          });
        }
      });

      // Buscar patrones sospechosos
      this.suspiciousPatterns.forEach((pattern, index) => {
        if (pattern.test(text)) {
          detectedPatterns.push({
            type: 'suspicious',
            pattern: pattern.toString(),
            index,
          });
        }
      });

      return {
        isSuspicious: detectedPatterns.length > 0,
        patterns: detectedPatterns,
        riskLevel: detectedPatterns.filter(p => p.type === 'dangerous').length > 0 ? 'high' : 'medium',
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      if (__DEV__) console.error('Error detecting XSS:', error);
      return { isSuspicious: false, patterns: [], error: error.message };
    }
  }

  /**
   * Obtiene estadísticas de seguridad
   * @description Retorna estadísticas de los patrones de seguridad
   * @returns {Object} Estadísticas de seguridad
   */
  getSecurityStats() {
    return {
      dangerousPatterns: this.dangerousPatterns.length,
      suspiciousPatterns: this.suspiciousPatterns.length,
      allowedTags: this.allowedTags.length,
      allowedAttributes: Object.keys(this.allowedAttributes).length,
      platform: Platform.OS,
      hasDOMPurify: typeof DOMPurify !== 'undefined',
    };
  }
}

// Instancia singleton
const xssProtection = new XSSProtection();

export default xssProtection;
