/**
 * chatClient — runtime-aware streaming chat dispatcher.
 *
 * In the **web/PWA** runtime this POSTs to /api/chat (Edge runtime proxy to
 * DeepSeek) and parses the Server-Sent-Event stream.
 *
 * In a future **Tauri** desktop runtime, this will invoke a Rust command
 * that calls DeepSeek directly, removing the need for a server entirely
 * (this lands in the BYOK PR — see roadmap). The runtime detection is
 * already wired so the swap will be local to this file.
 */
import { readChatStream } from "./stream";
import type { ModelId } from "./types";

export interface ChatRequest {
  model: ModelId;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  signal?: AbortSignal;
}

/** True when running inside the Tauri desktop shell (v1 or v2). */
export function isTauri(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as {
    __TAURI__?: unknown;
    __TAURI_INTERNALS__?: unknown;
  };
  return Boolean(w.__TAURI__ || w.__TAURI_INTERNALS__);
}

/**
 * Stream a chat completion. Yields partial content chunks as they arrive.
 *
 * Usage:
 *   for await (const chunk of streamChat({ model, messages, signal })) {
 *     // append to UI
 *   }
 */
export async function* streamChat(
  req: ChatRequest,
): AsyncGenerator<string, void, unknown> {
  // TODO(BYOK PR): branch on isTauri() and invoke the Rust `chat_stream`
  // command for a fully-standalone desktop experience.
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: req.model, messages: req.messages }),
    signal: req.signal,
  });

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ error: `Request failed (${res.status})` }));
    throw new Error(err.error || `Request failed (${res.status})`);
  }

  for await (const chunk of readChatStream(res, req.signal)) {
    yield chunk;
  }
}
