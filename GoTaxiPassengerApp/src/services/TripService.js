/**
 * Servicio de Viajes - Capa de Servicios
 * Contiene la lógica de negocio para viajes con funcionalidades offline-first
 */
import TripRepository from '../infrastructure/repositories/TripRepository';
import Trip from '../domain/entities/Trip';
import secureStorage from '../utils/secureStorage';

class TripService {
  constructor() {
    this.tripRepository = new TripRepository();
    this.secureStorage = secureStorage;
    this.offlineQueue = [];
    this.isOnline = true;
    this.maxRetries = 3;
    this.retryDelay = 1000;
    this.syncInterval = 30000; // 30 segundos

    // Inicializar detección de conectividad
    this.initializeConnectivityDetection();
    this.startSyncProcess();
  }

  /**
   * Solicitar un nuevo viaje
   * @description Crea una nueva solicitud de viaje con validaciones y estrategia offline-first
   * @param {Object} origin - Punto de origen del viaje
   * @param {string} origin.address - Dirección de origen
   * @param {number} origin.latitude - Latitud del origen
   * @param {number} origin.longitude - Longitud del origen
   * @param {Object} destination - Punto de destino del viaje
   * @param {string} destination.address - Dirección de destino
   * @param {number} destination.latitude - Latitud del destino
   * @param {number} destination.longitude - Longitud del destino
   * @param {string} paymentMethod - Método de pago seleccionado
   * @returns {Promise<Object>} Resultado de la solicitud
   * @returns {boolean} result.success - Indica si la operación fue exitosa
   * @returns {Object} result.data - Datos del viaje creado si fue exitoso
   * @returns {string} result.message - Mensaje de confirmación
   * @returns {string} result.error - Mensaje de error si la operación falló
   * @returns {boolean} result.offline - Indica si la operación se guardó para sincronizar offline
   * @example
   * const result = await tripService.requestTrip(
   *   { address: 'Av. Corrientes 123', latitude: -34.6037, longitude: -58.3816 },
   *   { address: 'Plaza de Mayo', latitude: -34.6083, longitude: -58.3712 },
   *   'credit_card'
   * );
   * if (result.success) {
   *   console.log('Viaje solicitado:', result.data.id);
   * }
   */
  async requestTrip(origin, destination, paymentMethod) {
    try {
      // Validar datos de entrada
      const validation = this.validateTripRequest(origin, destination, paymentMethod);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          code: 'VALIDATION_ERROR',
          details: validation.errors,
        };
      }

      // Calcular tarifa estimada
      const estimatedFare = this.calculateEstimatedFare(origin, destination);

