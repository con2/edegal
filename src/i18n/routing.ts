import { defineRouting } from "next-intl/routing";
import { supportedLanguages, defaultLanguage } from "@/i18n/locales";

export const routing = defineRouting({
  locales: supportedLanguages,
  defaultLocale: defaultLanguage,
  localePrefix: "never",
});
