import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LegacyTranslations from './it/legacy.json';

i18n.use(initReactI18next).init({
  resources: {
    it: {
      translations: LegacyTranslations,
    },
  },
  fallbackLng: 'it',
  debug: false,
  ns: ['translations'],
  defaultNS: 'translations',
  interpolation: {
    escapeValue: false,
  },
  detection: {
    order: ['cookie'],
    lookupCookie: 'sibill_locale',
    caches: ['cookie'],
    cookieOptions: {
      httpOnly: false,
      domain: import.meta.env.VITE_COOKIES_DOMAIN,
      secure: true,
    },
  },
  react: {
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'ul', 'li'],
  },
});

export default i18n;
