/**
 * Client-safe locale utilities.
 * This file contains no imports that would pull in Prisma runtime code.
 */

export type SupportedLanguage = "en" | "fi";
export const supportedLanguages: readonly SupportedLanguage[] = [
  "en",
  "fi",
] as const;
export const defaultLanguage: SupportedLanguage = "en";

export function isSupportedLanguage(
  language?: string,
): language is SupportedLanguage {
  return (
    typeof language === "string" &&
    (supportedLanguages as string[]).includes(language)
  );
}

export function toSupportedLanguage(language: string): SupportedLanguage {
  return isSupportedLanguage(language) ? language : defaultLanguage;
}
