"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Check,
  Eye,
  EyeOff,
  Loader2,
  Trash2,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { useSpark } from "@/lib/store";
import { keystore, SECRET_KEYS } from "@/lib/keystore";
import { cn } from "@/lib/utils";

type Status =
  | { kind: "idle" }
  | { kind: "testing" }
  | { kind: "ok"; count: number }
  | { kind: "error"; message: string };

const DEFAULT_BASE_URL = "https://api.deepseek.com/v1";

async function testKey(baseUrl: string, key: string): Promise<number> {
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
  return data.data?.length ?? 0;
}

export function ApiKeyPanel() {
  const t = useTranslations("apiKey");
  const tCommon = useTranslations("common");

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
      setStatus({ kind: "error", message: t("emptyError") });
      return;
    }
    setStatus({ kind: "testing" });
    try {
      const count = await testKey(baseUrl, key.trim());
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
      setStatus({ kind: "ok", count });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : t("errorFallback"),
      });
    }
  };

  const handleRemove = async () => {
    if (!confirm(t("removeConfirm"))) return;
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
        <h3 className="text-base font-semibold tracking-tight">{t("title")}</h3>
        <p className="mt-1 text-sm text-ink-400 leading-relaxed">
          {t("description")}
        </p>
        <a
          href="https://platform.deepseek.com/api_keys"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-spark-500 hover:text-spark-600"
        >
          {t("getKeyLink")}
          <ExternalLink size={11} />
        </a>
      </section>

      <section className="space-y-2">
        <label className="block text-xs font-medium text-ink-400" htmlFor="api-key-input">
          {t("label")}
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
            placeholder={t("placeholder")}
            spellCheck={false}
            autoComplete="off"
            className="w-full rounded-lg border border-cream-300 dark:border-ink-500 bg-cream-50 dark:bg-ink-800 px-3 py-2 pe-10 text-sm font-mono outline-none focus:border-spark-500 focus:ring-2 focus:ring-spark-500/20"
          />
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="absolute end-2 top-1/2 -translate-y-1/2 p-1 text-ink-400 hover:text-ink-700 dark:hover:text-ink-100"
            aria-label={reveal ? t("hideAria") : t("showAria")}
          >
            {reveal ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </section>

      <details className="text-sm">
        <summary className="cursor-pointer text-xs font-medium text-ink-400 hover:text-ink-700 dark:hover:text-ink-100">
          {t("advancedToggle")}
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
            {t("baseUrlHint", { default: DEFAULT_BASE_URL })}
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
              <Loader2 size={14} className="animate-spin" /> {t("saving")}
            </>
          ) : (
            <>
              <Check size={14} /> {t("save")}
            </>
          )}
        </button>

        {showRemove && (
          <button
            onClick={handleRemove}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-ink-400 hover:bg-cream-200 dark:hover:bg-ink-600 hover:text-spark-500 transition-colors"
          >
            <Trash2 size={14} /> {t("remove")}
          </button>
        )}
      </section>

      {status.kind === "ok" && (
        <p
          role="status"
          className="flex items-start gap-1.5 text-sm text-spark-500"
        >
          <Check size={14} className="mt-0.5 shrink-0" />
          <span>
            {status.count === 1
              ? t("successOne", { count: status.count })
              : t("successMany", { count: status.count })}
          </span>
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

      {hasApiKey && status.kind === "idle" && !dirty && (
        <p className="flex items-center gap-1.5 text-xs text-ink-400">
          <Check size={12} className="text-spark-500" />
          {t("isSet")}
        </p>
      )}
    </div>
  );
}
