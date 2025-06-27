/**
 * Simula inicio de sesión
 */
export const loginUser = async (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email && password) {
        resolve({ email, name: 'Juan' });
      } else {
        reject('Credenciales inválidas');
      }
    }, 1000);
  });
};

/**
 * Simula registro de usuario
 */
export const registerUser = async (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email && password.length >= 6) {
        resolve({ email, name: 'Nuevo Usuario' });
      } else {
        reject('Error al registrar');
      }
    }, 1000);
  });
};