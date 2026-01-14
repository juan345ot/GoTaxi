/**
 * Repositorio de Viajes - Capa de Infraestructura
 * Abstrae las llamadas a la API de viajes
 */
import {
  requestRide,
  getRideById,
  cancelRide,
  payForRide,
  rateRide,
  getUserRides,
} from '../../api/ride';
import Trip from '../../domain/entities/Trip';

class TripRepository {
  /**
   * Solicitar un viaje
   */
  async requestRide(origin, destination, paymentMethod) {
    try {
      const response = await requestRide(origin, destination, paymentMethod);
      if (response.success) {
        return {
          success: true,
          data: Trip.fromJSON(response.data),
        };
      }
      return {
        success: false,
        error: response.message || 'Error al solicitar viaje',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Obtener viaje por ID
   */
  async getTripById(tripId) {
    try {
      const response = await getRideById(tripId);
      if (response.success) {
        return {
          success: true,
          data: Trip.fromJSON(response.data),
        };
      }
      return {
        success: false,
        error: response.message || 'Error al obtener viaje',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Cancelar viaje
   */
  async cancelTrip(tripId) {
    try {
      const response = await cancelRide(tripId);
      if (response.success) {
        return {
          success: true,
          data: Trip.fromJSON(response.data),
        };
      }
      return {
        success: false,
        error: response.message || 'Error al cancelar viaje',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Pagar viaje
   */
  async payTrip(tripId, paymentMethod) {
    try {
      const response = await payForRide(tripId, paymentMethod);
      if (response.success) {
        return {
          success: true,
          data: Trip.fromJSON(response.data),
        };
      }
      return {
        success: false,
        error: response.message || 'Error al pagar viaje',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Calificar viaje
   */
  async rateTrip(tripId, rating, comment) {
    try {
      const response = await rateRide(tripId, rating, comment);
      if (response.success) {
        return {
          success: true,
          data: Trip.fromJSON(response.data),
        };
      }
      return {
        success: false,
        error: response.message || 'Error al calificar viaje',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Obtener viajes del usuario
   */
  async getUserTrips() {
    try {
      const response = await getUserRides();
      if (response.success) {
        return {
          success: true,
          data: response.data.map(trip => Trip.fromJSON(trip)),
        };
      }
      return {
        success: false,
        error: response.message || 'Error al obtener viajes',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Obtener viajes por estado
   */
  async getTripsByStatus(status) {
    try {
      const response = await getUserRides();
      if (response.success) {
        const trips = response.data
          .map(trip => Trip.fromJSON(trip))
          .filter(trip => trip.status === status);
        return {
          success: true,
          data: trips,
        };
      }
      return {
        success: false,
        error: response.message || 'Error al obtener viajes',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Obtener viaje activo
   */
  async getActiveTrip() {
    try {
      const response = await getUserRides();
      if (response.success) {
        const activeTrip = response.data
          .map(trip => Trip.fromJSON(trip))
          .find(trip => ['requested', 'accepted', 'arriving', 'in_progress'].includes(trip.status));
        return {
          success: true,
          data: activeTrip || null,
        };
      }
      return {
        success: false,
        error: response.message || 'Error al obtener viaje activo',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error de conexión',
      };
    }
  }
}

export default TripRepository;
