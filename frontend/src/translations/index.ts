import * as i18n from 'i18next';
import * as BrowserLanguageDetector from 'i18next-browser-languagedetector';

import en from './en';
import fi from './fi';


export type Translations = typeof en;

const resources: i18n.Resource = { fi, en };


export default i18n
  .use(BrowserLanguageDetector)
  .init({
    fallbackLng: 'en',
    resources,
  });
