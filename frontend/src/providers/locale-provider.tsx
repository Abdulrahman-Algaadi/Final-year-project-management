"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { DEFAULT_LOCALE, getDirection, translate, type Locale } from "@/i18n";

const STORAGE_KEY = "fypms-locale";
const LOCALE_CHANGE_EVENT = "fypms-locale-change";

interface LocaleContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function isLocale(value: string | null): value is Locale {
  return value === "en" || value === "ar";
}

function readLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = localStorage.getItem(STORAGE_KEY);
  return isLocale(stored) ? stored : DEFAULT_LOCALE;
}

function subscribe(onStoreChange: () => void) {
  const handler = () => onStoreChange();
  window.addEventListener(LOCALE_CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(LOCALE_CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function applyDocumentLocale(locale: Locale) {
  const dir = getDirection(locale);
  document.documentElement.lang = locale;
  document.documentElement.dir = dir;
  document.body.dir = dir;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, readLocale, () => DEFAULT_LOCALE);

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem(STORAGE_KEY, next);
    applyDocumentLocale(next);
    window.dispatchEvent(new Event(LOCALE_CHANGE_EVENT));
  }, []);

  const dir = getDirection(locale);

  useLayoutEffect(() => {
    applyDocumentLocale(locale);
  }, [locale]);

  const t = useCallback(
    (key: string, params?: Record<string, string>) => translate(locale, key, params),
    [locale],
  );

  const value = useMemo(() => ({ locale, dir, setLocale, t }), [locale, dir, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

export function useTranslation() {
  const { t, locale, dir, setLocale } = useLocale();
  return { t, locale, dir, setLocale };
}
