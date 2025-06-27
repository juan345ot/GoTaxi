// Simulación de autenticación
export const loginUser = async (email, password) => {
  // En el futuro se conectará con un backend
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email && password) {
        resolve({ token: 'fake-jwt-token', user: { email } });
      } else {
        reject('Credenciales inválidas');
      }
    }, 1000);
  });
};

export const registerUser = async (email, password) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1000);
  });
};
