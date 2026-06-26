"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Check } from "lucide-react";
import { useSpark } from "@/lib/store";
import { MODELS } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ModelSelector() {
  const t = useTranslations("model");
  const model = useSpark((s) => s.model);
  const setModel = useSpark((s) => s.setModel);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  const active = MODELS.find((m) => m.id === model) ?? MODELS[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg border border-cream-300 dark:border-ink-500 bg-cream-50 dark:bg-ink-700 px-3 py-1.5 text-sm font-medium hover:bg-cream-100 dark:hover:bg-ink-600 transition-colors"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-spark-500" />
        {t(`${active.i18nKey}Name`)}
        <ChevronDown
          size={14}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute end-0 z-20 mt-1.5 w-72 overflow-hidden rounded-xl border border-cream-300 dark:border-ink-500 bg-cream-50 dark:bg-ink-700 shadow-lg animate-fade-in">
          {MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setModel(m.id);
                setOpen(false);
              }}
              className="flex w-full items-start gap-2 px-3 py-2.5 text-start hover:bg-cream-100 dark:hover:bg-ink-600"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-spark-500" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t(`${m.i18nKey}Name`)}
                  </span>
                  {m.id === model && (
                    <Check size={14} className="text-spark-500" />
                  )}
                </div>
                <p className="text-xs text-ink-400 leading-snug mt-0.5">
                  {t(`${m.i18nKey}Desc`)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
