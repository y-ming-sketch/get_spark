/**
 * chatClient — runtime-aware streaming chat dispatcher.
 *
 * Three runtimes, one interface:
 *
 *   Web / PWA           → POST /api/chat with Authorization: Bearer <key>
 *                          (Next.js Edge route proxies to DeepSeek)
 *   Tauri desktop       → invoke('chat_stream', …) and listen for
 *                          `spark://chunk-<id>` events emitted by Rust
 *   Chrome extension    → same as web; key injected from chrome.storage
 *
 * Phase 1 ships the Web + Tauri paths. The extension path arrives in Phase 4.
 */
import { readChatStream } from "./stream";
import { keystore, SECRET_KEYS } from "./keystore";
import type { ModelId } from "./types";
import { nanoid } from "nanoid";

export interface ChatRequest {
  model: ModelId;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  signal?: AbortSignal;
  /**
   * Optional BYOK key. When omitted, the client pulls from the encrypted
   * keystore. When neither is present, the server falls back to its env var.
   */
  apiKey?: string;
  baseUrl?: string;
  /** Sampling temperature (0–2). Defaults to 0.7. */
  temperature?: number;
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

async function resolveKey(supplied?: string): Promise<string | undefined> {
  if (supplied) return supplied;
  if (!keystore.available()) return undefined;
  return (await keystore.get(SECRET_KEYS.DEEPSEEK_API_KEY)) ?? undefined;
}

async function resolveBaseUrl(supplied?: string): Promise<string | undefined> {
  if (supplied) return supplied;
  if (!keystore.available()) return undefined;
  return (await keystore.get(SECRET_KEYS.DEEPSEEK_BASE_URL)) ?? undefined;
}

// ─── Web / PWA path ────────────────────────────────────────────────────────

async function* streamChatWeb(req: ChatRequest): AsyncGenerator<string, void, unknown> {
  const apiKey = await resolveKey(req.apiKey);
  const baseUrl = await resolveBaseUrl(req.baseUrl);

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model: req.model,
      messages: req.messages,
      baseUrl,
      temperature: req.temperature,
    }),
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

// ─── Tauri desktop path ────────────────────────────────────────────────────

interface TauriChunkEvent {
  payload: { content: string };
}

interface TauriErrorEvent {
  payload: { message: string };
}

type QueueItem =
  | { type: "chunk"; content: string }
  | { type: "done" }
  | { type: "error"; message: string };

async function* streamChatTauri(req: ChatRequest): AsyncGenerator<string, void, unknown> {
  const apiKey = await resolveKey(req.apiKey);
  if (!apiKey) {
    throw new Error(
      "No API key set. Open Settings and paste your DeepSeek API key.",
    );
  }
  const baseUrl =
    (await resolveBaseUrl(req.baseUrl)) ?? "https://api.deepseek.com/v1";

  // Dynamic imports so the web bundle never tries to resolve these
  const { invoke } = await import("@tauri-apps/api/core");
  const { listen } = await import("@tauri-apps/api/event");

  const requestId = nanoid(12);
  const queue: QueueItem[] = [];
  let waiter: (() => void) | null = null;
  const wake = () => {
    const w = waiter;
    waiter = null;
    w?.();
  };

  const unlistenChunk = await listen<TauriChunkEvent["payload"]>(
    `spark://chunk-${requestId}`,
    (e) => {
      queue.push({ type: "chunk", content: e.payload.content });
      wake();
    },
  );
  const unlistenDone = await listen(`spark://done-${requestId}`, () => {
    queue.push({ type: "done" });
    wake();
  });
  const unlistenError = await listen<TauriErrorEvent["payload"]>(
    `spark://error-${requestId}`,
    (e) => {
      queue.push({ type: "error", message: e.payload.message });
      wake();
    },
  );

  const onAbort = () => {
    queue.push({ type: "done" });
    wake();
    // Best-effort cancel; the Rust task will exit when its window emit
    // returns an error or when it observes the abort flag (added later).
    void invoke("chat_stream_abort", { requestId }).catch(() => undefined);
  };
  req.signal?.addEventListener("abort", onAbort, { once: true });

  // Fire the Rust command. We intentionally don't await it here — chunks
  // arrive via events; the command's resolution just signals overall done.
  const completion = invoke<void>("chat_stream", {
    requestId,
    apiKey,
    baseUrl,
    model: req.model,
    messages: req.messages,
    temperature: req.temperature ?? 0.7,
  }).catch((err: unknown) => {
    queue.push({
      type: "error",
      message: err instanceof Error ? err.message : String(err),
    });
    wake();
  });

  try {
    while (true) {
      if (queue.length === 0) {
        await new Promise<void>((resolve) => {
          waiter = resolve;
        });
      }
      const evt = queue.shift();
      if (!evt) continue;
      if (evt.type === "chunk") {
        yield evt.content;
      } else if (evt.type === "done") {
        return;
      } else {
        throw new Error(evt.message);
      }
    }
  } finally {
    req.signal?.removeEventListener("abort", onAbort);
    unlistenChunk();
    unlistenDone();
    unlistenError();
    await completion;
  }
}

// ─── Public entry point ────────────────────────────────────────────────────

export async function* streamChat(
  req: ChatRequest,
): AsyncGenerator<string, void, unknown> {
  if (isTauri()) {
    yield* streamChatTauri(req);
  } else {
    yield* streamChatWeb(req);
  }
}
