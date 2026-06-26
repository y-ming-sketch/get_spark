"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useSpark } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const theme = useSpark((s) => s.theme);
  const setTheme = useSpark((s) => s.setTheme);

  const options: { id: typeof theme; icon: React.ReactNode; label: string }[] = [
    { id: "light", icon: <Sun size={14} />, label: "Light" },
    { id: "system", icon: <Monitor size={14} />, label: "System" },
    { id: "dark", icon: <Moon size={14} />, label: "Dark" },
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
          aria-label={`${opt.label} theme`}
          title={`${opt.label} theme`}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}
