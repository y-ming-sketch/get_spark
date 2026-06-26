"use client";

import { useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy } from "lucide-react";

interface Props {
  children: ReactNode;
}

/** A <pre> wrapper that exposes a Copy button and a language label. */
export function CodeBlock({ children }: Props) {
  const t = useTranslations("common");
  const tChat = useTranslations("chat");
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  // Extract language from nested <code class="language-xyz"> when present
  let language = "";
  const node = children as unknown as { props?: { className?: string } } | null;
  if (node && typeof node === "object" && node.props?.className) {
    const m = node.props.className.match(/language-(\w+)/);
    if (m) language = m[1];
  }

  const handleCopy = async () => {
    const text = preRef.current?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — ignore */
    }
  };

  return (
    <div className="group relative my-3 overflow-hidden rounded-xl border border-cream-300 dark:border-ink-500 bg-cream-100 dark:bg-ink-700">
      <div className="flex items-center justify-between border-b border-cream-300 dark:border-ink-500 bg-cream-50 dark:bg-ink-800 px-3 py-1.5">
        <span className="text-xs font-mono uppercase tracking-wide text-ink-400">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-ink-400 hover:text-ink-700 dark:hover:text-ink-100 transition-colors"
          aria-label={tChat("copyCodeAria")}
        >
          {copied ? (
            <>
              <Check size={12} /> {t("copied")}
            </>
          ) : (
            <>
              <Copy size={12} /> {t("copy")}
            </>
          )}
        </button>
      </div>
      <pre
        ref={preRef}
        className="overflow-x-auto p-4 text-sm leading-6 font-mono scrollbar-thin"
      >
        {children}
      </pre>
    </div>
  );
}
