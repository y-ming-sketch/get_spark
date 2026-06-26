"use client";

import { useTranslations } from "next-intl";
import { Github, X } from "lucide-react";
import { useSpark } from "@/lib/store";

interface Props {
  onOpenSettings: () => void;
}

/**
 * Small chip rendered in the chat header when a GitHub repo is connected.
 * Tapping the chip opens Settings → Connections; the X disconnects.
 */
export function RepoContextChip({ onOpenSettings }: Props) {
  const t = useTranslations("connections");
  const activeRepo = useSpark((s) => s.activeRepo);
  const setActiveRepo = useSpark((s) => s.setActiveRepo);

  if (!activeRepo) return null;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 dark:border-ink-500 bg-cream-100 dark:bg-ink-700 ps-2 pe-1 py-0.5">
      <button
        onClick={onOpenSettings}
        className="flex items-center gap-1.5 text-[11px] font-mono text-ink-500 dark:text-ink-100 hover:text-spark-500"
      >
        <Github size={11} className="shrink-0 text-spark-500" />
        <span className="max-w-[10rem] truncate">{activeRepo.fullName}</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveRepo(null)}
        aria-label={t("disconnect")}
        className="ms-0.5 flex h-4 w-4 items-center justify-center rounded-full text-ink-400 hover:bg-cream-200 dark:hover:bg-ink-600 hover:text-spark-500"
      >
        <X size={9} />
      </button>
    </div>
  );
}
