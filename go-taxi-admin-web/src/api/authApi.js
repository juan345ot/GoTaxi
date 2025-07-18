// src/api/authApi.js
import axios from "./axiosInstance";

/**
 * Login de administrador.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ data?: any, error?: string }>}
 */
export const loginAdmin = async (credentials) => {
  try {
    const { data } = await axios.post("/auth/admin/login", credentials);
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error de autenticación" };
  }
};

export const logoutAdmin = async () => {
  try {
    await axios.post("/auth/admin/logout");
    return { data: true };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al cerrar sesión" };
  }
};

export const getAdminProfile = async () => {
  try {
    const { data } = await axios.get("/auth/admin/profile");
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al obtener el perfil" };
  }
};

export const updateAdminProfile = async (profileData) => {
  try {
    const { data } = await axios.put("/auth/admin/profile", profileData);
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al actualizar el perfil" };
  }
};

export const changeAdminPassword = async (passwordData) => {
  try {
    const { data } = await axios.put("/auth/admin/change-password", passwordData);
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al cambiar la contraseña" };
  }
};

export const resetAdminPassword = async (email) => {
  if (!email || !email.includes("@")) {
    return { error: "Email inválido" };
  }
  try {
    const { data } = await axios.post("/auth/admin/reset-password", { email });
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al solicitar el restablecimiento de contraseña" };
  }
};

export const verifyAdminResetToken = async (token) => {
  if (!token) return { error: "Token faltante" };
  try {
    const { data } = await axios.get(`/auth/admin/verify-reset-token/${token}`);
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al verificar el token de restablecimiento" };
  }
};

export const updateAdminPassword = async (token, newPassword) => {
  if (!token || !newPassword) return { error: "Datos incompletos" };
  try {
    const { data } = await axios.put(`/auth/admin/update-password/${token}`, { newPassword });
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al actualizar la contraseña" };
  }
};

export const getAdminPermissions = async () => {
  try {
    const { data } = await axios.get("/auth/admin/permissions");
    return { data };
  } catch (error) {
    return { error: error?.response?.data?.message || "Error al obtener los permisos" };
  }
};

/*
-------------------------
// TEST UNITARIO (ejemplo con Jest)
import { loginAdmin } from './authApi';
test('loginAdmin: error en login', async () => {
  const res = await loginAdmin({ email: "fake@admin.com", password: "fake" });
  expect(res.error).toBeDefined();
});
-------------------------
*/

