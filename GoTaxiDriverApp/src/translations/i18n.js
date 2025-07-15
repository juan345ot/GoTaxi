import i18n from 'i18n-js';
import es from './es.json';
import en from './en.json';

i18n.translations = { es, en };
i18n.locale = 'es';
i18n.fallbacks = true;

export default i18n;
