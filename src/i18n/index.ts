import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { enTranslations, RTL_LANGUAGES, translationsMap } from './translations';

// Initialize i18next resources
const resources: Record<string, { translation: typeof enTranslations }> = {};

Object.keys(translationsMap).forEach((lang) => {
  resources[lang] = {
    translation: translationsMap[lang],
  };
});

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export const setAppLanguage = (lang: string) => {
  i18n.changeLanguage(lang);
  const isRTL = RTL_LANGUAGES.includes(lang);
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
  try {
    localStorage.setItem('harmona_locale', lang);
  } catch (e) {
    // Ignore storage errors
  }
};

// Apply initial RTL check
const currentLang = i18n.language || 'en';
const baseLang = currentLang.split('-')[0];
if (RTL_LANGUAGES.includes(currentLang) || RTL_LANGUAGES.includes(baseLang)) {
  document.documentElement.dir = 'rtl';
} else {
  document.documentElement.dir = 'ltr';
}

export default i18n;
