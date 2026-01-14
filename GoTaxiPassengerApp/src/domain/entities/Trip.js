/**
 * Entidad de Viaje - Capa de Dominio
 * Representa la lógica de negocio del viaje
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
    paymentStatus = 'pending',
    passengerRating,
    driverRating,
    comment,
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
    this.paymentStatus = paymentStatus;
    this.passengerRating = passengerRating;
    this.driverRating = driverRating;
    this.comment = comment;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Verificar si puede ser cancelado
   */
  canBeCancelled() {
    return ['requested', 'accepted', 'arriving'].includes(this.status);
  }

  /**
   * Verificar si puede ser completado
   */
  canBeCompleted() {
    return ['in_progress'].includes(this.status);
  }

  /**
   * Verificar si puede ser calificado
   */
  canBeRated() {
    return this.status === 'completed' && !this.passengerRating;
  }

  /**
   * Obtener tiempo estimado de llegada
   */
  getEstimatedArrival() {
    if (!this.duration) return null;
    const now = new Date();
    return new Date(now.getTime() + this.duration * 60000);
  }

  /**
   * Validar datos del viaje
   */
  validate() {
    const errors = [];
    if (!this.passengerId) {
      errors.push('El ID del pasajero es requerido');
    }
    if (!this.origin || !this.origin.address) {
      errors.push('El origen es requerido');
    }
    if (!this.destination || !this.destination.address) {
      errors.push('El destino es requerido');
    }
    if (this.fare !== undefined && this.fare < 0) {
      errors.push('La tarifa no puede ser negativa');
    }
    if (this.distance !== undefined && this.distance < 0) {
      errors.push('La distancia no puede ser negativa');
    }
    if (this.duration !== undefined && this.duration < 0) {
      errors.push('La duración no puede ser negativa');
    }
    if (
      !['requested', 'accepted', 'arriving', 'in_progress', 'completed', 'cancelled'].includes(
        this.status,
      )
    ) {
      errors.push('El estado del viaje no es válido');
    }
    if (
      this.passengerRating !== undefined &&
      (this.passengerRating < 1 || this.passengerRating > 5)
    ) {
      errors.push('La calificación debe estar entre 1 y 5');
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
      passengerId: this.passengerId,
      driverId: this.driverId,
      origin: this.origin,
      destination: this.destination,
      status: this.status,
      fare: this.fare,
      distance: this.distance,
      duration: this.duration,
      paymentMethod: this.paymentMethod,
      paymentStatus: this.paymentStatus,
      passengerRating: this.passengerRating,
      driverRating: this.driverRating,
      comment: this.comment,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Crear desde JSON
   */
  static fromJSON(data) {
    return new Trip(data);
  }
}

export default Trip;
