"use client";

import { useEffect } from "react";
import { useSpark } from "@/lib/store";
import { keystore, SECRET_KEYS } from "@/lib/keystore";

/**
 * Runs once after Zustand hydrates and reconciles two facts:
 *   - the persisted `hasApiKey` flag (drives synchronous UI),
 *   - what the encrypted keystore actually contains (the source of truth).
 *
 * If they disagree (e.g. user wiped localStorage, or this is a first launch),
 * we update `hasApiKey` and trigger onboarding when no key is found.
 */
export function KeystoreBootstrap() {
  const hydrated = useSpark((s) => s.hydrated);
  const setHasApiKey = useSpark((s) => s.setHasApiKey);
  const setBaseUrl = useSpark((s) => s.setBaseUrl);
  const setNeedsOnboarding = useSpark((s) => s.setNeedsOnboarding);

  useEffect(() => {
    if (!hydrated) return;
    if (!keystore.available()) return;
    let cancelled = false;
    (async () => {
      const key = await keystore.get(SECRET_KEYS.DEEPSEEK_API_KEY);
      const url = await keystore.get(SECRET_KEYS.DEEPSEEK_BASE_URL);
      if (cancelled) return;

      const hasKey = Boolean(key);
      setHasApiKey(hasKey);
      if (url) setBaseUrl(url);

      // First launch / wiped store: gate the chat behind the welcome screen.
      if (!hasKey) {
        setNeedsOnboarding(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, setHasApiKey, setBaseUrl, setNeedsOnboarding]);

  return null;
}
