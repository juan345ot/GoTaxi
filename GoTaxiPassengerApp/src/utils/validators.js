export const isValidEmail = (email) =>
  /^\S+@\S+\.\S+$/.test(email.toLowerCase());

export const isValidPassword = (password) => password.length >= 6;

export const isValidName = (name) => name.trim().length >= 2;

export const isFieldFilled = (value) => value && value.trim() !== '';

export const validateLogin = ({ email, password }) => {
  if (!isFieldFilled(email) || !isFieldFilled(password)) return 'Todos los campos son obligatorios';
  if (!isValidEmail(email)) return 'El email no es válido';
  if (!isValidPassword(password)) return 'La contraseña debe tener al menos 6 caracteres';
  return null;
};

export const validateRegister = ({ email, password, name }) => {
  if (!isFieldFilled(email) || !isFieldFilled(password) || !isFieldFilled(name)) {
    return 'Todos los campos son obligatorios';
  }
  if (!isValidName(name)) return 'El nombre es demasiado corto';
  if (!isValidEmail(email)) return 'El email no es válido';
  if (!isValidPassword(password)) return 'La contraseña debe tener al menos 6 caracteres';
  return null;
};