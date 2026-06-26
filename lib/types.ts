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
  name: string;
  description: string;
}

export const MODELS: ModelInfo[] = [
  {
    id: "deepseek-chat",
    name: "Spark Chat",
    description: "Fast, general-purpose conversations (DeepSeek-V3)",
  },
  {
    id: "deepseek-reasoner",
    name: "Spark Reasoner",
    description: "Step-by-step reasoning for code & complex problems (DeepSeek-R1)",
  },
];

export const SYSTEM_PROMPT = `You are Spark, a serious and helpful AI assistant.

You excel at three core domains:
1. Coding: write, review, debug, and explain code in any language.
2. SEO & content trends: surface what's relevant, ranking, and rising.
3. Lifestyle & fashion trends: report on what's popular by region/city when asked.

Style:
- Be concise, structured, and actionable.
- Use markdown: headings, lists, code blocks with language tags.
- When discussing trends, cite the time frame (e.g., "as of 2026") and acknowledge if real-time data isn't available.
- Never invent sources or links.`;
