import en from "@/messages/en.json";
import es from "@/messages/es.json";
import fr from "@/messages/fr.json";
import de from "@/messages/de.json";
import ja from "@/messages/ja.json";
import zh from "@/messages/zh.json";
import ko from "@/messages/ko.json";
import pt from "@/messages/pt.json";
import ru from "@/messages/ru.json";
import ar from "@/messages/ar.json";
import hi from "@/messages/hi.json";
import id from "@/messages/id.json";

import {
  isLocale,
  pickLocaleFromAcceptLanguage,
  DEFAULT_LOCALE,
  type Locale,
} from "@/lib/i18n/locales";

type Msg = { [key: string]: string | Msg };

const BUNDLES: Record<Locale, Msg> = {
  en: en as unknown as Msg,
  es: es as unknown as Msg,
  fr: fr as unknown as Msg,
  de: de as unknown as Msg,
  ja: ja as unknown as Msg,
  zh: zh as unknown as Msg,
  ko: ko as unknown as Msg,
  pt: pt as unknown as Msg,
  ru: ru as unknown as Msg,
  ar: ar as unknown as Msg,
  hi: hi as unknown as Msg,
  id: id as unknown as Msg,
};

function mergeMessages(base: Msg, override: Msg): Msg {
  const out: Msg = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const existing = out[key];
    if (
      value &&
      typeof value === "object" &&
      existing &&
      typeof existing === "object"
    ) {
      out[key] = mergeMessages(existing as Msg, value as Msg);
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function pickLocale(stored: string | null): Locale {
  if (isLocale(stored)) return stored;
  if (typeof navigator !== "undefined" && navigator.language) {
    return pickLocaleFromAcceptLanguage(navigator.language);
  }
  return DEFAULT_LOCALE;
}

export function loadMessages(locale: Locale): Msg {
  if (locale === DEFAULT_LOCALE) return BUNDLES.en;
  return mergeMessages(BUNDLES.en, BUNDLES[locale]);
}
