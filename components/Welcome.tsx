"use client";

import { Sparkles, Shield, KeyRound, ArrowRight } from "lucide-react";
import { SparkLogo } from "./SparkLogo";

interface Props {
  onGetStarted: () => void;
}

const HIGHLIGHTS = [
  {
    icon: <KeyRound size={14} />,
    title: "Bring your own key",
    body: "Paste your DeepSeek key once. It's encrypted on this device and never touches our servers.",
  },
  {
    icon: <Shield size={14} />,
    title: "Local-first",
    body: "Your chats, files, and settings live on your device. No accounts, no telemetry, no tracking.",
  },
  {
    icon: <Sparkles size={14} />,
    title: "One brain, every device",
    body: "Same conversation history across web, desktop, mobile, and browser extensions (coming soon).",
  },
];

/**
 * First-launch screen shown when no API key is configured. Routes the user
 * into the Settings modal with a single click.
 */
export function Welcome({ onGetStarted }: Props) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-spark-500 text-white shadow-md">
          <SparkLogo size={32} />
        </div>

        <h1 className="mt-5 text-3xl font-semibold tracking-tight">
          Welcome to Spark.
        </h1>
        <p className="mt-2 text-sm text-ink-400">
          Your AI for code, trends, and everything in between.
        </p>

        <div className="mt-8 grid gap-3 text-left sm:grid-cols-1">
          {HIGHLIGHTS.map((h) => (
            <div
              key={h.title}
              className="flex gap-3 rounded-xl border border-cream-300 dark:border-ink-500 bg-cream-50 dark:bg-ink-700 px-4 py-3"
            >
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-spark-500/10 text-spark-500">
                {h.icon}
              </div>
              <div>
                <div className="text-sm font-medium">{h.title}</div>
                <div className="mt-0.5 text-xs text-ink-400 leading-relaxed">
                  {h.body}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onGetStarted}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-spark-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-spark-600 transition-colors"
        >
          Add your API key
          <ArrowRight size={14} />
        </button>

        <p className="mt-4 text-[11px] text-ink-400">
          Don't have one?{" "}
          <a
            href="https://platform.deepseek.com/api_keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-spark-500 hover:text-spark-600 underline underline-offset-2"
          >
            Grab a DeepSeek key in 60 seconds
          </a>
          .
        </p>
      </div>
    </div>
  );
}
