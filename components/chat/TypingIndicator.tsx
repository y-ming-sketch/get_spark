"use client";

import { useTranslations } from "next-intl";

export function TypingIndicator() {
  const t = useTranslations("chat");
  return (
    <div
      className="flex items-center gap-1.5 px-1 py-1"
      aria-label={t("thinkingAria")}
    >
      <span className="h-2 w-2 rounded-full bg-spark-500 animate-pulse-dot" />
      <span
        className="h-2 w-2 rounded-full bg-spark-500 animate-pulse-dot"
        style={{ animationDelay: "0.15s" }}
      />
      <span
        className="h-2 w-2 rounded-full bg-spark-500 animate-pulse-dot"
        style={{ animationDelay: "0.3s" }}
      />
    </div>
  );
}
