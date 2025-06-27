import React, { createContext, useState } from 'react';
import { showToast } from '../utils/toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Simulación de login
      await new Promise((res) => setTimeout(res, 1000));
      setUser({ email, name: 'Juan' });
      showToast('Sesión iniciada');
    } catch (err) {
      showToast('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password) => {
    setLoading(true);
    try {
      // Simulación de registro
      await new Promise((res) => setTimeout(res, 1000));
      setUser({ email, name: 'Nuevo Usuario' });
      showToast('Cuenta creada');
    } catch (err) {
      showToast('Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    showToast('Sesión cerrada');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
