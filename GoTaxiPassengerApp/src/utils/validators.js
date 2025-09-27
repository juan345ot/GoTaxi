const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function required(value, field = 'Campo') {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${field} es obligatorio`;
  }
  return null;
}

export function isEmail(value) {
  if (!emailRegex.test(String(value).trim())) {
    return 'Email inválido';
  }
  return null;
}

export function minLength(value, len, field = 'Campo') {
  if (String(value).length < len) {
    return `${field} debe tener al menos ${len} caracteres`;
  }
  return null;
}

export function validateRegister({ name, email, password }) {
  return (
    required(name, 'Nombre') ||
    required(email, 'Email') ||
    isEmail(email) ||
    required(password, 'Contraseña') ||
    minLength(password, 6, 'Contraseña')
  );
}

export function validateLogin({ email, password }) {
  return (
    required(email, 'Email') ||
    isEmail(email) ||
    required(password, 'Contraseña') ||
    minLength(password, 6, 'Contraseña')
  );
}