"use client";

import { useTranslations } from "next-intl";
import { FileText, X } from "lucide-react";
import type { Attachment } from "@/lib/fileContext";

interface Props {
  attachment: Attachment;
  onRemove: () => void;
}

export function AttachmentChip({ attachment, onRemove }: Props) {
  const t = useTranslations("files");
  const sizeKb = Math.max(1, Math.round(attachment.size / 1024));

  return (
    <div className="inline-flex max-w-[14rem] items-center gap-1.5 rounded-full border border-cream-300 dark:border-ink-500 bg-cream-100 dark:bg-ink-700 ps-2 pe-1 py-1 text-xs">
      <FileText size={12} className="shrink-0 text-spark-500" />
      <span className="min-w-0 truncate font-mono text-[11px]">
        {attachment.name}
      </span>
      <span className="shrink-0 text-[10px] text-ink-400 tabular-nums">
        {sizeKb} KB
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="ms-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-ink-400 hover:bg-cream-200 dark:hover:bg-ink-600 hover:text-spark-500"
        aria-label={t("removeAria")}
      >
        <X size={10} />
      </button>
    </div>
  );
}
