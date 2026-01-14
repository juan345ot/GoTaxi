import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as authApi from '../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from '../utils/toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // hidratar sesión al iniciar la app
  useEffect(() => {
    const initializeAuth = async() => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          setInitializing(false);
          return;
        }

        // Solo intentar obtener el perfil si hay token
        try {
          const me = await authApi.profile();
          // El backend devuelve { success: true, data: {...}, message: '...' }
          const userData = me?.data || me?.user || me;
          setUser(userData);
        } catch (profileError) {
          // Si el token es inválido o expiró, limpiar y continuar sin usuario
          if (profileError?.response?.status === 401) {
            console.warn('Token inválido o expirado, limpiando sesión');
            await AsyncStorage.removeItem('token');
            // Limpiar también el cache del token en httpClient
            const { updateTokenCache } = await import('../api/httpClient');
            await updateTokenCache();
            setUser(null);
          } else {
            throw profileError;
          }
        }
      } catch (e) {
        console.error('Error al inicializar autenticación:', e);
        // Solo limpiar el token si es un error de autenticación
        if (e?.response?.status === 401) {
          await AsyncStorage.removeItem('token');
        }
        setUser(null);
      } finally {
        setInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async(email, password) => {
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      // El backend devuelve 'accessToken', pero también puede venir como 'token'
      const token = res?.accessToken || res?.token || res?.data?.accessToken || res?.data?.token;
      const loggedUser = res?.user || res?.data?.user;

      if (token) {
        // Guardar el token primero
        await AsyncStorage.setItem('token', token);
        
        // Actualizar el cache del token en httpClient
        const { updateTokenCache } = await import('../api/httpClient');
        await updateTokenCache();
        
        // Si ya tenemos el usuario del login, usarlo directamente
        if (loggedUser) {
          setUser(loggedUser);
        } else {
          // Si no, obtener el perfil (ahora el token está en cache)
          try {
            const me = await authApi.profile();
            // El backend devuelve { success: true, data: {...}, message: '...' }
            const userData = me?.data || me?.user || me;
            setUser(userData);
          } catch (profileError) {
            // Si falla obtener el perfil pero tenemos token, usar datos básicos
            console.warn('No se pudo obtener perfil después del login:', profileError);
            // El usuario ya está autenticado, solo no tenemos sus datos completos
            setUser({ email, authenticated: true });
          }
        }
      } else {
        throw new Error('No se recibió token del servidor');
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
  }, []);

  const register = useCallback(async(payload) => {
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
  }, []);

  const logout = useCallback(async() => {
    try {
      await AsyncStorage.removeItem('token');
      setUser(null);
      showToast('Sesión cerrada');
      } catch (error) {
        // eslint-disable-next-line no-console
        if (__DEV__) console.error('Error al cerrar sesión:', error);
      // Aún así, limpiar el estado local
      setUser(null);
    }
  }, []);

  // Memoizar el valor del contexto para evitar re-renders innecesarios
  const contextValue = useMemo(() => ({
    user,
    loading,
    initializing,
    isAuthenticated: !!user,
    login,
    logout,
    register,
  }), [user, loading, initializing, login, logout, register]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
