"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Check,
  Github,
  Loader2,
  Trash2,
  ExternalLink,
  AlertTriangle,
  Plug,
} from "lucide-react";
import { useSpark } from "@/lib/store";
import { keystore, SECRET_KEYS } from "@/lib/keystore";
import {
  getViewer,
  getRepo,
  getTree,
  summarizeTree,
  GitHubError,
} from "@/lib/github";
import { cn } from "@/lib/utils";

type Status =
  | { kind: "idle" }
  | { kind: "testing" }
  | { kind: "ok"; login: string }
  | { kind: "error"; message: string };

type RepoStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; fullName: string }
  | { kind: "error"; message: string };

export function ConnectionsPanel() {
  const t = useTranslations("connections");
  const hasGithubToken = useSpark((s) => s.hasGithubToken);
  const setHasGithubToken = useSpark((s) => s.setHasGithubToken);
  const activeRepo = useSpark((s) => s.activeRepo);
  const setActiveRepo = useSpark((s) => s.setActiveRepo);

  const [token, setToken] = useState("");
  const [tokenStatus, setTokenStatus] = useState<Status>({ kind: "idle" });
  const [repoInput, setRepoInput] = useState(activeRepo?.fullName ?? "");
  const [repoStatus, setRepoStatus] = useState<RepoStatus>({ kind: "idle" });
  const [originalToken, setOriginalToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await keystore.get(SECRET_KEYS.GITHUB_PAT);
      if (stored) {
        setToken(stored);
        setOriginalToken(stored);
      }
    })();
  }, []);

  const handleSaveToken = async () => {
    if (!token.trim()) {
      setTokenStatus({ kind: "error", message: t("emptyError") });
      return;
    }
    setTokenStatus({ kind: "testing" });
    try {
      const viewer = await getViewer(token.trim());
      await keystore.set(SECRET_KEYS.GITHUB_PAT, token.trim());
      setHasGithubToken(true);
      setOriginalToken(token.trim());
      setTokenStatus({ kind: "ok", login: viewer.login });
    } catch (err) {
      setTokenStatus({
        kind: "error",
        message: err instanceof Error ? err.message : t("errorFallback"),
      });
    }
  };

  const handleRemoveToken = async () => {
    if (!confirm(t("removeConfirm"))) return;
    await keystore.remove(SECRET_KEYS.GITHUB_PAT);
    setToken("");
    setOriginalToken(null);
    setHasGithubToken(false);
    setActiveRepo(null);
    setTokenStatus({ kind: "idle" });
  };

  const handleConnectRepo = async () => {
    const cleaned = repoInput
      .trim()
      .replace(/^https?:\/\/(www\.)?github\.com\//, "")
      .replace(/\.git$/, "")
      .replace(/\/$/, "");
    if (!cleaned.includes("/")) {
      setRepoStatus({ kind: "error", message: t("repoFormat") });
      return;
    }
    setRepoStatus({ kind: "loading" });
    try {
      const repo = await getRepo(cleaned);
      const tree = await getTree(repo.fullName, repo.defaultBranch);
      const summary = summarizeTree(repo, tree.entries, tree.truncated);
      setActiveRepo({
        fullName: repo.fullName,
        defaultBranch: repo.defaultBranch,
        treeSummary: summary,
      });
      setRepoStatus({ kind: "ok", fullName: repo.fullName });
    } catch (err) {
      const msg =
        err instanceof GitHubError
          ? err.message
          : err instanceof Error
            ? err.message
            : t("errorFallback");
      setRepoStatus({ kind: "error", message: msg });
    }
  };

  const handleDisconnect = () => {
    setActiveRepo(null);
    setRepoStatus({ kind: "idle" });
  };

  return (
    <div className="p-5 space-y-6">
      {/* ── Section: GitHub token ─────────────────────────────────────── */}
      <section className="space-y-3">
        <header>
          <h3 className="flex items-center gap-1.5 text-base font-semibold tracking-tight">
            <Github size={16} className="text-spark-500" />
            {t("githubTitle")}
          </h3>
          <p className="mt-1 text-sm text-ink-400 leading-relaxed">
            {t("githubDescription")}
          </p>
          <a
            href="https://github.com/settings/tokens/new?scopes=repo&description=Spark%20AI"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs text-spark-500 hover:text-spark-600"
          >
            {t("githubCreateToken")}
            <ExternalLink size={11} />
          </a>
        </header>

        <input
          type="password"
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            if (tokenStatus.kind !== "idle") setTokenStatus({ kind: "idle" });
          }}
          placeholder="ghp_…"
          spellCheck={false}
          autoComplete="off"
          className="w-full rounded-lg border border-cream-300 dark:border-ink-500 bg-cream-50 dark:bg-ink-800 px-3 py-2 text-sm font-mono outline-none focus:border-spark-500 focus:ring-2 focus:ring-spark-500/20"
        />

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveToken}
            disabled={
              tokenStatus.kind === "testing" || token === (originalToken ?? "")
            }
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              tokenStatus.kind === "testing" ||
                token === (originalToken ?? "")
                ? "bg-cream-200 dark:bg-ink-600 text-ink-400 cursor-not-allowed"
                : "bg-spark-500 text-white hover:bg-spark-600",
            )}
          >
            {tokenStatus.kind === "testing" ? (
              <>
                <Loader2 size={14} className="animate-spin" /> {t("saving")}
              </>
            ) : (
              <>
                <Check size={14} /> {t("save")}
              </>
            )}
          </button>
          {originalToken && (
            <button
              onClick={handleRemoveToken}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-ink-400 hover:bg-cream-200 dark:hover:bg-ink-600 hover:text-spark-500 transition-colors"
            >
              <Trash2 size={14} /> {t("remove")}
            </button>
          )}
        </div>

        {tokenStatus.kind === "ok" && (
          <p className="flex items-start gap-1.5 text-sm text-spark-500">
            <Check size={14} className="mt-0.5 shrink-0" />
            {t("connectedAs", { login: tokenStatus.login })}
          </p>
        )}
        {tokenStatus.kind === "error" && (
          <p
            role="alert"
            className="flex items-start gap-1.5 rounded-lg border border-spark-500/40 bg-spark-500/5 px-3 py-2 text-sm text-spark-600 dark:text-spark-400"
          >
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            {tokenStatus.message}
          </p>
        )}
        {hasGithubToken && tokenStatus.kind === "idle" && (
          <p className="flex items-center gap-1.5 text-xs text-ink-400">
            <Check size={12} className="text-spark-500" />
            {t("tokenIsSet")}
          </p>
        )}
      </section>

      {/* ── Section: Active repo ─────────────────────────────────────── */}
      <section className="space-y-3 border-t border-cream-300 dark:border-ink-500 pt-5">
        <header>
          <h3 className="flex items-center gap-1.5 text-base font-semibold tracking-tight">
            <Plug size={16} className="text-spark-500" />
            {t("repoTitle")}
          </h3>
          <p className="mt-1 text-sm text-ink-400 leading-relaxed">
            {t("repoDescription")}
          </p>
        </header>

        <input
          type="text"
          value={repoInput}
          onChange={(e) => {
            setRepoInput(e.target.value);
            if (repoStatus.kind !== "idle") setRepoStatus({ kind: "idle" });
          }}
          placeholder="owner/name"
          disabled={!hasGithubToken}
          spellCheck={false}
          autoComplete="off"
          className="w-full rounded-lg border border-cream-300 dark:border-ink-500 bg-cream-50 dark:bg-ink-800 px-3 py-2 text-sm font-mono outline-none focus:border-spark-500 focus:ring-2 focus:ring-spark-500/20 disabled:opacity-50"
        />

        <div className="flex items-center gap-2">
          <button
            onClick={handleConnectRepo}
            disabled={!hasGithubToken || repoStatus.kind === "loading"}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              !hasGithubToken || repoStatus.kind === "loading"
                ? "bg-cream-200 dark:bg-ink-600 text-ink-400 cursor-not-allowed"
                : "bg-spark-500 text-white hover:bg-spark-600",
            )}
          >
            {repoStatus.kind === "loading" ? (
              <>
                <Loader2 size={14} className="animate-spin" /> {t("connecting")}
              </>
            ) : (
              <>
                <Plug size={14} /> {t("connectRepo")}
              </>
            )}
          </button>
          {activeRepo && (
            <button
              onClick={handleDisconnect}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-ink-400 hover:bg-cream-200 dark:hover:bg-ink-600 hover:text-spark-500 transition-colors"
            >
              <Trash2 size={14} /> {t("disconnect")}
            </button>
          )}
        </div>

        {repoStatus.kind === "ok" && (
          <p className="flex items-start gap-1.5 text-sm text-spark-500">
            <Check size={14} className="mt-0.5 shrink-0" />
            {t("repoOk", { fullName: repoStatus.fullName })}
          </p>
        )}
        {repoStatus.kind === "error" && (
          <p
            role="alert"
            className="flex items-start gap-1.5 rounded-lg border border-spark-500/40 bg-spark-500/5 px-3 py-2 text-sm text-spark-600 dark:text-spark-400"
          >
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            {repoStatus.message}
          </p>
        )}
        {activeRepo && repoStatus.kind === "idle" && (
          <p className="flex items-center gap-1.5 text-xs text-ink-400">
            <Check size={12} className="text-spark-500" />
            {t("currentlyConnected", { fullName: activeRepo.fullName })}
          </p>
        )}
      </section>
    </div>
  );
}
