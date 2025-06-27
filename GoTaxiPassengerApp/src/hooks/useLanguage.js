import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

export default function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe usarse dentro de LanguageProvider');
  }
  return context;
}
