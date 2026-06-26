import { useEffect, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { KeystoreBootstrap } from "@/components/KeystoreBootstrap";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LOCALE_INFO, type Locale } from "@/lib/i18n/locales";
import { loadMessages, pickLocale } from "./loadMessages";
import { initNative } from "./native";

const STORAGE_KEY = "spark-mobile-locale";

/**
 * The Spark mobile app — Capacitor wraps this static bundle.
 *
 * On mount:
 *   - Resolve locale from localStorage (set by Settings → Language) or
 *     navigator.language fallback.
 *   - Boot native bridges (hide splash, sync status bar, resize for keyboard).
 *   - Render the same ChatSidebar + ChatWindow + SettingsModal as the web
 *     app — collapsed by default because phone screens are narrow.
 */
export function App() {
  const [locale, setLocale] = useState<Locale | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    void initNative();
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* fall through */
    }
    setLocale(pickLocale(stored));
  }, []);

  if (!locale) {
    return (
      <div className="flex h-full items-center justify-center text-ink-400 text-sm">
        Loading…
      </div>
    );
  }

  const dir = LOCALE_INFO[locale].dir;

  return (
    <NextIntlClientProvider locale={locale} messages={loadMessages(locale)}>
      <ThemeProvider>
        <main
          dir={dir}
          className="flex h-screen w-screen overflow-hidden bg-cream-50 dark:bg-ink-800 text-ink-700 dark:text-ink-50 pt-safe pb-safe pl-safe pr-safe"
        >
          <KeystoreBootstrap />
          <ChatSidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed((c) => !c)}
            onOpenSettings={() => setSettingsOpen(true)}
          />
          <ChatWindow onOpenSettings={() => setSettingsOpen(true)} />
          <SettingsModal
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
          />
        </main>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
