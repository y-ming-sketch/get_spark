"use client";

import { useTranslations } from "next-intl";
import { Sun, Moon, Monitor } from "lucide-react";
import { useSpark } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const t = useTranslations("theme");
  const theme = useSpark((s) => s.theme);
  const setTheme = useSpark((s) => s.setTheme);

  const options: { id: typeof theme; icon: React.ReactNode; labelKey: "light" | "system" | "dark" }[] = [
    { id: "light", icon: <Sun size={14} />, labelKey: "light" },
    { id: "system", icon: <Monitor size={14} />, labelKey: "system" },
    { id: "dark", icon: <Moon size={14} />, labelKey: "dark" },
  ];

  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-cream-300 dark:border-ink-500 bg-cream-50 dark:bg-ink-700 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => setTheme(opt.id)}
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors",
            theme === opt.id
              ? "bg-spark-500 text-white"
              : "text-ink-400 hover:text-ink-700 dark:hover:text-ink-100",
          )}
          aria-label={t(opt.labelKey)}
          title={t(opt.labelKey)}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}
