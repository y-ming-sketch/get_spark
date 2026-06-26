"use client";

import { useTranslations } from "next-intl";
import { Mic, Volume2 } from "lucide-react";
import { useSpark } from "@/lib/store";
import { LOCALES, LOCALE_INFO } from "@/lib/i18n/locales";
import { speechLangFor } from "@/lib/voice";
import { cn } from "@/lib/utils";

export function VoicePanel() {
  const t = useTranslations("voicePanel");
  const sttLang = useSpark((s) => s.sttLang);
  const setSttLang = useSpark((s) => s.setSttLang);
  const autoSpeak = useSpark((s) => s.autoSpeak);
  const setAutoSpeak = useSpark((s) => s.setAutoSpeak);

  return (
    <div className="p-5 space-y-6">
      <section>
        <h3 className="flex items-center gap-1.5 text-base font-semibold tracking-tight">
          <Mic size={16} className="text-spark-500" />
          {t("title")}
        </h3>
        <p className="mt-1 text-sm text-ink-400 leading-relaxed">
          {t("description")}
        </p>
      </section>

      <section>
        <label className="text-sm font-medium" htmlFor="stt-lang">
          {t("language")}
        </label>
        <select
          id="stt-lang"
          value={sttLang}
          onChange={(e) => setSttLang(e.target.value)}
          className="mt-2 block w-full rounded-lg border border-cream-300 dark:border-ink-500 bg-cream-50 dark:bg-ink-800 px-3 py-2 text-sm outline-none focus:border-spark-500 focus:ring-2 focus:ring-spark-500/20"
        >
          <option value="auto">{t("languageAuto")}</option>
          {LOCALES.map((code) => (
            <option key={code} value={speechLangFor(code)}>
              {LOCALE_INFO[code].endonym} — {speechLangFor(code)}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[11px] text-ink-400">{t("languageHint")}</p>
      </section>

      <section className="flex items-start gap-3 rounded-xl border border-cream-300 dark:border-ink-500 bg-cream-100 dark:bg-ink-800 p-4">
        <Volume2 size={16} className="mt-0.5 shrink-0 text-spark-500" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium">{t("autoSpeak")}</div>
            <button
              type="button"
              onClick={() => setAutoSpeak(!autoSpeak)}
              aria-pressed={autoSpeak}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
                autoSpeak ? "bg-spark-500" : "bg-cream-300 dark:bg-ink-500",
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                  autoSpeak ? "translate-x-4" : "translate-x-0.5",
                )}
              />
            </button>
          </div>
          <p className="mt-1 text-xs text-ink-400">{t("autoSpeakHint")}</p>
        </div>
      </section>
    </div>
  );
}
