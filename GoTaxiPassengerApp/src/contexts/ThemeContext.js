import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);

// Tema por defecto que siempre está disponible (fuera del componente para evitar recreación)
const defaultColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  primary: '#007AFF',
  error: '#e53935',
  success: '#00C851',
};

const darkColors = {
  background: '#1F2937',
  surface: '#374151',
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  border: '#4B5563',
  primary: '#007AFF',
  error: '#e53935',
  success: '#00C851',
};

export const ThemeProvider = ({ children }) => {
  // Inicializar con false para que el tema esté disponible inmediatamente
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar tema guardado al iniciar (en background, sin bloquear el render)
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme === 'dark') {
          setIsDarkMode(true);
        }
      } catch (error) {
        console.warn('Error cargando tema:', error);
      }
    };
    loadTheme();
  }, []);

  // Guardar tema cuando cambia
  const toggleTheme = useCallback(async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.warn('Error guardando tema:', error);
    }
  }, [isDarkMode]);

  // Asegurar que el tema siempre tenga la estructura correcta
  // El tema siempre está disponible, incluso antes de cargar desde AsyncStorage
  const theme = useMemo(() => {
    const colors = isDarkMode ? { ...darkColors } : { ...defaultColors };
    // Asegurar que todos los colores estén presentes
    return {
      isDarkMode,
      toggleTheme,
      colors: {
        background: colors.background || defaultColors.background,
        surface: colors.surface || defaultColors.surface,
        text: colors.text || defaultColors.text,
        textSecondary: colors.textSecondary || defaultColors.textSecondary,
        border: colors.border || defaultColors.border,
        primary: colors.primary || defaultColors.primary,
        error: colors.error || defaultColors.error,
        success: colors.success || defaultColors.success,
      },
    };
  }, [isDarkMode, toggleTheme]);

  const contextValue = useMemo(() => ({
    theme,
    loading,
    toggleTheme,
  }), [theme, loading, toggleTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Tema por defecto siempre disponible
const defaultThemeValue = {
  isDarkMode: false,
  toggleTheme: () => {},
  colors: defaultColors,
};

export const useTheme = () => {
  let context;
  try {
    context = useContext(ThemeContext);
  } catch (error) {
    // Si hay un error al obtener el contexto, retornar valores por defecto
    console.warn('Error obteniendo ThemeContext:', error);
    context = null;
  }
  
  // Si no hay contexto o el tema no está disponible, retornar valores por defecto
  if (!context) {
    return {
      theme: { ...defaultThemeValue },
      loading: false,
      toggleTheme: () => {},
    };
  }
  
  // Asegurar que theme y theme.colors siempre existan
  if (!context.theme) {
    context.theme = { ...defaultThemeValue };
  }
  
  if (!context.theme.colors) {
    context.theme.colors = { ...defaultColors };
  }
  
  // Asegurar que todos los colores estén presentes
  context.theme.colors = {
    ...defaultColors,
    ...context.theme.colors,
  };
  
  // Retornar una copia para evitar mutaciones
  return {
    theme: { ...context.theme },
    loading: context.loading || false,
    toggleTheme: context.toggleTheme || (() => {}),
  };
};
