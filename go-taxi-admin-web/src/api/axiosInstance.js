import axios from "axios";

// Puedes pasar una función de logout global en el front (contexto Auth)
let logoutCallback = null;

export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Interceptor para requests (por si en el futuro necesitas agregar JWT)
axiosInstance.interceptors.request.use(
  (config) => {
    // Si implementás tokens personalizados en el futuro:
    // const token = localStorage.getItem("token");
    // if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuestas
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Cierre de sesión global
      if (typeof logoutCallback === "function") logoutCallback();
      window.location = "/";
    }
    // Manejo para errores 403 (prohibido/acceso denegado)
    if (error.response?.status === 403) {
      // Puedes mostrar un toaster global acá si usás uno
      // toast.error("No tienes permisos para esta acción");
    }
    // Para refrescar token automático, acá podrías hacer una lógica de refresh.
    return Promise.reject(error);
  }
);

export default axiosInstance;
