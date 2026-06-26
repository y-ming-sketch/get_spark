/**
 * GitHub REST client — PAT-based, fetch-only (no Octokit dependency).
 *
 * The user's token is stored encrypted in the Spark keystore and sent
 * directly to api.github.com via the Authorization header. The token
 * never reaches any server we control; this client runs entirely
 * client-side in every Spark surface (web, Tauri, extension, mobile).
 */

import { keystore, SECRET_KEYS } from "./keystore";

const API_BASE = "https://api.github.com";

export interface GitHubViewer {
  login: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface GitHubRepo {
  /** "<owner>/<name>" canonical form */
  fullName: string;
  owner: string;
  name: string;
  private: boolean;
  defaultBranch: string;
  description: string | null;
  htmlUrl: string;
}

export interface GitHubTreeEntry {
  path: string;
  type: "blob" | "tree" | "commit";
  size?: number;
}

export class GitHubError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "GitHubError";
  }
}

async function readToken(): Promise<string> {
  const tok = await keystore.get(SECRET_KEYS.GITHUB_PAT);
  if (!tok) {
    throw new GitHubError("Not connected. Add a GitHub token in Settings.", 401);
  }
  return tok;
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await readToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GitHubError(
      `${res.status} ${res.statusText}${body ? ` — ${body.slice(0, 200)}` : ""}`,
      res.status,
    );
  }
  // Some GitHub endpoints return empty 204s
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

/** Validate the token by hitting /user. Used in the Connections settings. */
export async function getViewer(token: string): Promise<GitHubViewer> {
  const res = await fetch(`${API_BASE}/user`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GitHubError(
      `${res.status} ${res.statusText}${body ? ` — ${body.slice(0, 200)}` : ""}`,
      res.status,
    );
  }
  const data = (await res.json()) as {
    login: string;
    name: string | null;
    avatar_url: string | null;
  };
  return {
    login: data.login,
    name: data.name,
    avatarUrl: data.avatar_url,
  };
}

/** Fetch repo metadata for "owner/name". */
export async function getRepo(fullName: string): Promise<GitHubRepo> {
  const [owner, name] = fullName.split("/");
  if (!owner || !name) {
    throw new GitHubError(
      "Repo must be in 'owner/name' format.",
      400,
    );
  }
  const data = await req<{
    full_name: string;
    private: boolean;
    default_branch: string;
    description: string | null;
    html_url: string;
  }>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`);
  return {
    fullName: data.full_name,
    owner,
    name,
    private: data.private,
    defaultBranch: data.default_branch,
    description: data.description,
    htmlUrl: data.html_url,
  };
}

/**
 * List the file tree of a repo (entire tree at a given ref, recursive).
 * GitHub truncates above ~7 MB / 100k entries — we surface the truncated
 * flag so callers can degrade gracefully.
 */
export async function getTree(
  fullName: string,
  ref: string,
): Promise<{ entries: GitHubTreeEntry[]; truncated: boolean }> {
  const [owner, name] = fullName.split("/");
  const data = await req<{
    tree: { path: string; type: string; size?: number }[];
    truncated: boolean;
  }>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/git/trees/${encodeURIComponent(ref)}?recursive=1`,
  );
  return {
    entries: data.tree
      .filter((t) => t.type === "blob" || t.type === "tree")
      .map((t) => ({
        path: t.path,
        type: t.type as "blob" | "tree",
        size: t.size,
      })),
    truncated: data.truncated,
  };
}

/** Fetch a single file's UTF-8 decoded content. Errors on binary or >1 MB. */
export async function getFileContent(
  fullName: string,
  ref: string,
  path: string,
): Promise<string> {
  const [owner, name] = fullName.split("/");
  const data = await req<{
    content?: string;
    encoding?: string;
    size?: number;
    type?: string;
  }>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(ref)}`,
  );
  if (data.type !== "file" || !data.content) {
    throw new GitHubError(`${path} is not a regular file`, 400);
  }
  if ((data.size ?? 0) > 1024 * 1024) {
    throw new GitHubError(`${path} exceeds the 1 MB read cap`, 413);
  }
  if (data.encoding === "base64") {
    // Decode base64 → UTF-8 string
    const binary = atob(data.content.replace(/\n/g, ""));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder("utf-8").decode(bytes);
  }
  return data.content;
}

/**
 * Build a compact, model-friendly summary of a repo's file tree.
 * Truncates the path list to roughly 8 KB so it fits inside a system
 * message without blowing the context window.
 */
export function summarizeTree(
  repo: GitHubRepo,
  entries: GitHubTreeEntry[],
  truncated: boolean,
  budgetBytes = 8192,
): string {
  // Prefer file paths over directories, shorter paths first.
  const paths = entries
    .filter((e) => e.type === "blob")
    .map((e) => e.path)
    .sort((a, b) => a.length - b.length);

  const lines: string[] = [];
  let used = 0;
  for (const p of paths) {
    const next = `- ${p}`;
    if (used + next.length + 1 > budgetBytes) {
      lines.push(`- … (${paths.length - lines.length} more files truncated)`);
      break;
    }
    lines.push(next);
    used += next.length + 1;
  }

  const header = [
    `Connected GitHub repository: \`${repo.fullName}\``,
    repo.description ? `Description: ${repo.description}` : null,
    `Default branch: \`${repo.defaultBranch}\``,
    `Visibility: ${repo.private ? "private" : "public"}`,
    "",
    truncated
      ? "File tree (truncated by GitHub):"
      : "File tree:",
  ]
    .filter(Boolean)
    .join("\n");

  return `${header}\n${lines.join("\n")}`;
}
