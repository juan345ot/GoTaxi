/* eslint-disable no-console, max-len, operator-linebreak */
const { TripRepository } = require('../repositories/TripRepository');
const { UserRepository } = require('../repositories/UserRepository');
const TripEntity = require('../domain/entities/Trip');

/**
 * Estados válidos para un viaje
 */
const TRIP_STATES = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  DRIVER_ARRIVED: 'driver_arrived',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

/**
 * Transiciones de estado válidas
 */
const VALID_TRANSITIONS = {
  [TRIP_STATES.REQUESTED]: [TRIP_STATES.ACCEPTED, TRIP_STATES.CANCELLED],
  [TRIP_STATES.ACCEPTED]: [TRIP_STATES.DRIVER_ARRIVED, TRIP_STATES.CANCELLED],
  [TRIP_STATES.DRIVER_ARRIVED]: [TRIP_STATES.IN_PROGRESS, TRIP_STATES.CANCELLED],
  [TRIP_STATES.IN_PROGRESS]: [TRIP_STATES.COMPLETED, TRIP_STATES.CANCELLED],
  [TRIP_STATES.COMPLETED]: [],
  [TRIP_STATES.CANCELLED]: [],
};

/**
 * Servicio de lógica de negocio para Trip con State Machine
 * Contiene la lógica de negocio y orquesta las operaciones
 */
class TripService {
  constructor() {
    this.tripRepository = new TripRepository();
    this.userRepository = new UserRepository();
  }

