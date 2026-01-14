/**
 * Entidad de Conductor - Capa de Dominio
 * Representa la lógica de negocio del conductor
 */
class Driver {
  constructor({
    id,
    userId,
    license,
    vehicle,
    rating = 0,
    totalTrips = 0,
    isApproved = false,
    isAvailable = false,
    currentLocation,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.userId = userId;
    this.license = license;
    this.vehicle = vehicle;
    this.rating = rating;
    this.totalTrips = totalTrips;
    this.isApproved = isApproved;
    this.isAvailable = isAvailable;
    this.currentLocation = currentLocation;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Verificar si está disponible para viajes
   */
  isAvailableForTrips() {
    return this.isApproved && this.isAvailable;
  }

  /**
   * Verificar si puede ser calificado
   */
  canBeRated() {
    return this.isApproved && this.totalTrips > 0;
  }

  /**
   * Obtener información del vehículo
   */
  getVehicleInfo() {
    if (!this.vehicle) return null;
    return `${this.vehicle.brand} ${this.vehicle.model} (${this.vehicle.year}) - ${this.vehicle.color}`;
  }

  /**
   * Calcular rating promedio
   */
  calculateAverageRating(newRating) {
    if (this.totalTrips === 0) return newRating;
    return (this.rating * this.totalTrips + newRating) / (this.totalTrips + 1);
  }

  /**
   * Validar datos del conductor
   */
  validate() {
    const errors = [];
    if (!this.userId) {
      errors.push('El ID del usuario es requerido');
    }
    if (!this.license || this.license.trim().length < 5) {
      errors.push('La licencia debe tener al menos 5 caracteres');
    }
    if (!this.vehicle) {
      errors.push('La información del vehículo es requerida');
    } else {
      if (!this.vehicle.brand || this.vehicle.brand.trim().length < 2) {
        errors.push('La marca del vehículo es requerida');
      }
      if (!this.vehicle.model || this.vehicle.model.trim().length < 2) {
        errors.push('El modelo del vehículo es requerido');
      }
      if (
        !this.vehicle.year ||
        this.vehicle.year < 1900 ||
        this.vehicle.year > new Date().getFullYear() + 1
      ) {
        errors.push('El año del vehículo no es válido');
      }
      if (!this.vehicle.color || this.vehicle.color.trim().length < 2) {
        errors.push('El color del vehículo es requerido');
      }
    }
    if (this.rating < 0 || this.rating > 5) {
      errors.push('El rating debe estar entre 0 y 5');
    }
    if (this.totalTrips < 0) {
      errors.push('El total de viajes no puede ser negativo');
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convertir a JSON
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      license: this.license,
      vehicle: this.vehicle,
      rating: this.rating,
      totalTrips: this.totalTrips,
      isApproved: this.isApproved,
      isAvailable: this.isAvailable,
      currentLocation: this.currentLocation,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Crear desde JSON
   */
  static fromJSON(data) {
    return new Driver(data);
  }
}

export default Driver;