      // Crear entidad de viaje
      const tripData = {
        origin,
        destination,
        paymentMethod,
        fare: estimatedFare,
        status: 'requested',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const trip = new Trip(tripData);

      // Validar la entidad
      const tripValidation = trip.validate();
      if (!tripValidation.isValid) {
        return {
          success: false,
          error: tripValidation.errors.join(', '),
          code: 'TRIP_VALIDATION_ERROR',
          details: tripValidation.errors,
        };
      }

      // Si estamos offline, agregar a la cola
      if (!this.isOnline) {
        this.addToOfflineQueue({
          type: 'requestTrip',
          data: { origin, destination, paymentMethod },
        });

        return {
          success: true,
          message: 'Solicitud guardada para sincronizar cuando haya conexión',
          data: trip,
          offline: true,
        };
      }

      // Llamar al repositorio
      const result = await this.tripRepository.requestRide(origin, destination, paymentMethod);

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Error al solicitar viaje',
          code: result.code || 'REQUEST_ERROR',
        };
      }

      return {
        success: true,
        data: result.data,
        message: 'Viaje solicitado exitosamente',
      };
    } catch (error) {
      // Si hay error de red, intentar guardar offline
      if (!this.isOnline || error.code === 'NETWORK_ERROR') {
        this.addToOfflineQueue({
          type: 'requestTrip',
          data: { origin, destination, paymentMethod },
        });

        return {
          success: true,
          message: 'Solicitud guardada para sincronizar cuando haya conexión',
          data: null,
          offline: true,
        };
      }

      return {
        success: false,
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
      };
    }
  }

  /**
   * Obtener viaje por ID
   * @description Recupera un viaje específico por su identificador único
   * @param {string} tripId - Identificador único del viaje
   * @returns {Promise<Object>} Resultado de la operación
   * @returns {boolean} result.success - Indica si la operación fue exitosa
   * @returns {Object} result.data - Datos del viaje si fue encontrado
   * @returns {string} result.error - Mensaje de error si la operación falló
   * @example
   * const result = await tripService.getTripById('trip_123');
   * if (result.success) {
   *   console.log('Viaje encontrado:', result.data.status);
   * }
   */
  async getTripById(tripId) {
    if (!tripId) {
      return {
        success: false,
        error: 'ID de viaje requerido',
      };
    }
    const result = await this.tripRepository.getTripById(tripId);
    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    }
    return result;
  }

  /**
   * Cancelar viaje
   * @description Cancela un viaje existente con validaciones de estado y soporte offline
   * @param {string} tripId - Identificador único del viaje a cancelar
   * @returns {Promise<Object>} Resultado de la cancelación
   * @returns {boolean} result.success - Indica si la operación fue exitosa
   * @returns {Object} result.data - Datos del viaje cancelado si fue exitoso
   * @returns {string} result.message - Mensaje de confirmación
   * @returns {string} result.error - Mensaje de error si la operación falló
   * @returns {boolean} result.offline - Indica si la operación se guardó para sincronizar offline
   * @example
   * const result = await tripService.cancelTrip('trip_123');
   * if (result.success) {
   *   console.log('Viaje cancelado:', result.message);
   * }
   */
  async cancelTrip(tripId) {
    if (!tripId) {
      return {
        success: false,
        error: 'ID de viaje requerido',
      };
    }

    // Obtener el viaje primero para validar
    const tripResult = await this.getTripById(tripId);
    if (!tripResult.success) {
      return tripResult;
    }
    const trip = tripResult.data;

    // Verificar si puede ser cancelado
    if (!trip.canBeCancelled()) {
      return {
        success: false,
        error: 'Este viaje no puede ser cancelado en su estado actual',
      };
    }

    // Si estamos offline, agregar a la cola
    if (!this.isOnline) {
      this.addToOfflineQueue({
        type: 'cancelTrip',
        data: { tripId },
      });

      return {
        success: true,
        message: 'Cancelación guardada para sincronizar cuando haya conexión',
        offline: true,
      };
    }

    const result = await this.tripRepository.cancelTrip(tripId);
    if (result.success) {
      return {
        success: true,
        data: result.data,
        message: 'Viaje cancelado exitosamente',
      };
    }
    return result;
  }

  /**
   * Pagar viaje
   * @description Procesa el pago de un viaje con validaciones y soporte offline
   * @param {string} tripId - Identificador único del viaje a pagar
   * @param {string} paymentMethod - Método de pago seleccionado
   * @returns {Promise<Object>} Resultado del pago
   * @returns {boolean} result.success - Indica si la operación fue exitosa
   * @returns {Object} result.data - Datos del pago procesado si fue exitoso
   * @returns {string} result.message - Mensaje de confirmación
   * @returns {string} result.error - Mensaje de error si la operación falló
   * @returns {boolean} result.offline - Indica si la operación se guardó para sincronizar offline
   * @example
   * const result = await tripService.payTrip('trip_123', 'credit_card');
   * if (result.success) {
   *   console.log('Pago procesado:', result.message);
   * }
   */
  async payTrip(tripId, paymentMethod) {
    if (!tripId) {
      return {
        success: false,
        error: 'ID de viaje requerido',
      };
    }
    if (!paymentMethod) {
      return {
        success: false,
        error: 'Método de pago requerido',
      };
    }

    // Si estamos offline, agregar a la cola
    if (!this.isOnline) {
      this.addToOfflineQueue({
        type: 'payTrip',
        data: { tripId, paymentMethod },
      });

      return {
        success: true,
        message: 'Pago guardado para sincronizar cuando haya conexión',
        offline: true,
      };
    }

    const result = await this.tripRepository.payTrip(tripId, paymentMethod);
    if (result.success) {
      return {
        success: true,
        data: result.data,
        message: 'Pago procesado exitosamente',
      };
    }
    return result;
  }

  /**
   * Calificar viaje
   * @description Permite calificar un viaje completado con comentarios opcionales
   * @param {string} tripId - Identificador único del viaje a calificar
   * @param {number} rating - Calificación del 1 al 5
   * @param {string} [comment=''] - Comentario opcional sobre el viaje
   * @returns {Promise<Object>} Resultado de la calificación
   * @returns {boolean} result.success - Indica si la operación fue exitosa
   * @returns {Object} result.data - Datos de la calificación guardada si fue exitoso
   * @returns {string} result.message - Mensaje de confirmación
   * @returns {string} result.error - Mensaje de error si la operación falló
   * @returns {boolean} result.offline - Indica si la operación se guardó para sincronizar offline
   * @example
   * const result = await tripService.rateTrip('trip_123', 5, 'Excelente servicio');
   * if (result.success) {
   *   console.log('Viaje calificado:', result.message);
   * }
   */
  async rateTrip(tripId, rating, comment = '') {
    if (!tripId) {
      return {
        success: false,
        error: 'ID de viaje requerido',
      };
    }
    if (!rating || rating < 1 || rating > 5) {
      return {
        success: false,
        error: 'La calificación debe estar entre 1 y 5',
      };
    }

    // Obtener el viaje primero para validar
    const tripResult = await this.getTripById(tripId);
    if (!tripResult.success) {
      return tripResult;
    }
    const trip = tripResult.data;

    // Verificar si puede ser calificado
    if (!trip.canBeRated()) {
      return {
        success: false,
        error: 'Este viaje no puede ser calificado en su estado actual',
      };
    }

    // Si estamos offline, agregar a la cola
    if (!this.isOnline) {
      this.addToOfflineQueue({
        type: 'rateTrip',
        data: { tripId, rating, comment },
      });

      return {
        success: true,
        message: 'Calificación guardada para sincronizar cuando haya conexión',
        offline: true,
      };
    }

    const result = await this.tripRepository.rateTrip(tripId, rating, comment);
    if (result.success) {
      return {
        success: true,
        data: result.data,
        message: 'Viaje calificado exitosamente',
      };
    }
    return result;
  }

  /**
   * Obtener viajes del usuario
   * @description Recupera todos los viajes del usuario autenticado
   * @returns {Promise<Object>} Resultado de la operación
   * @returns {boolean} result.success - Indica si la operación fue exitosa
   * @returns {Array<Object>} result.data - Lista de viajes del usuario
   * @returns {string} result.error - Mensaje de error si la operación falló
   * @example
   * const result = await tripService.getUserTrips();
   * if (result.success) {
   *   console.log('Viajes encontrados:', result.data.length);
   * }
   */
  async getUserTrips() {
    const result = await this.tripRepository.getUserTrips();
    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    }
    return result;
  }

  /**
   * Obtener viaje activo
   * @description Recupera el viaje actualmente activo del usuario
   * @returns {Promise<Object>} Resultado de la operación
   * @returns {boolean} result.success - Indica si la operación fue exitosa
   * @returns {Object|null} result.data - Datos del viaje activo o null si no hay ninguno
   * @returns {string} result.error - Mensaje de error si la operación falló
   * @example
   * const result = await tripService.getActiveTrip();
   * if (result.success && result.data) {
   *   console.log('Viaje activo:', result.data.id);
   * }
   */
  async getActiveTrip() {
    const result = await this.tripRepository.getActiveTrip();
    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    }
    return result;
  }

  /**
   * Obtener viajes por estado
   * @description Recupera viajes filtrados por un estado específico
   * @param {string} status - Estado de los viajes a buscar
   * @returns {Promise<Object>} Resultado de la operación
   * @returns {boolean} result.success - Indica si la operación fue exitosa
   * @returns {Array<Object>} result.data - Lista de viajes con el estado especificado
   * @returns {string} result.error - Mensaje de error si la operación falló
   * @example
   * const result = await tripService.getTripsByStatus('completed');
   * if (result.success) {
   *   console.log('Viajes completados:', result.data.length);
   * }
   */
  async getTripsByStatus(status) {
    const result = await this.tripRepository.getTripsByStatus(status);
    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    }
    return result;
  }

  /**
   * Validar solicitud de viaje
   * @description Valida los datos de entrada para una solicitud de viaje
   * @param {Object} origin - Punto de origen del viaje
   * @param {Object} destination - Punto de destino del viaje
   * @param {string} paymentMethod - Método de pago seleccionado
   * @returns {Object} Resultado de la validación
   * @returns {boolean} result.isValid - Indica si los datos son válidos
   * @returns {Array<string>} result.errors - Lista de errores encontrados
   * @example
   * const validation = tripService.validateTripRequest(origin, destination, 'credit_card');
   * if (!validation.isValid) {
   *   console.log('Errores:', validation.errors);
   * }
   */
  validateTripRequest(origin, destination, paymentMethod) {
    const errors = [];
    if (!origin || !origin.address) {
      errors.push('El origen es requerido');
    }
    if (!destination || !destination.address) {
      errors.push('El destino es requerido');
    }
    if (!paymentMethod) {
      errors.push('El método de pago es requerido');
    }
    if (origin && destination && origin.address === destination.address) {
      errors.push('El origen y destino no pueden ser iguales');
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calcular tarifa estimada
   * @description Calcula el costo estimado de un viaje basado en origen y destino
   * @param {Object} origin - Punto de origen del viaje
   * @param {Object} destination - Punto de destino del viaje
   * @returns {number} Tarifa estimada en pesos
   * @example
   * const fare = tripService.calculateEstimatedFare(origin, destination);
   * console.log('Tarifa estimada:', fare);
   */
  calculateEstimatedFare(origin, destination) {
    // Simulación de cálculo de tarifa
    // En una implementación real, esto se haría con una API de mapas
    const baseFare = 50; // Tarifa base
    const perKmRate = 15; // Tarifa por kilómetro
    // Simular distancia (en una implementación real se calcularía con la API de mapas)
    const distance = this.calculateDistance(origin, destination);
    return baseFare + distance * perKmRate;
  }

  /**
   * Calcular distancia entre dos puntos
   * @description Calcula la distancia aproximada entre origen y destino
   * @returns {number} Distancia estimada en kilómetros
   * @example
   * const distance = tripService.calculateDistance();
   * console.log('Distancia:', distance, 'km');
   */
  calculateDistance() {
    // Simulación de cálculo de distancia
    // En una implementación real, esto se haría con la API de mapas
    return Math.random() * 10 + 1; // Entre 1 y 11 km
  }

  /**
   * Obtener tiempo estimado de viaje
   * @description Calcula la duración estimada de un viaje en minutos
   * @param {Object} origin - Punto de origen del viaje
   * @param {Object} destination - Punto de destino del viaje
   * @returns {number} Duración estimada en minutos
   * @example
   * const duration = tripService.getEstimatedDuration(origin, destination);
   * console.log('Duración estimada:', duration, 'minutos');
   */
  getEstimatedDuration(origin, destination) {
    // Simulación de cálculo de duración
    // En una implementación real, esto se haría con la API de mapas
    const distance = this.calculateDistance(origin, destination);
    const averageSpeed = 30; // km/h
    return Math.round((distance / averageSpeed) * 60); // en minutos
  }

  /**
   * Verificar si hay un viaje activo
   * @description Verifica si el usuario tiene un viaje actualmente activo
   * @returns {Promise<boolean>} True si hay un viaje activo, false en caso contrario
   * @example
   * const hasActive = await tripService.hasActiveTrip();
   * if (hasActive) {
   *   console.log('El usuario tiene un viaje activo');
   * }
   */
  async hasActiveTrip() {
    const result = await this.getActiveTrip();
    return result.success && result.data !== null;
  }

  /**
   * Inicializar detección de conectividad
   * @description Configura los listeners para detectar cambios en el estado de conexión
   * @example
   * tripService.initializeConnectivityDetection();
   */
  initializeConnectivityDetection() {
    // Simular detección de conectividad (en una app real usarías NetInfo)
    this.isOnline = true; // Por defecto asumimos que hay conexión

    // En React Native, usarías NetInfo para detectar conectividad
    // Por ahora simulamos que siempre hay conexión
    // eslint-disable-next-line no-console
    if (__DEV__) console.log('Conectividad inicializada (simulada)');
  }

  /**
   * Iniciar proceso de sincronización
   * @description Inicia el proceso automático de sincronización de operaciones offline
   * @example
   * tripService.startSyncProcess();
   */
  startSyncProcess() {
    setInterval(() => {
      if (this.isOnline && this.offlineQueue.length > 0) {
        this.processOfflineQueue();
      }
    }, this.syncInterval);
  }

  /**
   * Procesar cola offline
   * @description Procesa todas las operaciones pendientes en la cola offline
   * @returns {Promise<void>} Promise que se resuelve cuando se procesan todas las operaciones
   * @example
   * await tripService.processOfflineQueue();
   */
  async processOfflineQueue() {
    if (this.offlineQueue.length === 0) return;

    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const operation of queue) {
      try {
        await this.executeOperation(operation);
      } catch (error) {
        // Si falla, volver a agregar a la cola
        this.offlineQueue.push(operation);
        break;
      }
    }
  }

  /**
   * Ejecutar operación con retry logic
   * @description Ejecuta una operación de la cola offline con lógica de reintentos
   * @param {Object} operation - Operación a ejecutar
   * @param {string} operation.type - Tipo de operación
   * @param {Object} operation.data - Datos de la operación
   * @param {number} [operation.retries] - Número de reintentos restantes
   * @returns {Promise<Object>} Resultado de la operación
   * @example
   * const result = await tripService.executeOperation({
   *   type: 'requestTrip',
   *   data: { origin, destination, paymentMethod }
   * });
   */
  async executeOperation(operation) {
    const { type, data, retries = this.maxRetries } = operation;

    try {
      let result;
      switch (type) {
        case 'requestTrip':
          result = await this.tripRepository.requestRide(data.origin, data.destination, data.paymentMethod);
          break;
        case 'cancelTrip':
          result = await this.tripRepository.cancelTrip(data.tripId);
          break;
        case 'payTrip':
          result = await this.tripRepository.payTrip(data.tripId, data.paymentMethod);
          break;
        case 'rateTrip':
          result = await this.tripRepository.rateTrip(data.tripId, data.rating, data.comment);
          break;
        default:
          throw new Error(`Operación desconocida: ${type}`);
      }

      if (!result.success && retries > 0) {
        // Reintentar
        await this.delay(this.retryDelay);
        return this.executeOperation({ ...operation, retries: retries - 1 });
      }

      return result;
    } catch (error) {
      if (retries > 0) {
        await this.delay(this.retryDelay);
        return this.executeOperation({ ...operation, retries: retries - 1 });
      }
      throw error;
    }
  }

  /**
   * Delay helper
   * @description Crea una promesa que se resuelve después del tiempo especificado
   * @param {number} ms - Milisegundos a esperar
   * @returns {Promise<void>} Promise que se resuelve después del delay
   * @example
   * await tripService.delay(1000); // Esperar 1 segundo
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Agregar operación a la cola offline
   * @description Agrega una operación a la cola para sincronizar cuando haya conexión
   * @param {Object} operation - Operación a agregar a la cola
   * @param {string} operation.type - Tipo de operación
   * @param {Object} operation.data - Datos de la operación
   * @example
   * tripService.addToOfflineQueue({
   *   type: 'requestTrip',
   *   data: { origin, destination, paymentMethod }
   * });
   */
  addToOfflineQueue(operation) {
    this.offlineQueue.push({
      ...operation,
      timestamp: Date.now(),
    });

    // Guardar en almacenamiento local
    this.saveOfflineQueue();
  }

  /**
   * Guardar cola offline en almacenamiento local
   * @description Persiste la cola de operaciones offline en el almacenamiento seguro
   * @returns {Promise<void>} Promise que se resuelve cuando se guarda la cola
   * @example
   * await tripService.saveOfflineQueue();
   */
  async saveOfflineQueue() {
    try {
      await this.secureStorage.setItem('offline_trip_queue', this.offlineQueue);
    } catch (error) {
      // console.error('Error guardando cola offline:', error);
    }
  }

  /**
   * Cargar cola offline desde almacenamiento local
   * @description Recupera la cola de operaciones offline desde el almacenamiento seguro
   * @returns {Promise<void>} Promise que se resuelve cuando se carga la cola
   * @example
   * await tripService.loadOfflineQueue();
   */
  async loadOfflineQueue() {
    try {
      const queue = await this.secureStorage.getItem('offline_trip_queue');
      if (queue && Array.isArray(queue)) {
        this.offlineQueue = queue;
      }
    } catch (error) {
      // console.error('Error cargando cola offline:', error);
    }
  }

  /**
   * Limpiar cola offline
   * @description Elimina todas las operaciones de la cola offline y limpia el almacenamiento
   * @returns {Promise<void>} Promise que se resuelve cuando se limpia la cola
   * @example
   * await tripService.clearOfflineQueue();
   */
  async clearOfflineQueue() {
    this.offlineQueue = [];
    await this.secureStorage.removeItem('offline_trip_queue');
  }

  /**
   * Obtener estado de sincronización
   * @description Retorna el estado actual de la sincronización y operaciones pendientes
   * @returns {Object} Estado de sincronización
   * @returns {boolean} result.isOnline - Indica si hay conexión a internet
   * @returns {number} result.pendingOperations - Número de operaciones pendientes
   * @returns {Date|null} result.lastSync - Fecha de la última sincronización
   * @example
   * const status = tripService.getSyncStatus();
   * console.log('Operaciones pendientes:', status.pendingOperations);
   */
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      pendingOperations: this.offlineQueue.length,
      lastSync: this.lastSyncTime,
    };
  }

  /**
   * Sincronizar datos pendientes
   * @description Sincroniza todas las operaciones pendientes en la cola offline
   * @returns {Promise<Object>} Resultado de la sincronización
   * @returns {boolean} result.success - Indica si la sincronización fue exitosa
   * @returns {string} result.message - Mensaje de confirmación o error
   * @returns {string} result.error - Mensaje de error si la operación falló
   * @example
   * const result = await tripService.syncPendingData();
   * if (result.success) {
   *   console.log('Datos sincronizados correctamente');
   * }
   */
  async syncPendingData() {
    if (!this.isOnline) {
      return {
        success: false,
        error: 'Sin conexión a internet',
      };
    }

    try {
      await this.loadOfflineQueue();
      await this.processOfflineQueue();

      this.lastSyncTime = new Date();

      return {
        success: true,
        message: 'Datos sincronizados exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error durante la sincronización',
      };
    }
  }

  /**
   * Obtener viajes con caché offline
   * @description Recupera viajes del usuario con estrategia de caché inteligente
   * @returns {Promise<Object>} Resultado de la operación
   * @returns {boolean} result.success - Indica si la operación fue exitosa
   * @returns {Array<Object>} result.data - Lista de viajes del usuario
   * @returns {boolean} result.fromCache - Indica si los datos vienen del caché
   * @returns {string} result.warning - Advertencia si los datos están en caché
   * @returns {string} result.error - Mensaje de error si la operación falló
   * @example
   * const result = await tripService.getUserTripsWithCache();
   * if (result.success) {
   *   console.log('Desde caché:', result.fromCache);
   * }
   */
  async getUserTripsWithCache() {
    try {
      // Intentar obtener desde caché local primero
      const cachedTrips = await this.secureStorage.getItem('user_trips');

      if (cachedTrips && this.isOnline) {
        // Si hay datos en caché y estamos online, devolverlos inmediatamente
        // y actualizar en segundo plano
        this.updateTripsInBackground();
        return {
          success: true,
          data: cachedTrips,
          fromCache: true,
        };
      }

      // Si no hay caché o estamos offline, intentar obtener del servidor
      const result = await this.getUserTrips();

      if (result.success) {
        // Guardar en caché
        await this.secureStorage.setItem('user_trips', result.data);
      }

      return result;
    } catch (error) {
      // En caso de error, intentar devolver datos del caché
      try {
        const cachedTrips = await this.secureStorage.getItem('user_trips');
        if (cachedTrips) {
          return {
            success: true,
            data: cachedTrips,
            fromCache: true,
            warning: 'Datos en caché - posible información desactualizada',
          };
        }
      } catch (cacheError) {
        // console.error('Error accediendo al caché:', cacheError);
      }

      return {
        success: false,
        error: 'Error al obtener viajes',
      };
    }
  }

  /**
   * Actualizar viajes en segundo plano
   * @description Actualiza los viajes del usuario en segundo plano cuando hay conexión
   * @returns {Promise<void>} Promise que se resuelve cuando se completa la actualización
   * @example
   * // Se ejecuta automáticamente cuando hay conexión
   * await tripService.updateTripsInBackground();
   */
  async updateTripsInBackground() {
    try {
      const result = await this.getUserTrips();
      if (result.success) {
        await this.secureStorage.setItem('user_trips', result.data);
      }
    } catch (error) {
      // Silenciar errores en actualización en segundo plano
    }
  }
}

export default TripService;
