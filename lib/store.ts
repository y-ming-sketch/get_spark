"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Conversation, Message, ModelId } from "./types";
import { deriveTitle } from "./utils";

interface SparkState {
  conversations: Conversation[];
  activeId: string | null;
  model: ModelId;
  theme: "light" | "dark" | "system";
  hydrated: boolean;

  // BYOK settings — the real key lives in the encrypted keystore (lib/keystore).
  // We persist only a presence flag + base URL override so the UI can render
  // synchronously on mount without awaiting WebCrypto.
  hasApiKey: boolean;
  baseUrl: string;
  /** When set, the chat UI shows the welcome / API-key entry screen. */
  needsOnboarding: boolean;

  // Model behavior — these flow into every chat request
  temperature: number;
  /** Null means "use DEFAULT_SYSTEM_PROMPT". Empty string is allowed. */
  customSystemPrompt: string | null;

  // Voice preferences
  /** Either "auto" (use UI locale) or a BCP-47 tag like "en-US". */
  sttLang: string;
  /** When true, every assistant reply is read aloud automatically. */
  autoSpeak: boolean;

  // selectors
  getActive: () => Conversation | undefined;

  // actions
  setHydrated: () => void;
  newConversation: () => string;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  clearAll: () => void;

  addMessage: (conversationId: string, msg: Message) => void;
  updateMessage: (
    conversationId: string,
    messageId: string,
    patch: Partial<Message>,
  ) => void;
  appendToMessage: (
    conversationId: string,
    messageId: string,
    chunk: string,
  ) => void;
  removeMessage: (conversationId: string, messageId: string) => void;
  /** Remove the last assistant message in a conversation (for regenerate). */
  removeLastAssistant: (conversationId: string) => void;

  setModel: (m: ModelId) => void;
  setTheme: (t: "light" | "dark" | "system") => void;

  setHasApiKey: (v: boolean) => void;
  setBaseUrl: (v: string) => void;
  setNeedsOnboarding: (v: boolean) => void;

  setTemperature: (n: number) => void;
  setCustomSystemPrompt: (v: string | null) => void;

  setSttLang: (v: string) => void;
  setAutoSpeak: (v: boolean) => void;
}

function makeConversation(model: ModelId): Conversation {
  const now = Date.now();
  return {
    id: nanoid(10),
    title: "New chat",
    messages: [],
    createdAt: now,
    updatedAt: now,
    model,
  };
}

export const useSpark = create<SparkState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeId: null,
      model: "deepseek-chat",
      theme: "system",
      hydrated: false,

      hasApiKey: false,
      baseUrl: "https://api.deepseek.com/v1",
      needsOnboarding: false,

      temperature: 0.7,
      customSystemPrompt: null,

      sttLang: "auto",
      autoSpeak: false,

      getActive: () => {
        const { conversations, activeId } = get();
        return conversations.find((c) => c.id === activeId);
      },

      setHydrated: () => set({ hydrated: true }),

      newConversation: () => {
        const convo = makeConversation(get().model);
        set((s) => ({
          conversations: [convo, ...s.conversations],
          activeId: convo.id,
        }));
        return convo.id;
      },

      selectConversation: (id) => set({ activeId: id }),

      deleteConversation: (id) =>
        set((s) => {
          const remaining = s.conversations.filter((c) => c.id !== id);
          const nextActive =
            s.activeId === id ? remaining[0]?.id ?? null : s.activeId;
          return { conversations: remaining, activeId: nextActive };
        }),

      renameConversation: (id, title) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, title, updatedAt: Date.now() } : c,
          ),
        })),

      clearAll: () => set({ conversations: [], activeId: null }),

      addMessage: (conversationId, msg) =>
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== conversationId) return c;
            const messages = [...c.messages, msg];
            // auto-title on first user message
            const title =
              c.title === "New chat" && msg.role === "user"
                ? deriveTitle(msg.content)
                : c.title;
            return { ...c, messages, title, updatedAt: Date.now() };
          }),
        })),

      updateMessage: (conversationId, messageId, patch) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId ? { ...m, ...patch } : m,
                  ),
                  updatedAt: Date.now(),
                }
              : c,
          ),
        })),

      appendToMessage: (conversationId, messageId, chunk) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId
                      ? { ...m, content: m.content + chunk }
                      : m,
                  ),
                  updatedAt: Date.now(),
                }
              : c,
          ),
        })),

      removeMessage: (conversationId, messageId) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.filter((m) => m.id !== messageId),
                  updatedAt: Date.now(),
                }
              : c,
          ),
        })),

      removeLastAssistant: (conversationId) =>
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== conversationId) return c;
            const idx = [...c.messages]
              .reverse()
              .findIndex((m) => m.role === "assistant");
            if (idx === -1) return c;
            const realIdx = c.messages.length - 1 - idx;
            return {
              ...c,
              messages: c.messages.filter((_, i) => i !== realIdx),
              updatedAt: Date.now(),
            };
          }),
        })),

      setModel: (m) => set({ model: m }),
      setTheme: (t) => set({ theme: t }),

      setHasApiKey: (v) => set({ hasApiKey: v }),
      setBaseUrl: (v) => set({ baseUrl: v }),
      setNeedsOnboarding: (v) => set({ needsOnboarding: v }),

      setTemperature: (n) =>
        set({ temperature: Math.max(0, Math.min(2, n)) }),
      setCustomSystemPrompt: (v) => set({ customSystemPrompt: v }),

      setSttLang: (v) => set({ sttLang: v }),
      setAutoSpeak: (v) => set({ autoSpeak: v }),
    }),
    {
      name: "spark-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        conversations: s.conversations,
        activeId: s.activeId,
        model: s.model,
        theme: s.theme,
        hasApiKey: s.hasApiKey,
        baseUrl: s.baseUrl,
        temperature: s.temperature,
        customSystemPrompt: s.customSystemPrompt,
        sttLang: s.sttLang,
        autoSpeak: s.autoSpeak,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
