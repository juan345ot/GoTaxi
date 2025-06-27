export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidPassword = (password) => {
  return password.length >= 6;
};

export const isFieldFilled = (value) => {
  return value.trim().length > 0;
};