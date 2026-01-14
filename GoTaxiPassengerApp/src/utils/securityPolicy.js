import { Platform } from 'react-native';

/**
 * Configuración de políticas de seguridad y validaciones
 * @description Implementa Content Security Policy y otras medidas de seguridad
 */
class SecurityPolicy {
  constructor() {
    this.cspConfig = {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'font-src': ["'self'", 'data:'],
      'connect-src': ["'self'", 'https:'],
      'media-src': ["'self'", 'data:'],
      'object-src': ["'none'"],
      'frame-src': ["'none'"],
      'worker-src': ["'self'"],
      'child-src': ["'none'"],
      'form-action': ["'self'"],
      'base-uri': ["'self'"],
      'manifest-src': ["'self'"],
    };

    this.allowedOrigins = [
      'https://api.gotaxi.com',
      'https://maps.googleapis.com',
      'https://maps.gstatic.com',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ];

    this.blockedPatterns = [
      /javascript:/gi,
      /vbscript:/gi,
      /data:text\/html/gi,
      /data:application\/javascript/gi,
      /blob:/gi,
      /file:/gi,
      /ftp:/gi,
    ];

    this.securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': this.generateCSPHeader(),
    };
  }

  /**
   * Genera el header de Content Security Policy
   * @description Crea el header CSP basado en la configuración
   * @returns {string} Header CSP
   */
  generateCSPHeader() {
    const directives = Object.entries(this.cspConfig)
      .map(([directive, sources]) => {
        if (Array.isArray(sources)) {
          return `${directive} ${sources.join(' ')}`;
        }
        return `${directive} ${sources}`;
      })
      .join('; ');

    return directives;
  }

  /**
   * Valida origen de URL
   * @description Verifica si una URL está permitida según la política de seguridad
   * @param {string} url - URL a validar
   * @returns {boolean} True si está permitida
   */
  isAllowedOrigin(url) {
    try {
      if (!url || typeof url !== 'string') {
        return false;
      }

      // Verificar patrones bloqueados
      for (const pattern of this.blockedPatterns) {
        if (pattern.test(url)) {
          return false;
        }
      }

      // En React Native, permitir URLs locales y de la app
      if (Platform.OS !== 'web') {
        if (url.startsWith('file://') || url.startsWith('content://')) {
          return true;
        }
      }

      // Verificar orígenes permitidos
      try {
        const urlObj = new URL(url);
        const origin = urlObj.origin;

        return this.allowedOrigins.some(allowedOrigin => {
          if (allowedOrigin.includes('*')) {
            const pattern = allowedOrigin.replace(/\*/g, '.*');
            return new RegExp(`^${pattern}$`).test(origin);
          }
          return origin === allowedOrigin;
        });
      } catch {
        return false;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      if (__DEV__) console.error('Error validating origin:', error);
      return false;
    }
  }

  /**
   * Sanitiza URL según política de seguridad
   * @description Limpia y valida URL según las reglas de seguridad
   * @param {string} url - URL a sanitizar
   * @returns {string|null} URL sanitizada o null si no es válida
   */
  sanitizeURL(url) {
    try {
      if (!url || typeof url !== 'string') {
        return null;
      }

      // Limpiar URL
      let cleanUrl = url.trim();

      // Remover caracteres peligrosos
      cleanUrl = cleanUrl.replace(/[\x00-\x1F\x7F]/g, '');

      // Verificar si está permitida
      if (!this.isAllowedOrigin(cleanUrl)) {
        return null;
      }

      // Asegurar protocolo HTTPS en producción
      if (Platform.OS === 'web' && !cleanUrl.match(/^https?:\/\//)) {
        cleanUrl = `https://${cleanUrl}`;
      }

      return cleanUrl;
    } catch (error) {
      console.error('Error sanitizing URL:', error);
      return null;
    }
  }

  /**
   * Valida y sanitiza datos de entrada
   * @description Aplica validaciones de seguridad a datos de entrada
   * @param {any} data - Datos a validar
   * @param {Object} options - Opciones de validación
   * @returns {Object} Resultado de validación
   */
  validateInput(data, options = {}) {
    try {
      const config = {
        maxLength: options.maxLength || 1000,
        allowHTML: options.allowHTML || false,
        allowScripts: options.allowScripts || false,
        allowEvents: options.allowEvents || false,
        ...options,
      };

      if (data === null || data === undefined) {
        return { isValid: true, data, warnings: [] };
      }

      const warnings = [];
      let processedData = data;

      // Validar longitud
      if (typeof processedData === 'string' && processedData.length > config.maxLength) {
        warnings.push(`Datos truncados: exceden ${config.maxLength} caracteres`);
        processedData = processedData.substring(0, config.maxLength);
      }

      // Validar HTML
      if (typeof processedData === 'string' && !config.allowHTML) {
        if (/<[^>]*>/g.test(processedData)) {
          warnings.push('HTML detectado en datos de texto');
          processedData = processedData.replace(/<[^>]*>/g, '');
        }
      }

      // Validar scripts
      if (!config.allowScripts) {
        const scriptPatterns = [
          /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
          /javascript:/gi,
          /vbscript:/gi,
        ];

        for (const pattern of scriptPatterns) {
          if (pattern.test(processedData)) {
            warnings.push('Scripts detectados y removidos');
            processedData = processedData.replace(pattern, '');
          }
        }
      }

      // Validar eventos
      if (!config.allowEvents) {
        const eventPattern = /\s+on\w+\s*=\s*["'][^"']*["']/gi;
        if (eventPattern.test(processedData)) {
          warnings.push('Eventos HTML detectados y removidos');
          processedData = processedData.replace(eventPattern, '');
        }
      }

      return {
        isValid: true,
        data: processedData,
        warnings,
        originalLength: typeof data === 'string' ? data.length : 0,
        processedLength: typeof processedData === 'string' ? processedData.length : 0,
      };
    } catch (error) {
      return {
        isValid: false,
        data: null,
        warnings: [`Error de validación: ${error.message}`],
        error: error.message,
      };
    }
  }

  /**
   * Configura headers de seguridad para requests
   * @description Genera headers de seguridad para peticiones HTTP
   * @param {Object} customHeaders - Headers personalizados
   * @returns {Object} Headers de seguridad
   */
  getSecurityHeaders(customHeaders = {}) {
    return {
      ...this.securityHeaders,
      ...customHeaders,
    };
  }

  /**
   * Valida configuración de seguridad
   * @description Verifica que la configuración de seguridad sea correcta
   * @returns {Object} Resultado de validación
   */
  validateSecurityConfig() {
    const errors = [];
    const warnings = [];

    // Validar CSP
    if (!this.cspConfig['default-src'] || this.cspConfig['default-src'].length === 0) {
      errors.push('CSP default-src no configurado');
    }

    // Validar orígenes permitidos
    if (this.allowedOrigins.length === 0) {
      warnings.push('No hay orígenes permitidos configurados');
    }

    // Validar patrones bloqueados
    if (this.blockedPatterns.length === 0) {
      warnings.push('No hay patrones bloqueados configurados');
    }

    // Validar headers de seguridad
    const requiredHeaders = ['X-Content-Type-Options', 'X-Frame-Options', 'X-XSS-Protection'];
    for (const header of requiredHeaders) {
      if (!this.securityHeaders[header]) {
        errors.push(`Header de seguridad faltante: ${header}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: this.calculateSecurityScore(errors, warnings),
    };
  }

  /**
   * Calcula puntuación de seguridad
   * @description Calcula una puntuación basada en la configuración de seguridad
   * @param {Array} errors - Errores encontrados
   * @param {Array} warnings - Advertencias encontradas
   * @returns {number} Puntuación de 0 a 100
   */
  calculateSecurityScore(errors, warnings) {
    let score = 100;

    // Penalizar errores
    score -= errors.length * 20;

    // Penalizar advertencias
    score -= warnings.length * 5;

    // Bonificar por configuraciones seguras
    if (this.cspConfig['object-src'].includes("'none'")) score += 5;
    if (this.cspConfig['frame-src'].includes("'none'")) score += 5;
    if (this.securityHeaders['X-Frame-Options'] === 'DENY') score += 5;
    if (this.securityHeaders['Strict-Transport-Security']) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Obtiene estadísticas de seguridad
   * @description Retorna estadísticas de la configuración de seguridad
   * @returns {Object} Estadísticas de seguridad
   */
  getSecurityStats() {
    const configValidation = this.validateSecurityConfig();

    return {
      cspDirectives: Object.keys(this.cspConfig).length,
      allowedOrigins: this.allowedOrigins.length,
      blockedPatterns: this.blockedPatterns.length,
      securityHeaders: Object.keys(this.securityHeaders).length,
      platform: Platform.OS,
      configValid: configValidation.isValid,
      securityScore: configValidation.score,
      errors: configValidation.errors.length,
      warnings: configValidation.warnings.length,
    };
  }

  /**
   * Actualiza configuración de seguridad
   * @description Permite actualizar la configuración de seguridad
   * @param {Object} newConfig - Nueva configuración
   * @returns {boolean} True si se actualizó correctamente
   */
  updateSecurityConfig(newConfig) {
    try {
      if (newConfig.cspConfig) {
        this.cspConfig = { ...this.cspConfig, ...newConfig.cspConfig };
      }

      if (newConfig.allowedOrigins) {
        this.allowedOrigins = [...this.allowedOrigins, ...newConfig.allowedOrigins];
      }

      if (newConfig.blockedPatterns) {
        this.blockedPatterns = [...this.blockedPatterns, ...newConfig.blockedPatterns];
      }

      if (newConfig.securityHeaders) {
        this.securityHeaders = { ...this.securityHeaders, ...newConfig.securityHeaders };
      }

      // Regenerar CSP header
      this.securityHeaders['Content-Security-Policy'] = this.generateCSPHeader();

      return true;
    } catch (error) {
      console.error('Error updating security config:', error);
      return false;
    }
  }

  /**
   * Genera reporte de seguridad
   * @description Crea un reporte completo de la configuración de seguridad
   * @returns {Object} Reporte de seguridad
   */
  generateSecurityReport() {
    const stats = this.getSecurityStats();
    const configValidation = this.validateSecurityConfig();

    return {
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      configuration: {
        csp: this.cspConfig,
        allowedOrigins: this.allowedOrigins,
        blockedPatterns: this.blockedPatterns.map(p => p.toString()),
        securityHeaders: this.securityHeaders,
      },
      validation: configValidation,
      statistics: stats,
      recommendations: this.generateRecommendations(configValidation),
    };
  }

  /**
   * Genera recomendaciones de seguridad
   * @description Crea recomendaciones basadas en la validación
   * @param {Object} validation - Resultado de validación
   * @returns {Array} Lista de recomendaciones
   */
  generateRecommendations(validation) {
    const recommendations = [];

    if (validation.errors.length > 0) {
      recommendations.push('Corregir errores de configuración de seguridad');
    }

    if (validation.warnings.length > 0) {
      recommendations.push('Revisar advertencias de configuración');
    }

    if (validation.score < 80) {
      recommendations.push('Mejorar puntuación de seguridad general');
    }

    if (!this.cspConfig['upgrade-insecure-requests']) {
      recommendations.push('Considerar agregar upgrade-insecure-requests a CSP');
    }

    if (!this.securityHeaders['Content-Security-Policy-Report-Only']) {
      recommendations.push('Considerar implementar CSP en modo report-only para testing');
    }

    return recommendations;
  }
}

// Instancia singleton
const securityPolicy = new SecurityPolicy();

export default securityPolicy;
