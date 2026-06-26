import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  pickLocaleFromAcceptLanguage,
} from "@/lib/i18n/locales";

/**
 * Per-request locale resolution (server-side).
 *
 * Priority:
 *   1. `spark-locale` cookie (the user's explicit choice in Settings)
 *   2. `Accept-Language` header (best supported match)
 *   3. DEFAULT_LOCALE
 *
 * Messages live in /messages/<locale>.json and are imported dynamically
 * so each route only ships the active locale's strings to the client.
 */
export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  const accept = headers().get("accept-language");

  const locale = isLocale(fromCookie)
    ? fromCookie
    : pickLocaleFromAcceptLanguage(accept);

  // Dynamic import — webpack bundle-splits per locale automatically.
  const messages = (
    await import(`@/messages/${locale}.json`).catch(
      () => import(`@/messages/${DEFAULT_LOCALE}.json`),
    )
  ).default;

  return { locale, messages };
});
