export type Role = "system" | "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  /** true while the assistant is streaming this message */
  streaming?: boolean;
  /** set if the request errored */
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: ModelId;
}

export type ModelId = "deepseek-chat" | "deepseek-reasoner";

export interface ModelInfo {
  id: ModelId;
  /** Translation key under "model.<key>Name" / "model.<key>Desc" */
  i18nKey: "deepseekChat" | "deepseekReasoner";
}

export const MODELS: ModelInfo[] = [
  { id: "deepseek-chat", i18nKey: "deepseekChat" },
  { id: "deepseek-reasoner", i18nKey: "deepseekReasoner" },
];

/**
 * The default system prompt. Custom prompts in Settings replace this whole
 * string; the locale instruction is appended automatically by buildSystemPrompt.
 */
export const DEFAULT_SYSTEM_PROMPT = `You are Spark, a serious and helpful AI assistant.

You excel at three core domains:
1. Coding: write, review, debug, and explain code in any language.
2. SEO & content trends: surface what's relevant, ranking, and rising.
3. Lifestyle & fashion trends: report on what's popular by region/city when asked.

Style:
- Be concise, structured, and actionable.
- Use markdown: headings, lists, code blocks with language tags.
- When discussing trends, cite the time frame (e.g., "as of 2026") and acknowledge if real-time data isn't available.
- Never invent sources or links.`;

const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  ja: "Japanese",
  zh: "Chinese",
  ko: "Korean",
  pt: "Portuguese",
  ru: "Russian",
  ar: "Arabic",
  hi: "Hindi",
  id: "Indonesian",
};

/**
 * Compose the final system prompt for a chat turn. Appends a locale-reply
 * directive so the assistant matches the user's UI language by default,
 * but never forces it (the user can override mid-thread by asking).
 *
 * If `repoContext` is supplied (set when a GitHub repo is connected in
 * Settings → Connections), the file-tree summary is appended so the
 * assistant has workspace awareness without needing function calls yet.
 */
export function buildSystemPrompt(
  locale: string,
  customPrompt?: string | null,
  repoContext?: string | null,
): string {
  const base = (customPrompt ?? DEFAULT_SYSTEM_PROMPT).trim();
  const language = LOCALE_LABELS[locale] ?? "English";
  const replyDirective = `Reply in ${language} by default. Switch languages if the user asks or writes to you in a different language.`;
  const repoBlock = repoContext
    ? `\n\nWorkspace context:\n${repoContext}\n\nWhen the user references a file from this tree, you may quote its path. If you need the contents of a specific file the user hasn't pasted yet, ask them to attach it from the file picker.`
    : "";
  return `${base}\n\n${replyDirective}${repoBlock}`;
}

/** @deprecated use buildSystemPrompt(locale, customPrompt) instead. */
export const SYSTEM_PROMPT = DEFAULT_SYSTEM_PROMPT;
