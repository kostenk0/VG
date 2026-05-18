import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import uk from './uk.json'

export const SUPPORTED_LANGUAGES = ['en', 'uk'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: en.common,
        home: en.home,
        testimonials: en.testimonials,
        disclaimer: en.disclaimer,
      },
      uk: {
        common: uk.common,
        home: uk.home,
        testimonials: uk.testimonials,
        disclaimer: uk.disclaimer,
      },
    },
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    defaultNS: 'common',
    ns: ['common', 'home', 'testimonials', 'disclaimer'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'vg-lang',
    },
  })

export default i18n
