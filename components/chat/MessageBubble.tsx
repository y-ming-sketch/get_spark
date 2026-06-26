"use client";

import { useState } from "react";
import { Check, Copy, RotateCcw, User, AlertCircle } from "lucide-react";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { TypingIndicator } from "./TypingIndicator";
import { SparkLogo } from "../SparkLogo";

interface Props {
  message: Message;
  onRegenerate?: () => void;
  isLastAssistant?: boolean;
}

export function MessageBubble({ message, onRegenerate, isLastAssistant }: Props) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className={cn(
        "group flex w-full gap-3 px-4 py-5 animate-fade-in",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-spark-500 text-white">
          <SparkLogo size={16} />
        </div>
      )}

      <div className={cn("flex max-w-2xl flex-col", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-[15px] leading-7",
            isUser
              ? "bg-spark-500 text-white"
              : "bg-cream-100 dark:bg-ink-700 text-ink-700 dark:text-ink-50",
          )}
        >
          {message.error ? (
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle size={16} className="text-spark-500" />
              <span>{message.error}</span>
            </div>
          ) : isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : message.content ? (
            <MarkdownRenderer content={message.content} />
          ) : (
            <TypingIndicator />
          )}
        </div>

        {!isUser && message.content && !message.streaming && (
          <div className="mt-1 flex items-center gap-1 px-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-ink-400 hover:text-ink-700 dark:hover:text-ink-100"
              aria-label="Copy message"
            >
              {copied ? (
                <>
                  <Check size={12} /> Copied
                </>
              ) : (
                <>
                  <Copy size={12} /> Copy
                </>
              )}
            </button>
            {isLastAssistant && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-ink-400 hover:text-ink-700 dark:hover:text-ink-100"
                aria-label="Regenerate response"
              >
                <RotateCcw size={12} /> Regenerate
              </button>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream-200 dark:bg-ink-600 text-ink-500 dark:text-ink-100">
          <User size={16} />
        </div>
      )}
    </div>
  );
}
