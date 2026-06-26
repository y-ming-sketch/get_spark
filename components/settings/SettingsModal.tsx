"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  KeyRound,
  Cpu,
  Globe,
  MessageSquareCode,
  Mic,
  Plug,
  Info,
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { ApiKeyPanel } from "./ApiKeyPanel";
import { ModelPanel } from "./ModelPanel";
import { LanguagePanel } from "./LanguagePanel";
import { PromptPanel } from "./PromptPanel";
import { VoicePanel } from "./VoicePanel";
import { ConnectionsPanel } from "./ConnectionsPanel";
import { AboutPanel } from "./AboutPanel";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  /** When true, hide the close button (used during first-launch onboarding). */
  blocking?: boolean;
  initialTab?: TabId;
}

type TabId =
  | "api-key"
  | "model"
  | "language"
  | "prompt"
  | "voice"
  | "connections"
  | "about";

interface Tab {
  id: TabId;
  labelKey:
    | "tabApiKey"
    | "tabModel"
    | "tabLanguage"
    | "tabPrompt"
    | "tabVoice"
    | "tabConnections"
    | "tabAbout";
  icon: ReactNode;
  render: () => ReactNode;
}

const TABS: Tab[] = [
  { id: "api-key", labelKey: "tabApiKey", icon: <KeyRound size={14} />, render: () => <ApiKeyPanel /> },
  { id: "model", labelKey: "tabModel", icon: <Cpu size={14} />, render: () => <ModelPanel /> },
  { id: "language", labelKey: "tabLanguage", icon: <Globe size={14} />, render: () => <LanguagePanel /> },
  { id: "prompt", labelKey: "tabPrompt", icon: <MessageSquareCode size={14} />, render: () => <PromptPanel /> },
  { id: "voice", labelKey: "tabVoice", icon: <Mic size={14} />, render: () => <VoicePanel /> },
  { id: "connections", labelKey: "tabConnections", icon: <Plug size={14} />, render: () => <ConnectionsPanel /> },
  { id: "about", labelKey: "tabAbout", icon: <Info size={14} />, render: () => <AboutPanel /> },
];

export function SettingsModal({
  open,
  onClose,
  blocking = false,
  initialTab = "api-key",
}: Props) {
  const t = useTranslations("settings");
  const [tabId, setTabId] = useState<TabId>(initialTab);
  const active = TABS.find((tab) => tab.id === tabId) ?? TABS[0];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("title")}
      dismissible={!blocking}
      aside={
        <ul className="space-y-0.5">
          {TABS.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => setTabId(tab.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors",
                  tabId === tab.id
                    ? "bg-cream-200 dark:bg-ink-600 text-ink-700 dark:text-ink-50"
                    : "text-ink-400 hover:bg-cream-200/60 dark:hover:bg-ink-700 hover:text-ink-700 dark:hover:text-ink-100",
                )}
              >
                {tab.icon}
                {t(tab.labelKey)}
              </button>
            </li>
          ))}
        </ul>
      }
      className="md:min-h-[560px]"
    >
      {/* Mobile tab bar — horizontally scrollable to fit 5 tabs */}
      <div className="flex md:hidden border-b border-cream-300 dark:border-ink-500 bg-cream-100 dark:bg-ink-800 px-2 py-2 gap-1 overflow-x-auto scrollbar-thin">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTabId(tab.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
              tabId === tab.id
                ? "bg-cream-50 dark:bg-ink-700"
                : "text-ink-400 hover:text-ink-700 dark:hover:text-ink-100",
            )}
          >
            {tab.icon} {t(tab.labelKey)}
          </button>
        ))}
      </div>
      {active.render()}
    </Modal>
  );
}
