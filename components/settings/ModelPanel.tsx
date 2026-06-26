"use client";

import { useTranslations } from "next-intl";
import { Cpu, Thermometer, Check } from "lucide-react";
import { useSpark } from "@/lib/store";
import { MODELS, type ModelId } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ModelPanel() {
  const t = useTranslations("model");
  const model = useSpark((s) => s.model);
  const setModel = useSpark((s) => s.setModel);
  const temperature = useSpark((s) => s.temperature);
  const setTemperature = useSpark((s) => s.setTemperature);

  return (
    <div className="p-5 space-y-6">
      <section>
        <h3 className="flex items-center gap-1.5 text-base font-semibold tracking-tight">
          <Cpu size={16} className="text-spark-500" />
          {t("title")}
        </h3>
        <p className="mt-1 text-sm text-ink-400 leading-relaxed">
          {t("description")}
        </p>

        <div className="mt-3 space-y-1.5">
          {MODELS.map((m) => (
            <ModelRow
              key={m.id}
              id={m.id}
              name={t(`${m.i18nKey}Name`)}
              desc={t(`${m.i18nKey}Desc`)}
              active={m.id === model}
              onClick={() => setModel(m.id)}
            />
          ))}
        </div>
      </section>

      <section>
        <h3 className="flex items-center gap-1.5 text-base font-semibold tracking-tight">
          <Thermometer size={16} className="text-spark-500" />
          {t("temperature")}
        </h3>
        <p className="mt-1 text-sm text-ink-400 leading-relaxed">
          {t("temperatureHint")}
        </p>

        <div className="mt-3 flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="flex-1 accent-spark-500"
            aria-label={t("temperature")}
          />
          <span className="w-12 text-right font-mono text-sm tabular-nums">
            {temperature.toFixed(1)}
          </span>
        </div>
      </section>
    </div>
  );
}

function ModelRow({
  id,
  name,
  desc,
  active,
  onClick,
}: {
  id: ModelId;
  name: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
        active
          ? "border-spark-500 bg-spark-500/5"
          : "border-cream-300 dark:border-ink-500 hover:bg-cream-100 dark:hover:bg-ink-700",
      )}
      aria-pressed={active}
      data-model={id}
    >
      <span
        className={cn(
          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
          active ? "bg-spark-500" : "bg-cream-300 dark:bg-ink-500",
        )}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-medium">{name}</div>
          {active && <Check size={14} className="text-spark-500 shrink-0" />}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-400">{desc}</p>
      </div>
    </button>
  );
}
