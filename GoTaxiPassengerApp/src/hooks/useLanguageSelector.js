import { useContextSelector } from './useContextSelector';
import { LanguageContext } from '../contexts/LanguageContext';

/**
 * Hook optimizado para acceder a propiedades específicas del LanguageContext
 * Evita re-renders innecesarios cuando solo cambian partes específicas del contexto
 */

// Selectors básicos
export const useLanguage = () => useContextSelector(LanguageContext, state => state.language);
export const useLanguageLoading = () => useContextSelector(LanguageContext, state => state.isLoading);
export const useLanguageError = () => useContextSelector(LanguageContext, state => state.error);

// Selectors derivados
export const useLanguageIsSpanish = () => useContextSelector(LanguageContext, state => state.isSpanish);
export const useLanguageIsEnglish = () => useContextSelector(LanguageContext, state => state.isEnglish);
export const useLanguageIsRTL = () => useContextSelector(LanguageContext, state => state.isRTL);
export const useLanguageCurrentName = () => useContextSelector(LanguageContext, state => state.currentLanguageName);
export const useLanguageHasError = () => useContextSelector(LanguageContext, state => state.hasError);

// Selector combinado para casos comunes
export const useLanguageState = () => useContextSelector(LanguageContext, state => ({
  language: state.language,
  isLoading: state.isLoading,
  error: state.error,
}));

// Selector para información de idioma
export const useLanguageInfo = () => useContextSelector(LanguageContext, state => ({
  currentLanguage: state.language,
  currentLanguageName: state.currentLanguageName,
  isSpanish: state.isSpanish,
  isEnglish: state.isEnglish,
  isRTL: state.isRTL,
  hasError: state.hasError,
  isLoading: state.isLoading,
}));

// Selectors de funciones
export const useLanguageActions = () => useContextSelector(LanguageContext, state => ({
  changeLanguage: state.changeLanguage,
  loadLanguage: state.loadLanguage,
  resetToDefault: state.resetToDefault,
  getAvailableLanguages: state.getAvailableLanguages,
  t: state.t,
}));

// Selector para traducción optimizada
export const useTranslation = () => useContextSelector(LanguageContext, state => state.t);

// Selector para idiomas disponibles
export const useAvailableLanguages = () => useContextSelector(LanguageContext, state => state.getAvailableLanguages());

// Selector para validación
export const useLanguageValidation = () => useContextSelector(LanguageContext, state => ({
  isValid: !state.hasError && !state.isLoading,
  hasError: state.hasError,
  isLoading: state.isLoading,
  canChangeLanguage: !state.isLoading && !state.hasError,
}));

// Selector para configuración de idioma
export const useLanguageConfig = () => useContextSelector(LanguageContext, state => ({
  currentLanguage: state.language,
  availableLanguages: state.getAvailableLanguages(),
  isRTL: state.isRTL,
  supportsRTL: false, // Para futuras implementaciones
}));

export default {
  useLanguage,
  useLanguageLoading,
  useLanguageError,
  useLanguageIsSpanish,
  useLanguageIsEnglish,
  useLanguageIsRTL,
  useLanguageCurrentName,
  useLanguageHasError,
  useLanguageState,
  useLanguageInfo,
  useLanguageActions,
  useTranslation,
  useAvailableLanguages,
  useLanguageValidation,
  useLanguageConfig,
};
