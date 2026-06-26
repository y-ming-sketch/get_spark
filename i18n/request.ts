import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  pickLocaleFromAcceptLanguage,
} from "@/lib/i18n/locales";

// next-intl's AbstractIntlMessages shape — recursive string-or-nested.
type Msg = { [key: string]: string | Msg };

/** Deep-merge two message trees. Active locale wins; English fills gaps. */
function mergeMessages(base: Msg, override: Msg): Msg {
  const result: Msg = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const existing = result[key];
    if (
      value &&
      typeof value === "object" &&
      existing &&
      typeof existing === "object"
    ) {
      result[key] = mergeMessages(existing as Msg, value as Msg);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Per-request locale resolution (server-side).
 *
 * Priority:
 *   1. `spark-locale` cookie (the user's explicit choice in Settings)
 *   2. `Accept-Language` header (best supported match)
 *   3. DEFAULT_LOCALE
 *
 * Messages: the active locale's bundle is merged on top of the English bundle
 * so any newly-added key that hasn't been translated yet falls back to English
 * instead of crashing the page.
 */
export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  const accept = headers().get("accept-language");

  const locale = isLocale(fromCookie)
    ? fromCookie
    : pickLocaleFromAcceptLanguage(accept);

  const englishMessages = (await import(`@/messages/${DEFAULT_LOCALE}.json`))
    .default as Msg;

  if (locale === DEFAULT_LOCALE) {
    return { locale, messages: englishMessages };
  }

  const localeMessages = (
    await import(`@/messages/${locale}.json`).catch(() => ({
      default: {} as Msg,
    }))
  ).default as Msg;

  return {
    locale,
    messages: mergeMessages(englishMessages, localeMessages),
  };
});
