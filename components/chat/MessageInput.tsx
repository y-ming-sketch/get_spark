"use client";

import { useRef, useEffect } from "react";
import { ArrowUp, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  isStreaming: boolean;
  placeholder?: string;
}

export function MessageInput({
  value,
  onChange,
  onSubmit,
  onStop,
  isStreaming,
  placeholder = "Message Spark…",
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea up to a max height
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [value]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && value.trim()) onSubmit();
    }
  };

  const canSend = value.trim().length > 0 && !isStreaming;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-4">
      <div className="relative rounded-3xl border border-cream-300 dark:border-ink-500 bg-cream-50 dark:bg-ink-700 shadow-sm focus-within:border-spark-500 focus-within:ring-2 focus-within:ring-spark-500/20 transition-all">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          rows={1}
          className="w-full resize-none bg-transparent px-5 py-4 pr-14 text-[15px] leading-6 outline-none placeholder:text-ink-400 scrollbar-thin"
        />
        <button
          onClick={() => (isStreaming ? onStop() : onSubmit())}
          disabled={!isStreaming && !canSend}
          aria-label={isStreaming ? "Stop generating" : "Send message"}
          className={cn(
            "absolute bottom-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full transition-all",
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
      <p className="mt-2 text-center text-[11px] text-ink-400">
        Spark can make mistakes. Verify important info.
      </p>
    </div>
  );
}
