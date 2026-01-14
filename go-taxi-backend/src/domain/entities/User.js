/**
 * Entidad de dominio para User
 * Representa la lógica de negocio de un usuario
 */
class User {
  constructor({
    id,
    nombre,
    apellido,
    email,
    telefono,
    role,
    activo = true,
    avatar,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.email = email;
    this.telefono = telefono;
    this.role = role;
    this.activo = activo;
    this.avatar = avatar;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Obtiene el nombre completo del usuario
   */
  getFullName() {
    return `${this.nombre} ${this.apellido}`.trim();
  }

  /**
   * Valida si el usuario es un pasajero
   */
  isPassenger() {
    return this.role === 'pasajero';
  }

  /**
   * Valida si el usuario es un conductor
   */
  isDriver() {
    return this.role === 'conductor';
  }

  /**
   * Valida si el usuario es un admin
   */
  isAdmin() {
    return this.role === 'admin';
  }

  /**
   * Valida si el usuario puede realizar acciones
   */
  canPerformActions() {
    return this.activo;
  }

  /**
   * Valida los datos del usuario
   */
  validate() {
    const errors = [];

    if (!this.nombre || this.nombre.trim().length === 0) {
      errors.push('nombre es requerido');
    }

    if (!this.apellido || this.apellido.trim().length === 0) {
      errors.push('apellido es requerido');
    }

    if (!this.email || !this.isValidEmail(this.email)) {
      errors.push('email válido es requerido');
    }

    if (!this.role || !['pasajero', 'conductor', 'admin'].includes(this.role)) {
      errors.push('rol válido es requerido');
    }

    if (this.telefono && !this.isValidPhone(this.telefono)) {
      errors.push('teléfono debe tener formato válido');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Valida formato de email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida formato de teléfono
   */
  isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Convierte la entidad a objeto plano
   */
  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      apellido: this.apellido,
      email: this.email,
      telefono: this.telefono,
      role: this.role,
      activo: this.activo,
      avatar: this.avatar,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = User;
