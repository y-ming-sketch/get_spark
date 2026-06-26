"use client";

import { Shield, Code, Github, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { useSpark } from "@/lib/store";
import { keystore } from "@/lib/keystore";
import { APP_NAME, APP_VERSION } from "@/lib/version";
import { SparkLogo } from "../SparkLogo";

const PRIVACY_PROMISES = [
  "We do not collect, store, or transmit your prompts.",
  "We do not see your API key. Ever.",
  "We do not embed analytics, trackers, or third-party scripts.",
  "Chat history lives only on your device. Clear it anytime.",
  "Source is open. Verify the claims above in our repo.",
];

export function AboutPanel() {
  const clearAll = useSpark((s) => s.clearAll);
  const setHasApiKey = useSpark((s) => s.setHasApiKey);

  const handleNuke = async () => {
    if (
      !confirm(
        "Permanently delete all chat history and your stored API key on this device?",
      )
    )
      return;
    await keystore.clear();
    clearAll();
    setHasApiKey(false);
    alert("All local data has been removed.");
  };

  return (
    <div className="p-5 space-y-6">
      <section className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-spark-500 text-white">
          <SparkLogo size={24} />
        </div>
        <div>
          <div className="text-base font-semibold tracking-tight">
            {APP_NAME}
          </div>
          <div className="text-xs text-ink-400">
            v{APP_VERSION} · Local-first AI for code, trends, and style.
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-cream-300 dark:border-ink-500 bg-cream-100 dark:bg-ink-800 p-4">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <Shield size={14} className="text-spark-500" />
          Privacy promise
        </h3>
        <ul className="mt-2 space-y-1.5">
          {PRIVACY_PROMISES.map((p) => (
            <li key={p} className="flex items-start gap-1.5 text-xs leading-relaxed text-ink-500 dark:text-ink-100">
              <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-spark-500" />
              {p}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold tracking-tight">Links</h3>
        <div className="mt-2 flex flex-col gap-1.5 text-sm">
          <Link
            href="/privacy"
            className="inline-flex items-center gap-1.5 text-spark-500 hover:text-spark-600"
          >
            <Shield size={14} /> Read the full privacy page
          </Link>
          <a
            href="https://github.com/y-ming-sketch/get_spark"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-spark-500 hover:text-spark-600"
          >
            <Github size={14} /> Source on GitHub
            <ExternalLink size={11} />
          </a>
          <a
            href="https://platform.deepseek.com/api_keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-spark-500 hover:text-spark-600"
          >
            <Code size={14} /> Get a DeepSeek API key
            <ExternalLink size={11} />
          </a>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold tracking-tight">Danger zone</h3>
        <p className="mt-1 text-xs text-ink-400">
          Wipes all chats, your encrypted API key, and any local settings.
          This cannot be undone.
        </p>
        <button
          onClick={handleNuke}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-spark-500/50 px-3 py-2 text-sm text-spark-600 dark:text-spark-400 hover:bg-spark-500/10 transition-colors"
        >
          <Trash2 size={14} /> Erase everything on this device
        </button>
      </section>
    </div>
  );
}
