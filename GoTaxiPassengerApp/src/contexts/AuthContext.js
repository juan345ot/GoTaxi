import React, { createContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth'; // Debe existir este archivo con login/register/profile usando httpClient.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from '../utils/toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mantener sesión con JWT
  useEffect(() => {
    const loadSession = async () => {
      const savedToken = await AsyncStorage.getItem('token');
      if (savedToken) {
        try {
          const userData = await authApi.getProfile(savedToken);
          setUser(userData);
        } catch (e) {
          setUser(null);
          await AsyncStorage.removeItem('token');
        }
      }
    };
    loadSession();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      await AsyncStorage.setItem('token', data.token);
      setUser(data.user);
      showToast('Sesión iniciada');
    } catch (err) {
      showToast('Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const data = await authApi.register(formData);
      await AsyncStorage.setItem('token', data.token);
      setUser(data.user);
      showToast('Cuenta creada');
    } catch (err) {
      showToast('Error al registrarse');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('token');
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