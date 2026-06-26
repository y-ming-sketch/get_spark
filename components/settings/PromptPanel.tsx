"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { MessageSquareCode, RotateCcw, Check } from "lucide-react";
import { useSpark } from "@/lib/store";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/types";

export function PromptPanel() {
  const t = useTranslations("prompt");
  const stored = useSpark((s) => s.customSystemPrompt);
  const setStored = useSpark((s) => s.setCustomSystemPrompt);

  const [draft, setDraft] = useState<string>(stored ?? DEFAULT_SYSTEM_PROMPT);
  const [savedFlash, setSavedFlash] = useState(false);

  // Sync local draft when the persisted value changes elsewhere (e.g. reset).
  useEffect(() => {
    setDraft(stored ?? DEFAULT_SYSTEM_PROMPT);
  }, [stored]);

  const dirty = draft !== (stored ?? DEFAULT_SYSTEM_PROMPT);

  const handleSave = () => {
    // Save as null when the draft matches the default so we can detect
    // "user is using the default" and not bloat the persisted store.
    if (draft.trim() === DEFAULT_SYSTEM_PROMPT.trim()) {
      setStored(null);
    } else {
      setStored(draft);
    }
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  const handleReset = () => {
    setStored(null);
    setDraft(DEFAULT_SYSTEM_PROMPT);
  };

  return (
    <div className="p-5 space-y-4">
      <section>
        <h3 className="flex items-center gap-1.5 text-base font-semibold tracking-tight">
          <MessageSquareCode size={16} className="text-spark-500" />
          {t("title")}
        </h3>
        <p className="mt-1 text-sm text-ink-400 leading-relaxed">
          {t("description")}
        </p>
      </section>

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={t("placeholder")}
        rows={10}
        spellCheck={false}
        className="w-full rounded-xl border border-cream-300 dark:border-ink-500 bg-cream-50 dark:bg-ink-800 px-3 py-2 text-sm font-mono leading-relaxed outline-none focus:border-spark-500 focus:ring-2 focus:ring-spark-500/20 resize-y min-h-[160px] max-h-[400px] scrollbar-thin"
      />

      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={!dirty}
          className="inline-flex items-center gap-1.5 rounded-lg bg-spark-500 px-4 py-2 text-sm font-medium text-white hover:bg-spark-600 transition-colors disabled:bg-cream-200 dark:disabled:bg-ink-600 disabled:text-ink-400 disabled:cursor-not-allowed"
        >
          {savedFlash ? (
            <>
              <Check size={14} /> {t("savedAt")}
            </>
          ) : (
            <>
              <Check size={14} /> {t("savedAt")}
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          disabled={stored === null && draft === DEFAULT_SYSTEM_PROMPT}
          className="inline-flex items-center gap-1.5 rounded-lg border border-cream-300 dark:border-ink-500 px-3 py-2 text-sm text-ink-500 dark:text-ink-100 hover:bg-cream-100 dark:hover:bg-ink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw size={14} />
          {t("reset")}
        </button>
      </div>
    </div>
  );
}
