"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/providers/locale-provider";
import { LOCALES, type Locale } from "@/i18n";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  variant?: "compact" | "full";
  className?: string;
}

export function LanguageSwitcher({ variant = "compact", className }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useTranslation();

  if (variant === "full") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {LOCALES.map((l) => (
          <Button
            key={l.code}
            type="button"
            variant={locale === l.code ? "default" : "outline"}
            size="sm"
            onClick={() => setLocale(l.code)}
            className="gap-2"
          >
            <Languages className="size-4" />
            {l.nativeLabel}
          </Button>
        ))}
      </div>
    );
  }

  const next: Locale = locale === "en" ? "ar" : "en";

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => setLocale(next)}
      className={cn("gap-1.5 px-2 font-medium", className)}
      aria-label={t("common.language")}
    >
      <Languages className="size-4" />
      <span className="text-xs">{locale === "en" ? "عربي" : "EN"}</span>
    </Button>
  );
}
