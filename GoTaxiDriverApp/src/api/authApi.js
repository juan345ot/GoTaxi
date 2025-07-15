// Aquí va la integración real con backend cuando esté listo
export const loginDriver = async (email, password) => {
  // Ejemplo:
  // return await fetch('/api/driver/login', { ... });
  return { success: true, token: "mock-token" };
};

export const registerDriver = async (data) => {
  // data: {name, email, password, documentos...}
  return { success: true };
};
