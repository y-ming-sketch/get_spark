"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

/**
 * Next.js App Router route-level error boundary.
 * Renders when something inside the `/` route tree throws during render.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");
  const tCommon = useTranslations("common");

  useEffect(() => {
    // Log to the browser console only — no telemetry, ever.
    console.error("[Spark] route error", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream-50 dark:bg-ink-800 text-ink-700 dark:text-ink-50 px-6 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-spark-500/10 text-spark-500">
          <AlertTriangle size={28} />
        </div>

        <h1 className="mt-5 text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-ink-400 leading-relaxed">{t("body")}</p>

        {error.digest && (
          <p className="mt-3 text-[11px] font-mono text-ink-400">
            {t("ref", { digest: error.digest })}
          </p>
        )}

        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-full bg-spark-500 px-4 py-2 text-sm font-medium text-white hover:bg-spark-600 transition-colors"
          >
            <RotateCcw size={14} /> {tCommon("tryAgain")}
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 dark:border-ink-500 px-4 py-2 text-sm text-ink-500 dark:text-ink-100 hover:bg-cream-100 dark:hover:bg-ink-700 transition-colors"
          >
            <Home size={14} /> {tCommon("reload")}
          </a>
        </div>

        <p className="mt-6 text-[11px] text-ink-400">
          {t("ifPersists")}{" "}
          <a
            href="https://github.com/y-ming-sketch/get_spark/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-spark-500 hover:text-spark-600 underline underline-offset-2"
          >
            {t("openIssue")}
          </a>{" "}
          {t("openIssueAfter")}
        </p>
      </div>
    </main>
  );
}
