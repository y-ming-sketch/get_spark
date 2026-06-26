import { useEffect, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { KeystoreBootstrap } from "@/components/KeystoreBootstrap";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LOCALE_INFO, type Locale } from "@/lib/i18n/locales";
import { loadMessages, pickLocale } from "./loadMessages";

const STORAGE_KEY = "spark-ext-locale";

/**
 * The Spark Chrome extension lives inside a side panel. It mounts the
 * full chat plus settings + keystore bootstrap, exactly like the web
 * app — but resolves locale + messages on the client because there is
 * no Next.js server.
 *
 * Selection bridge: when the background service worker opens the panel
 * via the "Ask Spark" context menu, it stashes the selected text under
 * SELECTION_STORAGE_KEY in chrome.storage.session. We pull it on mount
 * and pass it to the chat as a starter prompt.
 */
export function App() {
  const [locale, setLocale] = useState<Locale | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true); // Side panel is narrow

  // Resolve locale once on mount, from chrome.storage.local first.
  useEffect(() => {
    (async () => {
      let stored: string | null = null;
      try {
        const all = await chrome.storage.local.get(STORAGE_KEY);
        stored = (all[STORAGE_KEY] as string | undefined) ?? null;
      } catch {
        /* fall back to navigator */
      }
      setLocale(pickLocale(stored));
    })();
  }, []);

  if (!locale) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-ink-400 text-sm">
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
          className="flex h-screen w-screen overflow-hidden bg-cream-50 dark:bg-ink-800 text-ink-700 dark:text-ink-50"
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
