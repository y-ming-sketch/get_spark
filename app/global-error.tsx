"use client";

import { useEffect } from "react";

/**
 * Last-resort error boundary that covers the root layout itself.
 * Must render its own <html> and <body> tags because the normal layout
 * has already errored. No Tailwind base styles available here, so all
 * styling is inline.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Spark] global error", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          background: "#FAF9F5",
          color: "#1B1A16",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div
            style={{
              margin: "0 auto",
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "rgba(140, 21, 21, 0.1)",
              color: "#8C1515",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
            }}
            aria-hidden
          >
            ✦
          </div>
          <h1
            style={{
              marginTop: 16,
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}
          >
            Spark could not start.
          </h1>
          <p style={{ marginTop: 8, fontSize: 14, color: "#6B6557" }}>
            A critical error prevented Spark from rendering. Your data on this
            device is unaffected — refreshing usually fixes it.
          </p>
          {error.digest && (
            <p
              style={{
                marginTop: 12,
                fontSize: 11,
                fontFamily: "ui-monospace, monospace",
                color: "#6B6557",
              }}
            >
              ref: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: 20,
              padding: "8px 18px",
              borderRadius: 999,
              border: "none",
              background: "#8C1515",
              color: "white",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reload Spark
          </button>
        </div>
      </body>
    </html>
  );
}
