/**
 * VS Code webview bridge — strongly-typed wrapper around postMessage.
 *
 * Mirrors workspaceBridge.ts on the extension side: every method here
 * posts a request and resolves when the matching response arrives.
 * One-shot request/response with a generated id for correlation.
 */

interface VsCodeApi {
  postMessage(message: unknown): void;
  setState(state: unknown): void;
  getState<T = unknown>(): T | undefined;
}

declare const acquireVsCodeApi: () => VsCodeApi;

let vsApi: VsCodeApi | null = null;
export function getVsCodeApi(): VsCodeApi | null {
  if (typeof acquireVsCodeApi !== "function") return null;
  if (!vsApi) vsApi = acquireVsCodeApi();
  return vsApi;
}

export function isVsCode(): boolean {
  return getVsCodeApi() !== null;
}

interface ActiveFile {
  path: string;
  content: string;
  language: string;
}

interface Selection extends ActiveFile {
  startLine: number;
  endLine: number;
}

interface OpenFile {
  path: string;
  language: string;
  isDirty: boolean;
}

type BridgeMethod =
  | "getActiveFile"
  | "getSelection"
  | "listOpenFiles"
  | "readWorkspaceFile";

const pending = new Map<
  string,
  { resolve: (v: unknown) => void; reject: (e: Error) => void }
>();

window.addEventListener("message", (event) => {
  const msg = event.data as
    | { type: "spark.bridge.response"; id: string; result?: unknown; error?: string }
    | { type: string }
    | undefined;
  if (!msg || msg.type !== "spark.bridge.response") return;
  const entry = pending.get((msg as { id: string }).id);
  if (!entry) return;
  pending.delete((msg as { id: string }).id);
  const m = msg as { id: string; result?: unknown; error?: string };
  if (m.error) entry.reject(new Error(m.error));
  else entry.resolve(m.result);
});

function call<T>(method: BridgeMethod, params?: Record<string, unknown>): Promise<T> {
  const api = getVsCodeApi();
  if (!api) return Promise.reject(new Error("Not running in a VS Code webview"));
  const id = Math.random().toString(36).slice(2, 12);
  return new Promise<T>((resolve, reject) => {
    pending.set(id, {
      resolve: (v) => resolve(v as T),
      reject,
    });
    api.postMessage({ type: "spark.bridge.request", id, method, params });
    // Safety net: drop the entry after 10s
    setTimeout(() => {
      if (pending.delete(id)) reject(new Error(`Bridge ${method} timed out`));
    }, 10_000);
  });
}

export const bridge = {
  getActiveFile: () => call<ActiveFile | null>("getActiveFile"),
  getSelection: () => call<Selection | null>("getSelection"),
  listOpenFiles: () => call<OpenFile[]>("listOpenFiles"),
  readWorkspaceFile: (path: string) =>
    call<ActiveFile>("readWorkspaceFile", { path }),
};

/**
 * Listener for one-way events the extension pushes (no id correlation).
 * Returns an unsubscribe function.
 */
export function onExtensionEvent(
  handler: (msg: { type: string; payload?: unknown }) => void,
): () => void {
  const fn = (e: MessageEvent) => {
    const data = e.data as { type?: string };
    if (!data?.type || data.type.startsWith("spark.bridge.")) return;
    handler(data as { type: string; payload?: unknown });
  };
  window.addEventListener("message", fn);
  return () => window.removeEventListener("message", fn);
}
