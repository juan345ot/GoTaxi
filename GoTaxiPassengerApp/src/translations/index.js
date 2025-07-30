import * as Localization from 'expo-localization';
import I18n from 'i18n-js'; // NOTA: Usa "I18n" mayúscula

import es from './es';
import en from './en';

const i18n = new I18n({
  es,
  en,
});
i18n.locale = Localization.locale;
i18n.enableFallback = true;
i18n.defaultLocale = 'es';

export default i18n;