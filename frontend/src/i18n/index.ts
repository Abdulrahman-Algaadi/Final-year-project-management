import en from "./locales/en.json";
import ar from "./locales/ar.json";

export type Locale = "en" | "ar";
export const LOCALES: { code: Locale; label: string; nativeLabel: string }[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية" },
];

export const DEFAULT_LOCALE: Locale = "en";

const dictionaries = { en, ar } as const;

export type TranslationKey = string;

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : undefined;
}

export function translate(locale: Locale, key: string, params?: Record<string, string>): string {
  const dict = dictionaries[locale] as Record<string, unknown>;
  let value = getNestedValue(dict, key) ?? getNestedValue(dictionaries.en as Record<string, unknown>, key) ?? key;

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(`{${k}}`, v);
    });
  }
  return value;
}

export function getDirection(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}
