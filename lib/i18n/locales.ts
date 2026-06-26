/**
 * Locale registry — every supported language with its display metadata.
 *
 * The keys here drive: middleware locale negotiation, the language picker
 * in Settings, the runtime `next-intl` config, and the system prompt that
 * tells the AI which language to reply in.
 */

export const LOCALES = [
  "en",
  "es",
  "fr",
  "de",
  "ja",
  "zh",
  "ko",
  "pt",
  "ru",
  "ar",
  "hi",
  "id",
] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export interface LocaleInfo {
  code: Locale;
  /** English name */
  name: string;
  /** Endonym — what speakers call the language in their own language */
  endonym: string;
  /** ltr | rtl */
  dir: "ltr" | "rtl";
}

export const LOCALE_INFO: Record<Locale, LocaleInfo> = {
  en: { code: "en", name: "English", endonym: "English", dir: "ltr" },
  es: { code: "es", name: "Spanish", endonym: "Español", dir: "ltr" },
  fr: { code: "fr", name: "French", endonym: "Français", dir: "ltr" },
  de: { code: "de", name: "German", endonym: "Deutsch", dir: "ltr" },
  ja: { code: "ja", name: "Japanese", endonym: "日本語", dir: "ltr" },
  zh: { code: "zh", name: "Chinese", endonym: "中文", dir: "ltr" },
  ko: { code: "ko", name: "Korean", endonym: "한국어", dir: "ltr" },
  pt: { code: "pt", name: "Portuguese", endonym: "Português", dir: "ltr" },
  ru: { code: "ru", name: "Russian", endonym: "Русский", dir: "ltr" },
  ar: { code: "ar", name: "Arabic", endonym: "العربية", dir: "rtl" },
  hi: { code: "hi", name: "Hindi", endonym: "हिन्दी", dir: "ltr" },
  id: { code: "id", name: "Indonesian", endonym: "Bahasa Indonesia", dir: "ltr" },
};

export function isLocale(s: string | null | undefined): s is Locale {
  return !!s && (LOCALES as readonly string[]).includes(s);
}

/**
 * Resolve a locale from a free-form Accept-Language header.
 * Returns DEFAULT_LOCALE if no supported tag matches.
 */
export function pickLocaleFromAcceptLanguage(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;
  // Each entry looks like:  "en-US,en;q=0.9,fr;q=0.8"
  const tags = header
    .split(",")
    .map((t) => {
      const [tag, q] = t.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of tags) {
    // Try exact match first, then language-only (e.g. "en-US" -> "en")
    if (isLocale(tag)) return tag;
    const lang = tag.split("-")[0];
    if (isLocale(lang)) return lang;
  }
  return DEFAULT_LOCALE;
}

export const LOCALE_COOKIE = "spark-locale";
