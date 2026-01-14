/**
 * Entidad de dominio para Trip
 * Representa la lógica de negocio de un viaje
 */
class Trip {
  constructor({
    id,
    passengerId,
    driverId,
    origin,
    destination,
    status = 'requested',
    fare,
    distance,
    duration,
    paymentMethod,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.passengerId = passengerId;
    this.driverId = driverId;
    this.origin = origin;
    this.destination = destination;
    this.status = status;
    this.fare = fare;
    this.distance = distance;
    this.duration = duration;
    this.paymentMethod = paymentMethod;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Valida si el viaje puede ser cancelado
   */
  canBeCancelled() {
    return ['requested', 'accepted', 'driver_arrived'].includes(this.status);
  }

  /**
   * Valida si el viaje puede ser completado
   */
  canBeCompleted() {
    return ['in_progress'].includes(this.status);
  }

  /**
   * Valida si el viaje puede ser calificado
   */
  canBeRated() {
    return this.status === 'completed';
  }

  /**
   * Calcula el tiempo estimado de llegada
   */
  getEstimatedArrival() {
    if (!this.duration) return null;
    const now = new Date();
    return new Date(now.getTime() + this.duration * 60000);
  }

  /**
   * Valida los datos del viaje
   */
  validate() {
    const errors = [];

    if (!this.passengerId) {
      errors.push('passengerId es requerido');
    }

    if (!this.origin || !this.origin.direccion) {
      errors.push('origen es requerido');
    }

    if (!this.destination || !this.destination.direccion) {
      errors.push('destino es requerido');
    }

    if (!this.fare || this.fare <= 0) {
      errors.push('tarifa debe ser mayor a 0');
    }

    if (!this.paymentMethod) {
      errors.push('método de pago es requerido');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convierte la entidad a objeto plano
   */
  toJSON() {
    return {
      id: this.id,
      passengerId: this.passengerId,
      driverId: this.driverId,
      origin: this.origin,
      destination: this.destination,
      status: this.status,
      fare: this.fare,
      distance: this.distance,
      duration: this.duration,
      paymentMethod: this.paymentMethod,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Trip;
