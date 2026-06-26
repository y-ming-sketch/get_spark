"use client";

import { useState, type ReactNode } from "react";
import { KeyRound, Info } from "lucide-react";
import { Modal } from "../ui/Modal";
import { ApiKeyPanel } from "./ApiKeyPanel";
import { AboutPanel } from "./AboutPanel";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  /** When true, hide the close button (used during first-launch onboarding). */
  blocking?: boolean;
  initialTab?: TabId;
}

type TabId = "api-key" | "about";

interface Tab {
  id: TabId;
  label: string;
  icon: ReactNode;
  render: () => ReactNode;
}

const TABS: Tab[] = [
  {
    id: "api-key",
    label: "API key",
    icon: <KeyRound size={14} />,
    render: () => <ApiKeyPanel />,
  },
  {
    id: "about",
    label: "About",
    icon: <Info size={14} />,
    render: () => <AboutPanel />,
  },
];

export function SettingsModal({
  open,
  onClose,
  blocking = false,
  initialTab = "api-key",
}: Props) {
  const [tabId, setTabId] = useState<TabId>(initialTab);
  const active = TABS.find((t) => t.id === tabId) ?? TABS[0];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Settings"
      dismissible={!blocking}
      aside={
        <ul className="space-y-0.5">
          {TABS.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => setTabId(t.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors",
                  tabId === t.id
                    ? "bg-cream-200 dark:bg-ink-600 text-ink-700 dark:text-ink-50"
                    : "text-ink-400 hover:bg-cream-200/60 dark:hover:bg-ink-700 hover:text-ink-700 dark:hover:text-ink-100",
                )}
              >
                {t.icon}
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      }
      className="md:min-h-[520px]"
    >
      {/* Mobile tab bar */}
      <div className="flex md:hidden border-b border-cream-300 dark:border-ink-500 bg-cream-100 dark:bg-ink-800 px-2 py-2 gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTabId(t.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors",
              tabId === t.id
                ? "bg-cream-50 dark:bg-ink-700"
                : "text-ink-400 hover:text-ink-700 dark:hover:text-ink-100",
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      {active.render()}
    </Modal>
  );
}
