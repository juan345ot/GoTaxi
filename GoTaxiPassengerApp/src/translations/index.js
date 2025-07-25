import * as Localization from 'expo-localization';
import i18n from 'i18n-js';

import es from './es';
import en from './en';

i18n.translations = {
  es,
  en,
};

i18n.locale = Localization.locale;
i18n.fallbacks = true;

export default i18n;