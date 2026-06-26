"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Globe, Loader2 } from "lucide-react";
import { LOCALES, LOCALE_INFO, LOCALE_COOKIE, type Locale } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

/**
 * Setting the locale is a server-driven change: the request config reads the
 * cookie + Accept-Language and ships the matching message bundle. So picking
 * a language writes the cookie and reloads, which feels instant on modern
 * networks because Next caches the bundle per-locale.
 */
function setLocaleCookie(value: Locale | null) {
  if (typeof document === "undefined") return;
  if (value === null) {
    // Auto = remove cookie, fall back to Accept-Language
    document.cookie = `${LOCALE_COOKIE}=; path=/; max-age=0`;
  } else {
    // 1 year, lax — locale isn't sensitive
    document.cookie = `${LOCALE_COOKIE}=${value}; path=/; max-age=31536000; samesite=lax`;
  }
}

export function LanguagePanel() {
  const t = useTranslations("language");
  const current = useLocale() as Locale;
  const [pending, startTransition] = useTransition();
  const [picked, setPicked] = useState<Locale | "auto" | null>(null);

  const choose = (target: Locale | "auto") => {
    setPicked(target);
    setLocaleCookie(target === "auto" ? null : target);
    startTransition(() => {
      // Hard reload so getRequestConfig re-runs and the right messages stream in.
      window.location.reload();
    });
  };

  return (
    <div className="p-5 space-y-5">
      <section>
        <h3 className="flex items-center gap-1.5 text-base font-semibold tracking-tight">
          <Globe size={16} className="text-spark-500" />
          {t("title")}
        </h3>
        <p className="mt-1 text-sm text-ink-400 leading-relaxed">
          {t("description")}
        </p>
      </section>

      <section className="space-y-1">
        <LanguageRow
          label={t("auto")}
          subtitle="—"
          active={false}
          pending={pending && picked === "auto"}
          onClick={() => choose("auto")}
        />

        <div className="my-2 border-t border-cream-300 dark:border-ink-500" />

        {LOCALES.map((code) => {
          const info = LOCALE_INFO[code];
          return (
            <LanguageRow
              key={code}
              label={info.endonym}
              subtitle={info.name}
              active={code === current}
              pending={pending && picked === code}
              onClick={() => choose(code)}
            />
          );
        })}
      </section>
    </div>
  );
}

interface RowProps {
  label: string;
  subtitle: string;
  active: boolean;
  pending: boolean;
  onClick: () => void;
}

function LanguageRow({ label, subtitle, active, pending, onClick }: RowProps) {
  return (
    <button
      onClick={onClick}
      disabled={pending}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
        active
          ? "bg-cream-200 dark:bg-ink-600 text-ink-700 dark:text-ink-50"
          : "hover:bg-cream-100 dark:hover:bg-ink-700",
        pending && "opacity-70 cursor-wait",
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="truncate">{label}</div>
        {subtitle !== "—" && (
          <div className="truncate text-[11px] text-ink-400">{subtitle}</div>
        )}
      </div>
      {pending ? (
        <Loader2 size={14} className="shrink-0 animate-spin text-spark-500" />
      ) : active ? (
        <Check size={14} className="shrink-0 text-spark-500" />
      ) : null}
    </button>
  );
}
