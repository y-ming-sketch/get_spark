"use client";

import { useEffect } from "react";
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
  useEffect(() => {
    // Log to the browser console only — no telemetry, ever.
    // The digest is a stable hash Next.js attaches to production errors.
    console.error("[Spark] route error", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream-50 dark:bg-ink-800 text-ink-700 dark:text-ink-50 px-6 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-spark-500/10 text-spark-500">
          <AlertTriangle size={28} />
        </div>

        <h1 className="mt-5 text-2xl font-semibold tracking-tight">
          Something went sideways.
        </h1>
        <p className="mt-2 text-sm text-ink-400 leading-relaxed">
          Spark hit an unexpected error while rendering this view. Your chat
          history and settings are safe — they live on this device, untouched.
        </p>

        {error.digest && (
          <p className="mt-3 text-[11px] font-mono text-ink-400">
            ref: {error.digest}
          </p>
        )}

        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-full bg-spark-500 px-4 py-2 text-sm font-medium text-white hover:bg-spark-600 transition-colors"
          >
            <RotateCcw size={14} /> Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 dark:border-ink-500 px-4 py-2 text-sm text-ink-500 dark:text-ink-100 hover:bg-cream-100 dark:hover:bg-ink-700 transition-colors"
          >
            <Home size={14} /> Reload Spark
          </a>
        </div>

        <p className="mt-6 text-[11px] text-ink-400">
          If this keeps happening,{" "}
          <a
            href="https://github.com/y-ming-sketch/get_spark/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-spark-500 hover:text-spark-600 underline underline-offset-2"
          >
            open an issue
          </a>{" "}
          with the reference above.
        </p>
      </div>
    </main>
  );
}