  /**
   * Crear un nuevo viaje
   * @param {Object} tripData - Datos del viaje
   * @param {string} passengerId - ID del pasajero
   * @returns {Promise<Object>} Resultado de la operación
   */
  async createTrip(tripData, passengerId) {
    try {
      // Validar que el pasajero existe y está activo
      const passenger = await this.userRepository.findById(passengerId);
      if (!passenger) {
        throw new Error('Pasajero no encontrado');
      }

      if (!passenger.canPerformActions()) {
        throw new Error('Pasajero inactivo');
      }

      // Crear entidad de dominio con estado inicial
      const tripEntity = new TripEntity({
        ...tripData,
        passengerId,
        status: TRIP_STATES.REQUESTED,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Validar la entidad
      const validation = tripEntity.validate();
      if (!validation.isValid) {
        throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
      }

      // Crear en la base de datos
      const createdTrip = await this.tripRepository.create(tripEntity.toJSON());

      return {
        success: true,
        data: createdTrip,
        message: 'Viaje creado exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Obtener viaje por ID
   * @description Recupera un viaje específico verificando permisos de acceso
   * @param {string} tripId - ID único del viaje
   * @param {string} userId - ID del usuario que solicita el viaje
   * @param {string} userRole - Rol del usuario(pasajero, conductor, admin)
   * @returns {Promise<Object>} Resultado de la operación
   * @returns {boolean} result.success - Indica si la operación fue exitosa
   * @returns {Object} result.data - Datos del viaje
   * @returns {string} result.error - Mensaje de error si la operación falló
   * @throws {Error} Si el viaje no existe o el usuario no tiene permisos
   * @example
   * const result = await tripService.getTripById(
   *   '507f1f77bcf86cd799439011',
   *   'user123',
   *   'pasajero'
   * );
   * if(result.success) {
   *   console.log('Viaje:', result.data.origin);
   * }
   */
  async getTripById(tripId, userId, userRole) {
    try {
      const trip = await this.tripRepository.findById(tripId);
      if (!trip) {
        throw new Error('Viaje no encontrado');
      }

      // Verificar permisos
      if (!this.canUserAccessTrip(trip, userId, userRole)) {
        throw new Error('No tienes permisos para ver este viaje');
      }

      return {
        success: true,
        data: trip,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Obtener viajes del usuario con paginación
   * @description Recupera los viajes de un usuario según su rol con opciones de filtrado
   * @param {string} userId - ID del usuario
   * @param {string} userRole - Rol del usuario(pasajero, conductor, admin)
   * @param {Object} [options={}] - Opciones de consulta
   * @param {number} [options.page=1] - Página actual
   * @param {number} [options.limit=10] - Límite de resultados por página
   * @param {string} [options.status] - Filtrar por estado específico
   * @returns {Promise<Object>} Resultado de la operación
   * @returns {boolean} result.success - Indica si la operación fue exitosa
   * @returns {Array} result.data - Lista de viajes
   * @returns {Object} result.pagination - Información de paginación
   * @returns {string} result.error - Mensaje de error si la operación falló
   * @throws {Error} Si el rol no es válido
   * @example
   * const result = await tripService.getUserTrips('user123', 'pasajero', { page: 1, limit: 10 });
   * if(result.success) {
   *   console.log('Viajes:', result.data.length);
   * }
   */
  async getUserTrips(userId, userRole, options = {}) {
    try {
      let result;

      if (userRole === 'pasajero') {
        result = await this.tripRepository.findByPassengerId(userId, options);
      } else if (userRole === 'conductor') {
        result = await this.tripRepository.findByDriverId(userId, options);
      } else if (userRole === 'admin') {
        // Los admins pueden ver todos los viajes
        result = await this.tripRepository.findByStatus(options.status, options);
      } else {
        throw new Error('Rol no válido');
      }

      return {
        success: true,
        data: result.trips,
        pagination: result.pagination,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Asignar conductor a un viaje
   * @param {string} tripId - ID del viaje
   * @param {string} driverId - ID del conductor
   * @returns {Promise<Object>} Resultado de la operación
   */
  async assignDriver(tripId, driverId) {
    try {
      const trip = await this.tripRepository.findById(tripId);
      if (!trip) {
        throw new Error('Viaje no encontrado');
      }

      // Verificar que el viaje está en estado correcto para asignar conductor
      if (trip.status !== TRIP_STATES.REQUESTED) {
        throw new Error('El viaje no está en estado solicitado para asignar conductor');
      }

      // Verificar que el conductor existe y está activo
      const driverUser = await this.userRepository.findById(driverId);
      if (!driverUser) {
        throw new Error('Conductor no encontrado');
      }

      if (!driverUser.isDriver()) {
        throw new Error('El usuario no es un conductor');
      }

      if (!driverUser.canPerformActions()) {
        throw new Error('Conductor inactivo');
      }

      // Buscar el documento Driver correspondiente al User
      const Driver = require('../models/Driver');
      const driverDoc = await Driver.findOne({ user: driverId });
      if (!driverDoc) {
        throw new Error('Documento Driver no encontrado para este usuario');
      }

      // Usar el ID del Driver para asignar al viaje
      const driverDocumentId = driverDoc._id.toString();

      // Transición de estado usando el state machine
      const transitionResult = this.transitionState(trip, TRIP_STATES.ACCEPTED, {
        driverId: driverDocumentId,
        assignedAt: new Date(),
      });

      if (!transitionResult.isValid) {
        throw new Error(transitionResult.error);
      }

      // Actualizar viaje
      const updatedTrip = await this.tripRepository.update(tripId, transitionResult.updateData);

      // Asegurar que el driverId en la respuesta sea el ID del User, no del Driver
      // El toEntity ya debería manejar esto si el populate está correcto
      // Pero si no, intentamos buscar el User del Driver
      if (updatedTrip) {
        if (updatedTrip.driverId && updatedTrip.driverId !== driverId) {
          // Si el driverId actualizado es diferente al driverId original(User ID),
          // significa que es el ID del Driver document, necesitamos obtener el User ID
          try {
            const Driver = require('../models/Driver');
            const driverDoc = await Driver.findById(updatedTrip.driverId);
            if (driverDoc && driverDoc.user) {
              // driverDoc.user puede ser ObjectId o string
              updatedTrip.driverId = driverDoc.user.toString
                ? driverDoc.user.toString()
                : String(driverDoc.user);
            } else {
              // Si no se encuentra el user, usar el driverId original
              updatedTrip.driverId = driverId;
            }
          } catch (error) {
            // Si falla(por ejemplo, en tests con mocks), usar el driverId original
            updatedTrip.driverId = driverId;
          }
        } else if (!updatedTrip.driverId) {
          // Si no hay driverId en el trip actualizado, usar el driverId original(User ID)
          updatedTrip.driverId = driverId;
        }
      }

      return {
        success: true,
        data: updatedTrip,
        message: 'Conductor asignado exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Actualizar estado del viaje usando state machine
   * @param {string} tripId - ID del viaje
   * @param {string} newStatus - Nuevo estado
   * @param {string} userId - ID del usuario
   * @param {string} userRole - Rol del usuario
   * @param {Object} additionalData - Datos adicionales para la transición
   * @returns {Promise<Object>} Resultado de la operación
   */
  async updateTripStatus(tripId, newStatus, userId, userRole, additionalData = {}) {
    try {
      const trip = await this.tripRepository.findById(tripId);
      if (!trip) {
        throw new Error('Viaje no encontrado');
      }

      // Verificar permisos
      if (!this.canUserModifyTrip(trip, userId, userRole)) {
        throw new Error('No tienes permisos para modificar este viaje');
      }

      // Validar que el nuevo estado es válido
      if (!Object.values(TRIP_STATES).includes(newStatus)) {
        throw new Error(`Estado inválido: ${newStatus}`);
      }

      // Transición de estado usando el state machine
      const transitionResult = this.transitionState(trip, newStatus, additionalData);

      if (!transitionResult.isValid) {
        throw new Error(transitionResult.error);
      }

      // Actualizar viaje
      const updatedTrip = await this.tripRepository.update(tripId, transitionResult.updateData);

      return {
        success: true,
        data: updatedTrip,
        message: 'Estado del viaje actualizado',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Cancelar viaje usando state machine
   * @param {string} tripId - ID del viaje
   * @param {string} userId - ID del usuario
   * @param {string} userRole - Rol del usuario
   * @param {string} reason - Razón de la cancelación
   * @returns {Promise<Object>} Resultado de la operación
   */
  async cancelTrip(tripId, userId, userRole, reason = '') {
    try {
      const trip = await this.tripRepository.findById(tripId);
      if (!trip) {
        throw new Error('Viaje no encontrado');
      }

      // Verificar permisos
      if (!this.canUserModifyTrip(trip, userId, userRole)) {
        throw new Error('No tienes permisos para cancelar este viaje');
      }

      // Transición de estado usando el state machine
      const transitionResult = this.transitionState(trip, TRIP_STATES.CANCELLED, {
        cancellationReason: reason,
        cancelledAt: new Date(),
        cancelledBy: userId,
      });

      if (!transitionResult.isValid) {
        throw new Error(transitionResult.error);
      }

      // Actualizar viaje
      const updatedTrip = await this.tripRepository.update(tripId, transitionResult.updateData);

      return {
        success: true,
        data: updatedTrip,
        message: 'Viaje cancelado exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Obtener viajes activos usando estados del machine
   * @returns {Promise<Object>} Resultado de la operación
   */
  async getActiveTrips() {
    try {
      const activeStates = [
        TRIP_STATES.REQUESTED,
        TRIP_STATES.ACCEPTED,
        TRIP_STATES.DRIVER_ARRIVED,
        TRIP_STATES.IN_PROGRESS,
      ];

      const trips = await this.tripRepository.findByStatuses(activeStates);
      return {
        success: true,
        data: trips,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verificar si el usuario puede acceder al viaje
   * @description Verifica si un usuario tiene permisos para ver un viaje específico
   * @param {Object} trip - Objeto del viaje
   * @param {string} trip.passengerId - ID del pasajero del viaje
   * @param {string} trip.driverId - ID del conductor del viaje
   * @param {string} userId - ID del usuario que solicita acceso
   * @param {string} userRole - Rol del usuario(pasajero, conductor, admin)
   * @returns {boolean} True si el usuario puede acceder al viaje, false en caso contrario
   * @example
   * if(tripService.canUserAccessTrip(trip, 'user123', 'pasajero')) {
   *   // Usuario puede ver el viaje
   * }
   */
  canUserAccessTrip(trip, userId, userRole) {
    if (userRole === 'admin') return true;

    // Manejar tanto string como objeto para passengerId
    const passengerId =
      typeof trip.passengerId === 'string' ? trip.passengerId : trip.passengerId?._id?.toString();

    // Manejar tanto string como objeto para driverId
    const driverId =
      typeof trip.driverId === 'string' ? trip.driverId : trip.driverId?._id?.toString();

    if (passengerId === userId) return true;
    if (driverId === userId) return true;
    return false;
  }

  /**
   * Verificar si el usuario puede modificar el viaje
   * @description Verifica si un usuario tiene permisos para modificar un viaje específico
   * @param {Object} trip - Objeto del viaje
   * @param {string} trip.passengerId - ID del pasajero del viaje
   * @param {string} trip.driverId - ID del conductor del viaje
   * @param {string} userId - ID del usuario que solicita modificar
   * @param {string} userRole - Rol del usuario(pasajero, conductor, admin)
   * @returns {boolean} True si el usuario puede modificar el viaje, false en caso contrario
   * @example
   * if(tripService.canUserModifyTrip(trip, 'user123', 'conductor')) {
   *   // Usuario puede modificar el viaje
   * }
   */
  canUserModifyTrip(trip, userId, userRole) {
    if (userRole === 'admin') return true;

    // Manejar tanto string como objeto para passengerId
    let passengerId = trip.passengerId;
    if (passengerId && typeof passengerId !== 'string') {
      passengerId = passengerId._id ? passengerId._id.toString() : passengerId.toString();
    }

    // Manejar tanto string como objeto para driverId
    let driverId = trip.driverId;
    if (driverId && typeof driverId !== 'string') {
      driverId = driverId._id ? driverId._id.toString() : driverId.toString();
    }

    // Convertir userId a string para comparación
    const userIdStr = userId.toString();

    if (passengerId && passengerId.toString() === userIdStr) return true;
    if (driverId && driverId.toString() === userIdStr) return true;
    return false;
  }

  /**
   * Validar transición de estado usando el state machine
   * @param {string} currentStatus - Estado actual
   * @param {string} newStatus - Nuevo estado
   * @returns {boolean} True si la transición es válida
   */
  isValidStatusTransition(currentStatus, newStatus) {
    return VALID_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
  }

  /**
   * Ejecutar transición de estado con validaciones y datos adicionales
   * @param {Object} trip - Objeto del viaje
   * @param {string} newStatus - Nuevo estado
   * @param {Object} additionalData - Datos adicionales para la transición
   * @returns {Object} Resultado de la transición
   */
  transitionState(trip, newStatus, additionalData = {}) {
    // Validar que el nuevo estado es válido
    if (!Object.values(TRIP_STATES).includes(newStatus)) {
      return {
        isValid: false,
        error: `Estado inválido: ${newStatus}`,
      };
    }

    // Validar transición
    if (!this.isValidStatusTransition(trip.status, newStatus)) {
      return {
        isValid: false,
        error: `No se puede cambiar de ${trip.status} a ${newStatus}`,
      };
    }

    // Preparar datos de actualización
    const updateData = {
      status: newStatus,
      updatedAt: new Date(),
      ...additionalData,
    };

    // Agregar timestamps específicos según el estado
    switch (newStatus) {
      case TRIP_STATES.ACCEPTED:
        updateData.acceptedAt = new Date();
        break;
      case TRIP_STATES.DRIVER_ARRIVED:
        updateData.driverArrivedAt = new Date();
        break;
      case TRIP_STATES.IN_PROGRESS:
        updateData.startedAt = new Date();
        break;
      case TRIP_STATES.COMPLETED:
        updateData.completedAt = new Date();
        break;
      case TRIP_STATES.CANCELLED:
        updateData.cancelledAt = new Date();
        break;
    }

    return {
      isValid: true,
      updateData,
    };
  }

  /**
   * Obtener estadísticas de viajes usando estados del machine
   * @param {string} userId - ID del usuario
   * @param {string} userRole - Rol del usuario
   * @param {Object} dateRange - Rango de fechas
   * @returns {Promise<Object>} Resultado de la operación
   */
  async getTripStats(userId, userRole, dateRange = {}) {
    try {
      let trips;

      if (userRole === 'pasajero') {
        const result = await this.tripRepository.findByPassengerId(userId, { limit: 1000 });
        trips = result.trips;
      } else if (userRole === 'conductor') {
        const result = await this.tripRepository.findByDriverId(userId, { limit: 1000 });
        trips = result.trips;
      } else if (userRole === 'admin') {
        const result = await this.tripRepository.findByDateRange(
          dateRange.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          dateRange.endDate || new Date(),
          { limit: 1000 },
        );
        trips = result.trips;
      } else {
        throw new Error('Rol no válido');
      }

      const activeStates = [
        TRIP_STATES.REQUESTED,
        TRIP_STATES.ACCEPTED,
        TRIP_STATES.DRIVER_ARRIVED,
        TRIP_STATES.IN_PROGRESS,
      ];

      const stats = {
        total: trips.length,
        completed: trips.filter(t => t.status === TRIP_STATES.COMPLETED).length,
        cancelled: trips.filter(t => t.status === TRIP_STATES.CANCELLED).length,
        active: trips.filter(t => activeStates.includes(t.status)).length,
        requested: trips.filter(t => t.status === TRIP_STATES.REQUESTED).length,
        accepted: trips.filter(t => t.status === TRIP_STATES.ACCEPTED).length,
        driverArrived: trips.filter(t => t.status === TRIP_STATES.DRIVER_ARRIVED).length,
        inProgress: trips.filter(t => t.status === TRIP_STATES.IN_PROGRESS).length,
        totalFare: trips.reduce((sum, t) => sum + (t.fare || 0), 0),
        averageFare:
          trips.length > 0 ? trips.reduce((sum, t) => sum + (t.fare || 0), 0) / trips.length : 0,
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Obtener todos los estados válidos
   * @returns {Array<string>} Array de estados válidos
   */
  getValidStates() {
    return Object.values(TRIP_STATES);
  }

  /**
   * Obtener transiciones válidas desde un estado
   * @param {string} currentStatus - Estado actual
   * @returns {Array<string>} Array de estados válidos para transición
   */
  getValidTransitions(currentStatus) {
    return VALID_TRANSITIONS[currentStatus] || [];
  }

  /**
   * Verificar si un viaje está en estado activo
   * @param {Object} trip - Objeto del viaje
   * @returns {boolean} True si el viaje está activo
   */
  isTripActive(trip) {
    const activeStates = [
      TRIP_STATES.REQUESTED,
      TRIP_STATES.ACCEPTED,
      TRIP_STATES.DRIVER_ARRIVED,
      TRIP_STATES.IN_PROGRESS,
    ];
    return activeStates.includes(trip.status);
  }

  /**
   * Verificar si un viaje puede ser cancelado
   * @param {Object} trip - Objeto del viaje
   * @returns {boolean} True si el viaje puede ser cancelado
   */
  canTripBeCancelled(trip) {
    const cancellableStates = [
      TRIP_STATES.REQUESTED,
      TRIP_STATES.ACCEPTED,
      TRIP_STATES.DRIVER_ARRIVED,
      TRIP_STATES.IN_PROGRESS,
    ];
    return cancellableStates.includes(trip.status);
  }

  /**
   * Obtener el siguiente estado lógico en el flujo del viaje
   * @param {string} currentStatus - Estado actual
   * @returns {string|null} Siguiente estado lógico o null si no hay
   */
  getNextLogicalState(currentStatus) {
    const nextStates = {
      [TRIP_STATES.REQUESTED]: TRIP_STATES.ACCEPTED,
      [TRIP_STATES.ACCEPTED]: TRIP_STATES.DRIVER_ARRIVED,
      [TRIP_STATES.DRIVER_ARRIVED]: TRIP_STATES.IN_PROGRESS,
      [TRIP_STATES.IN_PROGRESS]: TRIP_STATES.COMPLETED,
    };
    return nextStates[currentStatus] || null;
  }
}

module.exports = { TripService, TRIP_STATES };
