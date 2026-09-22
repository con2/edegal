/**
 * Typesafe translations: en.ts defines the Translations type, fi.ts must implement every key.
 */

import type { Translations } from "./en";
import en from "./en";
import fi from "./fi";

export {
  type SupportedLanguage,
  supportedLanguages,
  defaultLanguage,
  isSupportedLanguage,
  toSupportedLanguage,
} from "@/i18n/locales";

import { defaultLanguage, isSupportedLanguage } from "@/i18n/locales";

export type { Translations };

export const languages = { en, fi };

export function getTranslations(language: string): Translations {
  const supportedLanguage = isSupportedLanguage(language)
    ? language
    : defaultLanguage;
  return languages[supportedLanguage];
}
