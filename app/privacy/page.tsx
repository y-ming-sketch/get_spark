import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Shield, Lock, Database, Eye, FileCode2 } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("privacyPage");
  return {
    title: `${t("title")} — Spark`,
    description: t("intro"),
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations("privacyPage");
  const tAbout = await getTranslations("about");

  const promises = [
    { icon: Shield, title: tAbout("promise1"), body: t("promise1Body") },
    { icon: Lock, title: tAbout("promise2"), body: t("promise2Body") },
    { icon: Eye, title: tAbout("promise3"), body: t("promise3Body") },
    { icon: Database, title: tAbout("promise4"), body: t("promise4Body") },
    { icon: FileCode2, title: tAbout("promise5"), body: t("promise5Body") },
  ];

  return (
    <main className="min-h-screen bg-cream-50 dark:bg-ink-800 text-ink-700 dark:text-ink-50">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-700 dark:hover:text-ink-100 transition-colors"
        >
          <ArrowLeft size={14} />
          {t("back")}
        </Link>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-3 text-base text-ink-400 leading-relaxed">
          {t("intro")}
        </p>

        <section className="mt-10 space-y-6">
          {promises.map(({ icon: Icon, title, body }) => (
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
            {t("limitsTitle")}
          </h2>
          <p className="mt-2 text-sm text-ink-400 leading-relaxed">
            {t("limitsBody")}{" "}
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
          <p>{t("footer")}</p>
        </section>
      </div>
    </main>
  );
}
