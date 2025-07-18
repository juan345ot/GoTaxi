import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

/**
 * Hook personalizado para acceder rápido a la sesión admin.
 * @returns {object} contexto de autenticación (admin, login, logout, roles, etc)
 */
export const useAuth = () => useContext(AuthContext);
