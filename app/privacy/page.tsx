import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Database, Eye, FileCode2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy — Spark",
  description:
    "Spark is local-first. Your prompts, your chat history, and your API key never leave your device.",
};

const PROMISES = [
  {
    icon: Shield,
    title: "We do not collect, store, or transmit your prompts.",
    body: "Spark never sees what you type. The /api/chat route is a stateless proxy: it forwards your request to DeepSeek and immediately discards it. No logs, no database, no analytics.",
  },
  {
    icon: Lock,
    title: "We do not see your API key. Ever.",
    body: "Your DeepSeek key is encrypted on this device using WebCrypto AES-GCM. On desktop builds, the key is passed directly from the encrypted store into a Rust streaming command that calls DeepSeek over HTTPS — no server in between.",
  },
  {
    icon: Eye,
    title: "We do not embed analytics, trackers, or third-party scripts.",
    body: "No Google Analytics. No Plausible. No PostHog. No Sentry. No fonts loaded from CDNs. Open the Network tab — the only host Spark contacts is the one running the model.",
  },
  {
    icon: Database,
    title: "Chat history lives only on your device.",
    body: "Conversations are persisted to localStorage (web/PWA), Tauri app data dir (desktop), or platform-specific storage (mobile/extensions when those phases ship). Clear it anytime from Settings → About → Erase everything on this device.",
  },
  {
    icon: FileCode2,
    title: "Source is open. Verify every claim above.",
    body: "Every line of code is on GitHub under the MIT license. Read /api/chat, read lib/keystore.ts, read the Rust chat_stream command. If we ever break a promise, the diff will be there for the world to see.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-cream-50 dark:bg-ink-800 text-ink-700 dark:text-ink-50">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-700 dark:hover:text-ink-100 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Spark
        </Link>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight">
          Spark is local-first.
        </h1>
        <p className="mt-3 text-base text-ink-400 leading-relaxed">
          Most AI products are built on a promise: <em>trust us</em>. Spark is
          built on a different promise: <em>you don't have to</em>. Your prompts,
          your chat history, and your API key never leave your device. Here's
          exactly how, in plain language.
        </p>

        <section className="mt-10 space-y-6">
          {PROMISES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-4">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-spark-500/10 text-spark-500">
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold tracking-tight">{title}</h2>
                <p className="mt-1 text-sm text-ink-400 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-12 rounded-xl border border-cream-300 dark:border-ink-500 bg-cream-100 dark:bg-ink-700 p-5">
          <h2 className="text-sm font-semibold tracking-tight">
            What about the limits?
          </h2>
          <p className="mt-2 text-sm text-ink-400 leading-relaxed">
            We're honest about what our encryption can and can't do. On the web
            platform, the WebCrypto layer defends against trivial disk
            inspection (someone reading <code>localStorage</code> from a browser
            backup) but not against malicious scripts that run in the same
            origin. Real protection comes from the platform: the desktop app
            stores keys in an OS-restricted directory, mobile builds use the
            OS keychain + biometric unlock, and VS Code uses the SecretStorage
            API. Full threat model lives at{" "}
            <a
              href="https://github.com/y-ming-sketch/get_spark/blob/main/.kiro/steering/02-security.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-spark-500 hover:text-spark-600 underline underline-offset-2"
            >
              .kiro/steering/02-security.md
            </a>
            .
          </p>
        </section>

        <section className="mt-8 text-xs text-ink-400 leading-relaxed">
          <p>
            Disclosure date: 2026-06-26. This page is versioned with the rest
            of the source — see{" "}
            <a
              href="https://github.com/y-ming-sketch/get_spark/commits/main/app/privacy/page.tsx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-spark-500 hover:text-spark-600 underline underline-offset-2"
            >
              the commit history
            </a>{" "}
            for any updates. Questions? Open an issue on GitHub.
          </p>
        </section>
      </div>
    </main>
  );
}
