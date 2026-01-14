/**
 * Servicio de Ubicación - Capa de Servicios
 * Contiene la lógica de negocio para manejo de ubicación con debouncing y precisión mejorada
 */
import secureStorage from '../utils/secureStorage';

class LocationService {
  constructor() {
    this.currentLocation = null;
    this.watchId = null;
    this.secureStorage = secureStorage;
    this.locationCache = new Map();
    this.debounceTimers = new Map();
    this.trackingCallbacks = new Set();
    this.isTracking = false;
    this.lastKnownLocation = null;
    this.locationHistory = [];
    this.maxHistorySize = 50;
    this.debounceDelay = 1000; // 1 segundo
    this.accuracyThreshold = 100; // metros
    this.cacheTimeout = 30000; // 30 segundos
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  /**
   * Obtener ubicación actual con debouncing y caché
   * @description Obtiene la ubicación actual del usuario con estrategias de caché y debouncing
   * @param {Object} options - Opciones de configuración
   * @param {boolean} options.useCache - Usar caché si está disponible (default: true)
   * @param {boolean} options.forceRefresh - Forzar actualización ignorando caché (default: false)
   * @param {boolean} options.highAccuracy - Usar alta precisión (default: true)
   * @param {number} options.timeout - Timeout en milisegundos (default: 10000)
   * @param {number} options.maximumAge - Edad máxima del caché en milisegundos (default: 30000)
   * @returns {Promise<Object>} Resultado de la operación
   * @returns {boolean} result.success - Indica si la operación fue exitosa
   * @returns {Object} result.data - Datos de ubicación si es exitoso
   * @returns {number} result.data.latitude - Latitud
   * @returns {number} result.data.longitude - Longitud
   * @returns {number} result.data.accuracy - Precisión en metros
   * @returns {number} result.data.timestamp - Timestamp de la ubicación
   * @returns {string} result.error - Mensaje de error si falla
   * @returns {string} result.code - Código de error específico
   * @example
   * const result = await locationService.getCurrentLocation({
   *   useCache: true,
   *   highAccuracy: true,
   *   timeout: 15000
   * });
   * if (result.success) {
   *   console.log('Ubicación:', result.data.latitude, result.data.longitude);
   * }
   */
  async getCurrentLocation(options = {}) {
    const {
      useCache = true,
      forceRefresh = false,
      highAccuracy = true,
      timeout = 10000,
      maximumAge = 30000,
    } = options;

    try {
      // Verificar permisos
      const hasPermission = await this.checkLocationPermission();
      if (!hasPermission) {
        return {
          success: false,
          error: 'Permisos de ubicación no concedidos',
          code: 'PERMISSION_DENIED',
        };
      }

      // Verificar caché si está habilitado
      if (useCache && !forceRefresh) {
        const cachedLocation = await this.getCachedLocation();
        if (cachedLocation) {
          return {
            success: true,
            data: cachedLocation,
            fromCache: true,
          };
        }
      }

      // Obtener ubicación con retry logic
      const location = await this.getLocationWithRetry({
        highAccuracy,
        timeout,
        maximumAge,
      });

      if (location) {
        // Validar precisión
        if (location.accuracy > this.accuracyThreshold) {
          return {
            success: false,
            error: 'Precisión de ubicación insuficiente',
            code: 'LOW_ACCURACY',
            data: location,
          };
        }

        // Actualizar estado
        this.currentLocation = location;
        this.lastKnownLocation = location;

        // Agregar al historial
        this.addToHistory(location);

        // Guardar en caché
        await this.cacheLocation(location);

        return {
          success: true,
          data: location,
          fromCache: false,
        };
      }

      return {
        success: false,
        error: 'No se pudo obtener la ubicación',
        code: 'LOCATION_UNAVAILABLE',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener ubicación',
        code: 'LOCATION_ERROR',
      };
    }
  }

  /**
   * Iniciar seguimiento de ubicación con debouncing
   * @description Inicia el seguimiento continuo de ubicación con debouncing para optimizar rendimiento
   * @param {Function} callback - Función callback que se ejecuta en cada actualización de ubicación
   * @param {Object} options - Opciones de configuración
   * @param {boolean} options.highAccuracy - Usar alta precisión (default: true)
   * @param {number} options.timeout - Timeout en milisegundos (default: 10000)
   * @param {number} options.maximumAge - Edad máxima en milisegundos (default: 1000)
   * @param {number} options.debounceDelay - Delay de debouncing en milisegundos (default: 1000)
   * @param {number} options.accuracyThreshold - Umbral de precisión en metros (default: 100)
   * @returns {Promise<Object>} Resultado de la operación
   * @returns {boolean} result.success - Indica si el seguimiento se inició correctamente
   * @returns {string} result.message - Mensaje de confirmación
   * @returns {number} result.watchId - ID del watcher para detener el seguimiento
   * @returns {string} result.error - Mensaje de error si falla
   * @returns {string} result.code - Código de error específico
   * @example
   * const result = await locationService.startLocationTracking(
   *   (location) => console.log('Nueva ubicación:', location),
   *   { highAccuracy: true, debounceDelay: 2000 }
   * );
   */
  async startLocationTracking(callback, options = {}) {
    const {
      highAccuracy = true,
      timeout = 10000,
      maximumAge = 1000,
      debounceDelay = this.debounceDelay,
      accuracyThreshold = this.accuracyThreshold,
    } = options;

    try {
      const hasPermission = await this.checkLocationPermission();
      if (!hasPermission) {
        return {
          success: false,
          error: 'Permisos de ubicación no concedidos',
          code: 'PERMISSION_DENIED',
        };
      }

      // Si ya está tracking, detener primero
      if (this.isTracking) {
        this.stopLocationTracking();
      }

      // Agregar callback a la lista
      if (callback) {
        this.trackingCallbacks.add(callback);
      }

      // Configurar opciones de seguimiento
      const watchOptions = {
        enableHighAccuracy: highAccuracy,
        timeout,
        maximumAge,
      };

      // Iniciar seguimiento con debouncing
      this.watchId = navigator.geolocation.watchPosition(
        position => {
          this.handleLocationUpdate(position, {
            debounceDelay,
            accuracyThreshold,
          });
        },
        error => {
          this.handleLocationError(error);
        },
        watchOptions,
      );

      this.isTracking = true;

      return {
        success: true,
        message: 'Seguimiento de ubicación iniciado',
        watchId: this.watchId,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al iniciar seguimiento',
        code: 'TRACKING_ERROR',
      };
    }
  }

  /**
   * Detener seguimiento de ubicación
   * @description Detiene el seguimiento activo de ubicación y limpia los recursos
   * @returns {Object} Resultado de la operación
   * @returns {boolean} result.success - Indica si el seguimiento se detuvo correctamente
   * @returns {string} result.message - Mensaje de confirmación
   * @returns {string} result.error - Mensaje de error si no hay seguimiento activo
   * @returns {string} result.code - Código de error específico
   * @example
   * const result = locationService.stopLocationTracking();
   * if (result.success) {
   *   console.log('Seguimiento detenido');
   * }
   */
  stopLocationTracking() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking = false;
      this.trackingCallbacks.clear();

      // Limpiar timers de debounce
      this.debounceTimers.forEach(timer => clearTimeout(timer));
      this.debounceTimers.clear();

      return {
        success: true,
        message: 'Seguimiento de ubicación detenido',
      };
    }
    return {
      success: false,
      error: 'No hay seguimiento activo',
      code: 'NO_TRACKING',
    };
  }

  /**
   * Calcular distancia entre dos puntos
   * @description Calcula la distancia en kilómetros entre dos coordenadas geográficas usando la fórmula de Haversine
   * @param {Object} point1 - Primer punto
   * @param {number} point1.latitude - Latitud del primer punto
   * @param {number} point1.longitude - Longitud del primer punto
   * @param {Object} point2 - Segundo punto
   * @param {number} point2.latitude - Latitud del segundo punto
   * @param {number} point2.longitude - Longitud del segundo punto
   * @returns {number} Distancia en kilómetros
   * @example
   * const distance = locationService.calculateDistance(
   *   { latitude: -34.6037, longitude: -58.3816 },
   *   { latitude: -34.6118, longitude: -58.3960 }
   * );
   * console.log('Distancia:', distance, 'km');
   */
  calculateDistance(point1, point2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(point2.latitude - point1.latitude);
    const dLon = this.deg2rad(point2.longitude - point1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(point1.latitude)) *
        Math.cos(this.deg2rad(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distancia en km
    return distance;
  }

  /**
   * Calcular tiempo estimado de viaje
   * @description Calcula el tiempo estimado de viaje basado en la distancia y velocidad promedio
   * @param {number} distance - Distancia en kilómetros
   * @param {number} averageSpeed - Velocidad promedio en km/h (default: 30)
   * @returns {number} Tiempo estimado en minutos
   * @example
   * const time = locationService.calculateEstimatedTime(5.2, 25);
   * console.log('Tiempo estimado:', time, 'minutos');
   */
  calculateEstimatedTime(distance, averageSpeed = 30) {
    // averageSpeed en km/h
    const timeInHours = distance / averageSpeed;
    const timeInMinutes = timeInHours * 60;
    return Math.round(timeInMinutes);
  }

  /**
   * Obtener dirección desde coordenadas
   * @description Convierte coordenadas geográficas en una dirección legible (geocodificación inversa)
   * @param {number} latitude - Latitud
   * @param {number} longitude - Longitud
   * @returns {Promise<Object>} Resultado de la operación
   * @returns {boolean} result.success - Indica si la operación fue exitosa
   * @returns {Object} result.data - Datos de la dirección
   * @returns {string} result.data.address - Dirección formateada
   * @returns {number} result.data.latitude - Latitud original
   * @returns {number} result.data.longitude - Longitud original
   * @returns {string} result.error - Mensaje de error si falla
   * @example
   * const result = await locationService.getAddressFromCoordinates(-34.6037, -58.3816);
   * if (result.success) {
   *   console.log('Dirección:', result.data.address);
   * }
   */
  async getAddressFromCoordinates(latitude, longitude) {
    try {
      // En una implementación real, esto se haría con una API de geocodificación
      // como Google Maps Geocoding API o similar
      // Simulación de respuesta
      const address = `Dirección aproximada: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      return {
        success: true,
        data: {
          address,
          latitude,
          longitude,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al obtener dirección',
      };
    }
  }

  /**
   * Verificar permisos de ubicación
   * @description Verifica si la aplicación tiene permisos para acceder a la ubicación
   * @returns {Promise<boolean>} True si tiene permisos, false en caso contrario
   * @example
   * const hasPermission = await locationService.checkLocationPermission();
   * if (!hasPermission) {
   *   console.log('Solicitar permisos de ubicación');
   * }
   */
  async checkLocationPermission() {
    // En una implementación real, esto se haría con la API de permisos
    // Por ahora simulamos que siempre tenemos permisos
    return true;
  }

  /**
   * Obtener ubicación del dispositivo
   * @description Obtiene la ubicación actual directamente del dispositivo GPS
   * @returns {Promise<Object>} Datos de ubicación del dispositivo
   * @returns {number} result.latitude - Latitud
   * @returns {number} result.longitude - Longitud
   * @returns {number} result.accuracy - Precisión en metros
   * @returns {number} result.timestamp - Timestamp de la ubicación
   * @throws {Error} Error si no se puede obtener la ubicación
   * @example
   * try {
   *   const location = await locationService.getLocationFromDevice();
   *   console.log('Ubicación del dispositivo:', location);
   * } catch (error) {
   *   console.error('Error:', error.message);
   * }
   */
  async getLocationFromDevice() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position => {
          const location = this.formatLocationData(position);
          resolve(location);
        },
        error => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      );
    });
  }

  /**
   * Formatear datos de ubicación
   * @description Convierte los datos de posición del navegador en un formato estándar
   * @param {Object} position - Objeto de posición del navegador
   * @param {Object} position.coords - Coordenadas de la posición
   * @param {number} position.coords.latitude - Latitud
   * @param {number} position.coords.longitude - Longitud
   * @param {number} position.coords.accuracy - Precisión en metros
   * @param {number} position.timestamp - Timestamp de la posición
   * @returns {Object} Datos de ubicación formateados
   * @returns {number} result.latitude - Latitud
   * @returns {number} result.longitude - Longitud
   * @returns {number} result.accuracy - Precisión en metros
   * @returns {number} result.timestamp - Timestamp de la ubicación
   * @example
   * const formatted = locationService.formatLocationData(position);
   * console.log('Datos formateados:', formatted);
   */
  formatLocationData(position) {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    };
  }

  /**
   * Convertir grados a radianes
   * @description Convierte un ángulo de grados a radianes para cálculos matemáticos
   * @param {number} deg - Ángulo en grados
   * @returns {number} Ángulo en radianes
   * @example
   * const radians = locationService.deg2rad(90);
   * console.log('90 grados =', radians, 'radianes');
   */
  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  /**
   * Manejar actualización de ubicación con debouncing
   */
  handleLocationUpdate(position, options = {}) {
    const { debounceDelay, accuracyThreshold } = options;
    const location = this.formatLocationData(position);

    // Verificar precisión
    if (location.accuracy > accuracyThreshold) {
      return;
    }

    // Verificar si la ubicación es significativamente diferente
    if (this.lastKnownLocation) {
      const distance = this.calculateDistance(this.lastKnownLocation, location);
      if (distance < 10) { // Menos de 10 metros de diferencia
        return;
      }
    }

    // Debouncing: cancelar timer anterior si existe
    const timerKey = 'location_update';
    if (this.debounceTimers.has(timerKey)) {
      clearTimeout(this.debounceTimers.get(timerKey));
    }

    // Crear nuevo timer
    const timer = setTimeout(() => {
      this.processLocationUpdate(location);
      this.debounceTimers.delete(timerKey);
    }, debounceDelay);

    this.debounceTimers.set(timerKey, timer);
  }

  /**
   * Procesar actualización de ubicación
   */
  processLocationUpdate(location) {
    // Actualizar estado
    this.currentLocation = location;
    this.lastKnownLocation = location;

    // Agregar al historial
    this.addToHistory(location);

    // Guardar en caché
    this.cacheLocation(location);

    // Notificar callbacks
    this.trackingCallbacks.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        // eslint-disable-next-line no-console
        if (__DEV__) console.error('Error en callback de ubicación:', error);
      }
    });
  }

  /**
   * Manejar errores de ubicación
   */
  handleLocationError(error) {
    const errorMessages = {
      1: 'Permisos de ubicación denegados',
      2: 'Ubicación no disponible',
      3: 'Timeout al obtener ubicación',
    };

    const errorMessage = errorMessages[error.code] || 'Error desconocido de ubicación';

    // Notificar callbacks del error
    this.trackingCallbacks.forEach(callback => {
      try {
        if (callback.onError) {
          callback.onError({
            code: error.code,
            message: errorMessage,
          });
        }
      } catch (callbackError) {
        // eslint-disable-next-line no-console
        if (__DEV__) console.error('Error en callback de error:', callbackError);
      }
    });
  }

  /**
   * Obtener ubicación con retry logic
   */
  async getLocationWithRetry(options = {}) {
    const { highAccuracy = true, timeout = 10000, maximumAge = 30000 } = options;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const location = await this.getLocationFromDeviceWithOptions({
          enableHighAccuracy: highAccuracy,
          timeout,
          maximumAge,
        });

        if (location) {
          return location;
        }
      } catch (error) {
        if (attempt === this.retryAttempts) {
          throw error;
        }

        // Esperar antes del siguiente intento
        await this.delay(this.retryDelay * attempt);
      }
    }

    return null;
  }

  /**
   * Obtener ubicación del dispositivo con opciones mejoradas
   */
  async getLocationFromDeviceWithOptions(options = {}) {
    const {
      enableHighAccuracy = true,
      timeout = 10000,
      maximumAge = 30000,
    } = options;

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position => {
          const location = this.formatLocationData(position);
          resolve(location);
        },
        error => {
          reject(error);
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        },
      );
    });
  }

  /**
   * Obtener ubicación desde caché
   */
  async getCachedLocation() {
    try {
      const cached = await this.secureStorage.getItem('last_location');
      if (cached) {
        const location = JSON.parse(cached);
        const now = Date.now();

        // Verificar si el caché no ha expirado
        if (now - location.timestamp < this.cacheTimeout) {
          return location;
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      if (__DEV__) console.error('Error al obtener ubicación del caché:', error);
    }

    return null;
  }

  /**
   * Guardar ubicación en caché
   */
  async cacheLocation(location) {
    try {
      const locationWithTimestamp = {
        ...location,
        cachedAt: Date.now(),
      };

      await this.secureStorage.setItem('last_location', JSON.stringify(locationWithTimestamp));

      // También guardar en caché en memoria
      this.locationCache.set('current', locationWithTimestamp);
    } catch (error) {
      // eslint-disable-next-line no-console
      if (__DEV__) console.error('Error al guardar ubicación en caché:', error);
    }
  }

  /**
   * Agregar ubicación al historial
   */
  addToHistory(location) {
    const locationWithTimestamp = {
      ...location,
      timestamp: Date.now(),
    };

    this.locationHistory.unshift(locationWithTimestamp);

    // Mantener solo el número máximo de ubicaciones
    if (this.locationHistory.length > this.maxHistorySize) {
      this.locationHistory = this.locationHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Obtener historial de ubicaciones
   */
  getLocationHistory(limit = 10) {
    return this.locationHistory.slice(0, limit);
  }

  /**
   * Limpiar historial de ubicaciones
   */
  clearLocationHistory() {
    this.locationHistory = [];
  }

  /**
   * Obtener última ubicación conocida
   */
  getLastKnownLocation() {
    return this.lastKnownLocation;
  }

  /**
   * Verificar si hay tracking activo
   */
  isLocationTracking() {
    return this.isTracking;
  }

  /**
   * Obtener estadísticas de ubicación
   */
  getLocationStats() {
    return {
      isTracking: this.isTracking,
      hasCurrentLocation: !!this.currentLocation,
      hasLastKnownLocation: !!this.lastKnownLocation,
      historySize: this.locationHistory.length,
      cacheSize: this.locationCache.size,
      activeCallbacks: this.trackingCallbacks.size,
    };
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obtener ubicación con precisión mejorada
   */
  async getHighAccuracyLocation(options = {}) {
    const {
      timeout = 15000,
      maximumAge = 0,
      attempts = 3,
    } = options;

    for (let i = 0; i < attempts; i++) {
      try {
        const result = await this.getCurrentLocation({
          useCache: false,
          forceRefresh: true,
          highAccuracy: true,
          timeout,
          maximumAge,
        });

        if (result.success && result.data.accuracy <= 50) {
          return result;
        }

        if (i < attempts - 1) {
          await this.delay(2000);
        }
      } catch (error) {
        if (i === attempts - 1) {
          throw error;
        }
        await this.delay(2000);
      }
    }

    return {
      success: false,
      error: 'No se pudo obtener ubicación de alta precisión',
      code: 'HIGH_ACCURACY_FAILED',
    };
  }

  /**
   * Calcular velocidad entre dos ubicaciones
   */
  calculateSpeed(location1, location2) {
    if (!location1 || !location2) return 0;

    const distance = this.calculateDistance(location1, location2);
    const timeDiff = (location2.timestamp - location1.timestamp) / 1000; // en segundos

    if (timeDiff <= 0) return 0;

    const speedKmh = (distance / timeDiff) * 3600; // km/h
    return Math.round(speedKmh * 100) / 100; // Redondear a 2 decimales
  }

  /**
   * Detectar si el usuario está en movimiento
   */
  isMoving(threshold = 5) {
    if (this.locationHistory.length < 2) return false;

    const recent = this.locationHistory.slice(0, 2);
    const speed = this.calculateSpeed(recent[1], recent[0]);

    return speed > threshold;
  }
}

export default LocationService;
