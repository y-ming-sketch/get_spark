"use client";

import {
  useRef,
  useEffect,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { useTranslations } from "next-intl";
import { ArrowUp, Square, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  readDrop,
  type Attachment,
  type FileReadOutcome,
} from "@/lib/fileContext";
import { AttachmentChip } from "./AttachmentChip";
import { VoiceButton } from "./VoiceButton";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  isStreaming: boolean;
  attachments: Attachment[];
  onAttachmentsChange: (next: Attachment[]) => void;
}

export function MessageInput({
  value,
  onChange,
  onSubmit,
  onStop,
  isStreaming,
  attachments,
  onAttachmentsChange,
}: Props) {
  const t = useTranslations("chat");
  const tFiles = useTranslations("files");
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragOver, setDragOver] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [value]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && (value.trim() || attachments.length > 0)) onSubmit();
    }
  };

  const canSend =
    !isStreaming && (value.trim().length > 0 || attachments.length > 0);

  /** Handle a batch of read outcomes — accept ok, surface first warning. */
  const ingest = (outcomes: FileReadOutcome[]) => {
    const newOnes: Attachment[] = [];
    let firstError: string | null = null;
    for (const o of outcomes) {
      if (o.kind === "ok") newOnes.push(o.attachment);
      else if (!firstError) {
        firstError =
          o.kind === "too-large"
            ? tFiles("tooLarge", { name: o.name })
            : tFiles("binary", { name: o.name });
      }
    }
    if (newOnes.length > 0) {
      onAttachmentsChange([...attachments, ...newOnes]);
    }
    setWarning(firstError);
    if (firstError) setTimeout(() => setWarning(null), 4000);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const outcomes = await readDrop(e.dataTransfer.items, e.dataTransfer.files);
    ingest(outcomes);
  };

  const handlePicker = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const outcomes: FileReadOutcome[] = [];
    for (let i = 0; i < files.length; i += 1) {
      const { readFile } = await import("@/lib/fileContext");
      outcomes.push(await readFile(files[i]));
    }
    ingest(outcomes);
    // Reset so the same file can be re-picked later
    e.target.value = "";
  };

  const removeAttachment = (id: string) => {
    onAttachmentsChange(attachments.filter((a) => a.id !== id));
  };

  const handleVoice = (text: string, isFinal: boolean) => {
    if (!text) return;
    if (isFinal) {
      const combined = value ? `${value.trimEnd()} ${text.trim()}` : text.trim();
      onChange(combined.trim() + " ");
    } else {
      // Replace prior interim with new interim so the textarea shows live
      // dictation. We append to the existing committed value when the user
      // continues typing after dictation finalizes.
      onChange((value.endsWith(" ") || !value ? value : value + " ") + text);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-4">
      {/* Attachment chips */}
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {attachments.map((a) => (
            <AttachmentChip
              key={a.id}
              attachment={a}
              onRemove={() => removeAttachment(a.id)}
            />
          ))}
        </div>
      )}

      {warning && (
        <p
          role="alert"
          className="mb-2 rounded-lg border border-spark-500/40 bg-spark-500/5 px-3 py-1.5 text-xs text-spark-600 dark:text-spark-400"
        >
          {warning}
        </p>
      )}

      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          // Only clear when leaving the wrapper itself
          if (e.currentTarget.contains(e.relatedTarget as Node)) return;
          setDragOver(false);
        }}
        onDrop={handleDrop}
        className={cn(
          "relative rounded-3xl border border-cream-300 dark:border-ink-500 bg-cream-50 dark:bg-ink-700 shadow-sm focus-within:border-spark-500 focus-within:ring-2 focus-within:ring-spark-500/20 transition-all",
          dragOver && "ring-2 ring-spark-500 border-spark-500",
        )}
      >
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          placeholder={t("messagePlaceholder")}
          rows={1}
          className="w-full resize-none bg-transparent px-5 py-4 pe-28 ps-12 text-[15px] leading-6 outline-none placeholder:text-ink-400 scrollbar-thin"
        />

        {/* Left actions: attach */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label={tFiles("attachAria")}
          className="absolute bottom-2.5 start-2.5 flex h-8 w-8 items-center justify-center rounded-full text-ink-400 hover:bg-cream-200 dark:hover:bg-ink-600 hover:text-ink-700 dark:hover:text-ink-100 transition-colors"
        >
          <Paperclip size={14} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handlePicker}
        />

        {/* Right actions: mic + send */}
        <div className="absolute bottom-2.5 end-2.5 flex items-center gap-1">
          <VoiceButton onTranscript={handleVoice} disabled={isStreaming} />
          <button
            onClick={() => (isStreaming ? onStop() : onSubmit())}
            disabled={!isStreaming && !canSend}
            aria-label={isStreaming ? t("stopAria") : t("sendAria")}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full transition-all",
              isStreaming
                ? "bg-ink-700 dark:bg-ink-200 text-white dark:text-ink-700 hover:opacity-90"
                : canSend
                  ? "bg-spark-500 text-white hover:bg-spark-600"
                  : "bg-cream-200 dark:bg-ink-600 text-ink-400 cursor-not-allowed",
            )}
          >
            {isStreaming ? <Square size={14} fill="currentColor" /> : <ArrowUp size={18} />}
          </button>
        </div>

        {dragOver && (
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-3xl bg-spark-500/10 text-sm font-medium text-spark-600 dark:text-spark-400"
          >
            {tFiles("dropHere")}
          </div>
        )}
      </div>

      <p className="mt-2 text-center text-[11px] text-ink-400">
        {t("disclaimer")}
      </p>
    </div>
  );
}
