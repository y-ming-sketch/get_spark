"use client";

import { useEffect, useState } from "react";
import { Check, Eye, EyeOff, Loader2, Trash2, ExternalLink, AlertTriangle } from "lucide-react";
import { useSpark } from "@/lib/store";
import { keystore, SECRET_KEYS } from "@/lib/keystore";
import { cn } from "@/lib/utils";

type Status =
  | { kind: "idle" }
  | { kind: "testing" }
  | { kind: "ok"; message: string }
  | { kind: "error"; message: string };

const DEFAULT_BASE_URL = "https://api.deepseek.com/v1";

/**
 * Validates a DeepSeek key by hitting /models (a cheap, key-required endpoint).
 * On non-2xx, surfaces the upstream error message verbatim.
 */
async function testKey(baseUrl: string, key: string): Promise<string> {
  const url = `${baseUrl.replace(/\/+$/, "")}/models`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `${res.status} ${res.statusText}${txt ? ` — ${txt.slice(0, 200)}` : ""}`,
    );
  }
  const data = (await res.json().catch(() => ({}))) as {
    data?: { id?: string }[];
  };
  const models = data.data?.length ?? 0;
  return `Connected. ${models} model${models === 1 ? "" : "s"} available.`;
}

export function ApiKeyPanel() {
  const setHasApiKey = useSpark((s) => s.setHasApiKey);
  const setNeedsOnboarding = useSpark((s) => s.setNeedsOnboarding);
  const storedBaseUrl = useSpark((s) => s.baseUrl);
  const setStoredBaseUrl = useSpark((s) => s.setBaseUrl);
  const hasApiKey = useSpark((s) => s.hasApiKey);

  const [key, setKey] = useState("");
  const [baseUrl, setBaseUrl] = useState(storedBaseUrl || DEFAULT_BASE_URL);
  const [reveal, setReveal] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [originalKey, setOriginalKey] = useState<string | null>(null);

  // Load any existing key once on mount so the user can verify / replace it.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!keystore.available()) return;
      const stored = await keystore.get(SECRET_KEYS.DEEPSEEK_API_KEY);
      if (cancelled) return;
      if (stored) {
        setKey(stored);
        setOriginalKey(stored);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    if (!key.trim()) {
      setStatus({ kind: "error", message: "Please paste a key first." });
      return;
    }
    setStatus({ kind: "testing" });
    try {
      const ok = await testKey(baseUrl, key.trim());
      await keystore.set(SECRET_KEYS.DEEPSEEK_API_KEY, key.trim());
      if (baseUrl !== DEFAULT_BASE_URL) {
        await keystore.set(SECRET_KEYS.DEEPSEEK_BASE_URL, baseUrl);
      } else {
        await keystore.remove(SECRET_KEYS.DEEPSEEK_BASE_URL);
      }
      setStoredBaseUrl(baseUrl);
      setHasApiKey(true);
      setNeedsOnboarding(false);
      setOriginalKey(key.trim());
      setStatus({ kind: "ok", message: ok });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Couldn't reach DeepSeek.",
      });
    }
  };

  const handleRemove = async () => {
    if (!confirm("Remove your DeepSeek API key from this device?")) return;
    await keystore.remove(SECRET_KEYS.DEEPSEEK_API_KEY);
    await keystore.remove(SECRET_KEYS.DEEPSEEK_BASE_URL);
    setKey("");
    setOriginalKey(null);
    setStoredBaseUrl(DEFAULT_BASE_URL);
    setBaseUrl(DEFAULT_BASE_URL);
    setHasApiKey(false);
    setStatus({ kind: "idle" });
  };

  const dirty = key !== (originalKey ?? "") || baseUrl !== storedBaseUrl;
  const showRemove = !!originalKey;

  return (
    <div className="p-5 space-y-5">
      <section>
        <h3 className="text-base font-semibold tracking-tight">DeepSeek API key</h3>
        <p className="mt-1 text-sm text-ink-400 leading-relaxed">
          Spark is bring-your-own-key. Your key is encrypted on this device and
          never sent to any server we control. Paste it once and you're set.
        </p>
        <a
          href="https://platform.deepseek.com/api_keys"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-spark-500 hover:text-spark-600"
        >
          Get a free key on platform.deepseek.com
          <ExternalLink size={11} />
        </a>
      </section>

      <section className="space-y-2">
        <label className="block text-xs font-medium text-ink-400" htmlFor="api-key-input">
          API key
        </label>
        <div className="relative">
          <input
            id="api-key-input"
            type={reveal ? "text" : "password"}
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              if (status.kind !== "idle") setStatus({ kind: "idle" });
            }}
            placeholder="sk-…"
            spellCheck={false}
            autoComplete="off"
            className="w-full rounded-lg border border-cream-300 dark:border-ink-500 bg-cream-50 dark:bg-ink-800 px-3 py-2 pr-10 text-sm font-mono outline-none focus:border-spark-500 focus:ring-2 focus:ring-spark-500/20"
          />
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-ink-400 hover:text-ink-700 dark:hover:text-ink-100"
            aria-label={reveal ? "Hide key" : "Show key"}
          >
            {reveal ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </section>

      <details className="text-sm">
        <summary className="cursor-pointer text-xs font-medium text-ink-400 hover:text-ink-700 dark:hover:text-ink-100">
          Advanced — base URL
        </summary>
        <div className="mt-2 space-y-1">
          <input
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder={DEFAULT_BASE_URL}
            spellCheck={false}
            className="w-full rounded-lg border border-cream-300 dark:border-ink-500 bg-cream-50 dark:bg-ink-800 px-3 py-2 text-sm font-mono outline-none focus:border-spark-500 focus:ring-2 focus:ring-spark-500/20"
          />
          <p className="text-[11px] text-ink-400">
            Use a custom URL only if you're proxying DeepSeek behind your own
            gateway. Defaults to <code>{DEFAULT_BASE_URL}</code>.
          </p>
        </div>
      </details>

      <section className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={status.kind === "testing" || !dirty}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            status.kind === "testing" || !dirty
              ? "bg-cream-200 dark:bg-ink-600 text-ink-400 cursor-not-allowed"
              : "bg-spark-500 text-white hover:bg-spark-600",
          )}
        >
          {status.kind === "testing" ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Testing…
            </>
          ) : (
            <>
              <Check size={14} /> Save & test
            </>
          )}
        </button>

        {showRemove && (
          <button
            onClick={handleRemove}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-ink-400 hover:bg-cream-200 dark:hover:bg-ink-600 hover:text-spark-500 transition-colors"
          >
            <Trash2 size={14} /> Remove
          </button>
        )}
      </section>

      {status.kind === "ok" && (
        <p
          role="status"
          className="flex items-start gap-1.5 text-sm text-spark-500"
        >
          <Check size={14} className="mt-0.5 shrink-0" />
          <span>{status.message}</span>
        </p>
      )}
      {status.kind === "error" && (
        <p
          role="alert"
          className="flex items-start gap-1.5 rounded-lg border border-spark-500/40 bg-spark-500/5 px-3 py-2 text-sm text-spark-600 dark:text-spark-400"
        >
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>{status.message}</span>
        </p>
      )}

      {hasApiKey && status.kind === "idle" && (
        <p className="flex items-center gap-1.5 text-xs text-ink-400">
          <Check size={12} className="text-spark-500" />
          API key is set on this device.
        </p>
      )}
    </div>
  );
}
