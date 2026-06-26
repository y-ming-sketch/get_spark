import { NextRequest } from "next/server";

export const runtime = "edge";

interface ChatRequestBody {
  model: "deepseek-chat" | "deepseek-reasoner";
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  temperature?: number;
  /** Optional BYOK base URL override sent by the client. */
  baseUrl?: string;
}

const DEFAULT_BASE_URL = "https://api.deepseek.com/v1";

function sseEvent(payload: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`);
}

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  // ────────────────────────────────────────────────────────────────────────
  // Key resolution (BYOK-first)
  // ────────────────────────────────────────────────────────────────────────
  //
  // 1. Authorization: Bearer <user-supplied-key>   ← BYOK on web/PWA
  // 2. DEEPSEEK_API_KEY env var                    ← legacy server-side mode
  //
  // The user-supplied key is forwarded straight to DeepSeek and never logged,
  // stored, or echoed back. We don't keep it across requests.
  let apiKey: string | undefined;
  const auth = req.headers.get("authorization");
  if (auth && auth.toLowerCase().startsWith("bearer ")) {
    apiKey = auth.slice(7).trim();
  } else if (process.env.DEEPSEEK_API_KEY) {
    apiKey = process.env.DEEPSEEK_API_KEY;
  }

  if (!apiKey) {
    return jsonError(
      401,
      "Missing API key. Open Settings and paste your DeepSeek API key, or set DEEPSEEK_API_KEY on the server.",
    );
  }

  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  if (!body.messages?.length) {
    return jsonError(400, "messages is required");
  }

  const baseUrl = (body.baseUrl || process.env.DEEPSEEK_API_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");

  const upstream = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: body.model ?? "deepseek-chat",
      messages: body.messages,
      temperature: body.temperature ?? 0.7,
      stream: true,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    return jsonError(
      upstream.status,
      `DeepSeek API error (${upstream.status}): ${text || upstream.statusText}`,
    );
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const raw of lines) {
            const line = raw.trim();
            if (!line || !line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (data === "[DONE]") {
              controller.enqueue(sseEvent({ type: "done" }));
              controller.close();
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const delta =
                parsed?.choices?.[0]?.delta?.content ??
                parsed?.choices?.[0]?.delta?.reasoning_content ??
                "";
              if (delta) {
                controller.enqueue(sseEvent({ type: "chunk", content: delta }));
              }
            } catch {
              // ignore malformed chunk
            }
          }
        }
        controller.enqueue(sseEvent({ type: "done" }));
        controller.close();
      } catch (err) {
        controller.enqueue(
          sseEvent({
            type: "error",
            message: err instanceof Error ? err.message : "Unknown stream error",
          }),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
