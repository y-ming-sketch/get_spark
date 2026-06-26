import { useEffect, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { KeystoreBootstrap } from "@/components/KeystoreBootstrap";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LOCALE_INFO, type Locale } from "@/lib/i18n/locales";
import { loadMessages, pickLocale } from "./loadMessages";
import { onExtensionEvent } from "./vscodeBridge";

const STORAGE_KEY = "spark-vscode-locale";

/**
 * Spark inside VS Code. Same Chat/Sidebar/Settings shell as every other
 * surface, plus a listener for extension-pushed events:
 *
 *   spark.askSelection  — user invoked "Spark: Ask about selection"
 *   spark.attachFile    — user invoked "Spark: Attach active file"
 *
 * Theme follows VS Code via the body classes the host injects
 * (vscode-light, vscode-dark, vscode-high-contrast).
 */
export function App() {
  const [locale, setLocale] = useState<Locale | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setLocale(pickLocale(stored));

    // Force the Spark theme to follow VS Code's host theme.
    const apply = () => {
      const isDark =
        document.body.classList.contains("vscode-dark") ||
        document.body.classList.contains("vscode-high-contrast");
      document.documentElement.classList.toggle("dark", isDark);
    };
    apply();
    const obs = new MutationObserver(apply);
    obs.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  // Subscribe to one-way events from the extension (selection / file attach).
  useEffect(() => {
    const unsub = onExtensionEvent((msg) => {
      // The first iteration of this PR just acknowledges the events in
      // the console so devs can verify wiring; the full UX
      // (auto-prepend to the input, auto-attach file chip) lands in
      // the follow-up bridge polish PR.
      console.info("[Spark VS Code] extension event:", msg);
    });
    return unsub;
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
