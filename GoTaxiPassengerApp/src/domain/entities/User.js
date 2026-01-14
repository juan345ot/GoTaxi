/**
 * Entidad de Usuario - Capa de Dominio
 * Representa la lógica de negocio del usuario
 */
class User {
  constructor({
    id,
    name,
    lastname,
    email,
    phone,
    role = 'pasajero',
    isActive = true,
    avatar,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.name = name;
    this.lastname = lastname;
    this.email = email;
    this.phone = phone;
    this.role = role;
    this.isActive = isActive;
    this.avatar = avatar;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Obtener nombre completo
   */
  getFullName() {
    return `${this.name} ${this.lastname}`.trim();
  }

  /**
   * Verificar si es pasajero
   */
  isPassenger() {
    return this.role === 'pasajero';
  }

  /**
   * Verificar si es conductor
   */
  isDriver() {
    return this.role === 'conductor';
  }

  /**
   * Verificar si es admin
   */
  isAdmin() {
    return this.role === 'admin';
  }

  /**
   * Verificar si puede realizar acciones
   */
  canPerformActions() {
    return this.isActive;
  }

  /**
   * Validar datos del usuario
   */
  validate() {
    const errors = [];
    if (!this.name || this.name.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }
    if (!this.lastname || this.lastname.trim().length < 2) {
      errors.push('El apellido debe tener al menos 2 caracteres');
    }
    if (!this.email || !this.isValidEmail(this.email)) {
      errors.push('El email debe ser válido');
    }
    if (this.phone && !this.isValidPhone(this.phone)) {
      errors.push('El teléfono debe tener un formato válido');
    }
    if (!['pasajero', 'conductor', 'admin'].includes(this.role)) {
      errors.push('El rol debe ser válido');
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validar email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar teléfono
   */
  isValidPhone(phone) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Convertir a JSON
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      lastname: this.lastname,
      email: this.email,
      phone: this.phone,
      role: this.role,
      isActive: this.isActive,
      avatar: this.avatar,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Crear desde JSON
   */
  static fromJSON(data) {
    return new User(data);
  }
}

export default User;
