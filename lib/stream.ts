/**
 * Parse a Server-Sent-Event stream from /api/chat into incremental text chunks.
 *
 * Server emits two event types via SSE:
 *   data: {"type":"chunk","content":"hello"}
 *   data: {"type":"done"}
 *   data: {"type":"error","message":"..."}
 */
export async function* readChatStream(
  response: Response,
  signal?: AbortSignal,
): AsyncGenerator<string, void, unknown> {
  if (!response.body) throw new Error("Empty response body");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel();
        return;
      }
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE messages are separated by a blank line ("\n\n")
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith("data:")) continue;
        const json = line.slice(5).trim();
        if (!json) continue;
        try {
          const evt = JSON.parse(json) as
            | { type: "chunk"; content: string }
            | { type: "done" }
            | { type: "error"; message: string };
          if (evt.type === "chunk") yield evt.content;
          else if (evt.type === "error") throw new Error(evt.message);
          else if (evt.type === "done") return;
        } catch (err) {
          if (err instanceof SyntaxError) continue; // skip malformed line
          throw err;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
