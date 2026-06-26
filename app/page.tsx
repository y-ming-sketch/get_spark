"use client";

import { useEffect, useState } from "react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { KeystoreBootstrap } from "@/components/KeystoreBootstrap";
import { useSpark } from "@/lib/store";

export default function Page() {
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const hydrated = useSpark((s) => s.hydrated);
  const hasApiKey = useSpark((s) => s.hasApiKey);
  const needsOnboarding = useSpark((s) => s.needsOnboarding);

  // Auto-open Settings during onboarding once hydration finishes so the
  // user can immediately paste their key from the Welcome → Add API key flow.
  useEffect(() => {
    if (hydrated && needsOnboarding && !hasApiKey && !settingsOpen) {
      // Do not auto-open — the Welcome screen has an explicit CTA. Leaving
      // this hook in place so future onboarding nudges can attach here.
    }
  }, [hydrated, needsOnboarding, hasApiKey, settingsOpen]);

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-cream-50 dark:bg-ink-800 text-ink-700 dark:text-ink-50 pt-safe pb-safe pl-safe pr-safe">
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
  );
}
