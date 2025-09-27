import React, { createContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from '../utils/toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // hidratar sesión al iniciar la app
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        const me = await authApi.profile();
        setUser(me?.user || me);
      } catch (e) {
        await AsyncStorage.removeItem('token');
        setUser(null);
      }
    })();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const token = res?.token;
      const loggedUser = res?.user;
      if (token) await AsyncStorage.setItem('token', token);
      if (loggedUser) setUser(loggedUser);
      else {
        const me = await authApi.profile();
        setUser(me?.user || me);
      }
      showToast('¡Inicio de sesión exitoso!');
      return true;
    } catch (e) {
      let msg = 'No se pudo iniciar sesión';
      
      if (e?.response?.data?.message) {
        msg = e.response.data.message;
      } else if (e?.response?.data?.error) {
        msg = e.response.data.error;
      } else if (e?.message) {
        msg = e.message;
      }
      
      // Manejar errores específicos del backend
      if (msg.includes('incorrectos') || msg.includes('invalid') || msg.includes('credentials')) {
        msg = 'Email o contraseña incorrectos';
      } else if (msg.includes('validation') || msg.includes('required')) {
        msg = 'Por favor, completá todos los campos correctamente';
      } else if (msg.includes('network') || msg.includes('ECONNABORTED')) {
        msg = 'Error de conexión. Verificá tu internet';
      }
      
      showToast(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const res = await authApi.register(payload);
      showToast(res?.message || '¡Registro exitoso! Ya podés iniciar sesión');
      return true;
    } catch (e) {
      let msg = 'No se pudo registrar';
      
      if (e?.response?.data?.message) {
        msg = e.response.data.message;
      } else if (e?.response?.data?.error) {
        msg = e.response.data.error;
      } else if (e?.message) {
        msg = e.message;
      }
      
      // Manejar errores específicos del backend
      if (msg.includes('email') && msg.includes('ya está registrado')) {
        msg = 'Este correo electrónico ya está registrado';
      } else if (msg.includes('validation') || msg.includes('required')) {
        msg = 'Por favor, completá todos los campos correctamente';
      } else if (msg.includes('network') || msg.includes('ECONNABORTED')) {
        msg = 'Error de conexión. Verificá tu internet';
      }
      
      showToast(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
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
