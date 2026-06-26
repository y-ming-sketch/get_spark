"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, Code2, Sparkles, TrendingUp, MapPin } from "lucide-react";
import { nanoid } from "nanoid";
import { useSpark } from "@/lib/store";
import { SYSTEM_PROMPT, type Message } from "@/lib/types";
import { readChatStream } from "@/lib/stream";
import { cn } from "@/lib/utils";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { ModelSelector } from "./ModelSelector";
import { SparkLogo } from "../SparkLogo";

const SUGGESTIONS = [
  {
    icon: <Code2 size={16} />,
    label: "Review my code",
    prompt: "Review this code and suggest improvements:\n\n```\n// paste code here\n```",
  },
  {
    icon: <TrendingUp size={16} />,
    label: "SEO trends",
    prompt: "What are the top SEO trends and ranking factors right now?",
  },
  {
    icon: <MapPin size={16} />,
    label: "Fashion in Tokyo",
    prompt: "What are the current fashion trends in Tokyo for this season?",
  },
  {
    icon: <Sparkles size={16} />,
    label: "Explain a concept",
    prompt: "Explain async/await in JavaScript with a real-world example.",
  },
];

export function ChatWindow() {
  const hydrated = useSpark((s) => s.hydrated);
  const active = useSpark((s) => s.getActive());
  const activeId = useSpark((s) => s.activeId);
  const model = useSpark((s) => s.model);
  const newConversation = useSpark((s) => s.newConversation);
  const addMessage = useSpark((s) => s.addMessage);
  const appendToMessage = useSpark((s) => s.appendToMessage);
  const updateMessage = useSpark((s) => s.updateMessage);
  const removeLastAssistant = useSpark((s) => s.removeLastAssistant);

  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom when new content arrives, but only if user is near bottom
  const scrollToBottom = (smooth = true) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  };

  useEffect(() => {
    if (!active) return;
    const el = scrollerRef.current;
    if (!el) return;
    const nearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) scrollToBottom();
  }, [active?.messages]);

  // Track scroll position to show the "scroll to bottom" button
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBtn(dist > 200);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [activeId]);

  const handleStop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  };

  const sendMessage = async (text: string, opts?: { regenerate?: boolean }) => {
    if (!text.trim() && !opts?.regenerate) return;

    // Ensure we have an active conversation
    let convoId = activeId;
    if (!convoId) {
      convoId = newConversation();
    }

    // Snapshot conversation BEFORE we add the new user/assistant entries
    const state = useSpark.getState();
    const convoBefore = state.conversations.find((c) => c.id === convoId);
    if (!convoBefore) return;

    // Build the message list to send upstream
    const baseHistory: Message[] = convoBefore.messages.filter(
      (m) => !m.error,
    );

    let userText = text.trim();
    if (!opts?.regenerate) {
      const userMsg: Message = {
        id: nanoid(8),
        role: "user",
        content: userText,
        createdAt: Date.now(),
      };
      addMessage(convoId, userMsg);
      baseHistory.push(userMsg);
      setInput("");
    } else {
      // for regenerate, last user message is already in history
      const lastUser = [...baseHistory].reverse().find((m) => m.role === "user");
      if (!lastUser) return;
      userText = lastUser.content;
    }

    // Create the assistant placeholder
    const assistantId = nanoid(8);
    addMessage(convoId, {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: Date.now(),
      streaming: true,
    });

    setIsStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const apiMessages = [
        { role: "system" as const, content: SYSTEM_PROMPT },
        ...baseHistory.map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })),
      ];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages: apiMessages }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ error: `Request failed (${res.status})` }));
        throw new Error(err.error || `Request failed (${res.status})`);
      }

      for await (const chunk of readChatStream(res, controller.signal)) {
        appendToMessage(convoId, assistantId, chunk);
      }
      updateMessage(convoId, assistantId, { streaming: false });
    } catch (err: unknown) {
      const aborted =
        err instanceof DOMException && err.name === "AbortError";
      updateMessage(convoId, assistantId, {
        streaming: false,
        error: aborted
          ? undefined
          : err instanceof Error
            ? err.message
            : "Something went wrong.",
      });
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const handleRegenerate = () => {
    if (!activeId || isStreaming) return;
    removeLastAssistant(activeId);
    sendMessage("", { regenerate: true });
  };

  // Loading state while Zustand hydrates from localStorage
  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <SparkLogo size={28} className="text-spark-500 animate-pulse" />
      </div>
    );
  }

  const messages = active?.messages ?? [];
  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-1 flex-col bg-cream-50 dark:bg-ink-800">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-cream-300 dark:border-ink-500 px-4 py-2.5">
        <h1 className="truncate text-sm font-medium">
          {active?.title || "New chat"}
        </h1>
        <ModelSelector />
      </header>

      {/* Messages or empty state */}
      <div
        ref={scrollerRef}
        className="relative flex-1 overflow-y-auto scrollbar-thin"
      >
        {isEmpty ? (
          <EmptyState
            onPick={(prompt) => {
              setInput(prompt);
            }}
          />
        ) : (
          <div className="mx-auto w-full max-w-3xl py-4">
            {messages.map((m, i) => {
              const isLastAssistant =
                m.role === "assistant" && i === messages.length - 1;
              return (
                <MessageBubble
                  key={m.id}
                  message={m}
                  isLastAssistant={isLastAssistant && !isStreaming}
                  onRegenerate={handleRegenerate}
                />
              );
            })}
          </div>
        )}

        {showScrollBtn && (
          <button
            onClick={() => scrollToBottom()}
            className="sticky bottom-4 left-1/2 -translate-x-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-cream-300 dark:border-ink-500 bg-cream-50 dark:bg-ink-700 shadow-md hover:bg-cream-100 dark:hover:bg-ink-600 transition-colors"
            aria-label="Scroll to bottom"
          >
            <ArrowDown size={16} />
          </button>
        )}
      </div>

      {/* Input */}
      <MessageInput
        value={input}
        onChange={setInput}
        onSubmit={() => sendMessage(input)}
        onStop={handleStop}
        isStreaming={isStreaming}
      />
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 py-12">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-spark-500 text-white shadow-md">
        <SparkLogo size={28} />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight">Hello, I'm Spark.</h2>
      <p className="mt-1 text-sm text-ink-400">
        Your AI for code, trends, and everything in between.
      </p>

      <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            onClick={() => onPick(s.prompt)}
            className={cn(
              "flex items-center gap-3 rounded-xl border border-cream-300 dark:border-ink-500 bg-cream-50 dark:bg-ink-700 px-4 py-3 text-left text-sm transition-all",
              "hover:border-spark-500 hover:bg-cream-100 dark:hover:bg-ink-600",
            )}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-spark-500/10 text-spark-500">
              {s.icon}
            </span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
