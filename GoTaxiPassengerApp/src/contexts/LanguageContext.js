import { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(i18n.locale);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const changeLanguage = useCallback(async(lang) => {
    try {
      setIsLoading(true);
      setError(null);

      i18n.locale = lang;
      setLanguage(lang);
      await AsyncStorage.setItem('appLanguage', lang);
    } catch (err) {
      setError(err.message || 'Error al cambiar idioma');
      // eslint-disable-next-line no-console
      if (__DEV__) console.error('Error changing language:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadLanguage = useCallback(async() => {
    try {
      setIsLoading(true);
      setError(null);

      const storedLang = await AsyncStorage.getItem('appLanguage');
      // Validar que Localization.locale existe antes de hacer split
      const defaultLocale = Localization.locale || 'es';
      const detectedLang = storedLang || defaultLocale.split('-')[0] || 'es';
      await changeLanguage(detectedLang);
    } catch (err) {
      setError(err.message || 'Error al cargar idioma');
      // eslint-disable-next-line no-console
      if (__DEV__) console.error('Error loading language:', err);
      // Fallback a español si hay error
      await changeLanguage('es');
    } finally {
      setIsLoading(false);
    }
  }, [changeLanguage]);

  const resetToDefault = useCallback(async() => {
    const defaultLocale = Localization.locale || 'es';
    const defaultLang = defaultLocale.split('-')[0] || 'es';
    await changeLanguage(defaultLang);
  }, [changeLanguage]);

  const getAvailableLanguages = useCallback(() => {
    return [
      { code: 'es', name: 'Español', nativeName: 'Español' },
      { code: 'en', name: 'English', nativeName: 'English' },
    ];
  }, []);

  // Memoizar selectors para evitar re-renders innecesarios
  const languageSelectors = useMemo(() => ({
    isSpanish: language === 'es',
    isEnglish: language === 'en',
    isRTL: false, // Para futuras implementaciones de idiomas RTL
    currentLanguageName: language === 'es' ? 'Español' : 'English',
    hasError: !!error,
    isLoading,
  }), [language, error, isLoading]);

  // Memoizar función de traducción optimizada
  const optimizedT = useCallback((key, options = {}) => {
    try {
      return i18n.t(key, options);
    } catch (err) {
      // eslint-disable-next-line no-console
      if (__DEV__) console.warn(`Translation key not found: ${key}`);
      return key; // Devolver la clave si no se encuentra la traducción
    }
  }, [language]);

  // Memoizar el valor del contexto
  const contextValue = useMemo(() => ({
    // Estado básico
    language,
    isLoading,
    error,

    // Selectors
    ...languageSelectors,

    // Funciones
    changeLanguage,
    loadLanguage,
    resetToDefault,
    getAvailableLanguages,
    t: optimizedT,
  }), [
    language, isLoading, error, languageSelectors, changeLanguage, loadLanguage,
    resetToDefault, getAvailableLanguages, optimizedT,
  ]);

  useEffect(() => {
    loadLanguage();
  }, [loadLanguage]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguageContext = () => useContext(LanguageContext);
