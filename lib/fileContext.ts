/**
 * File and folder context for chats.
 *
 * Reads text files dropped into the chat input, enforces size caps, and
 * rejects binary content. The resulting Attachment[] gets prepended to the
 * next user message so the assistant sees the source.
 */

export interface Attachment {
  id: string;
  /** Display name (relative path if available, else file name). */
  name: string;
  size: number;
  content: string;
}

export type FileReadOutcome =
  | { kind: "ok"; attachment: Attachment }
  | { kind: "too-large"; name: string }
  | { kind: "binary"; name: string };

const MAX_FILE_BYTES = 1024 * 1024; // 1 MB per file
const TEXT_EXTS = new Set([
  "txt", "md", "markdown", "mdx", "rst",
  "ts", "tsx", "js", "jsx", "mjs", "cjs",
  "py", "rb", "go", "rs", "java", "kt", "swift",
  "c", "h", "cc", "cpp", "hpp", "cs", "m", "mm",
  "html", "htm", "css", "scss", "sass", "less",
  "json", "yaml", "yml", "toml", "xml", "ini", "env",
  "sh", "bash", "zsh", "fish", "ps1", "bat",
  "sql", "graphql", "proto",
  "vue", "svelte", "astro",
  "dockerfile", "makefile", "gitignore", "gitattributes",
  "lock", "log", "csv", "tsv",
]);

function looksTextual(name: string, content: string): boolean {
  // 1. Extension allowlist
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (TEXT_EXTS.has(ext)) return true;
  // Common toolchain files without extensions
  const bare = name.split("/").pop()?.toLowerCase() ?? "";
  if (
    bare === "dockerfile" ||
    bare === "makefile" ||
    bare === "rakefile" ||
    bare.startsWith(".env")
  ) {
    return true;
  }
  // 2. Heuristic: count NUL bytes in the first 1 KB. Real text doesn't have any.
  const sample = content.slice(0, 1024);
  for (let i = 0; i < sample.length; i += 1) {
    if (sample.charCodeAt(i) === 0) return false;
  }
  return true;
}

function makeId(): string {
  // Cheap random id without bringing in nanoid here.
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Read a single File into an Attachment, or describe why it was rejected.
 */
export async function readFile(file: File, relativePath?: string): Promise<FileReadOutcome> {
  const name = relativePath || file.name;
  if (file.size > MAX_FILE_BYTES) {
    return { kind: "too-large", name };
  }
  const content = await file.text();
  if (!looksTextual(name, content)) {
    return { kind: "binary", name };
  }
  return {
    kind: "ok",
    attachment: {
      id: makeId(),
      name,
      size: file.size,
      content,
    },
  };
}

/**
 * Read every File from a DataTransferItemList, including folder entries (when
 * the browser surfaces webkitGetAsEntry). Returns outcomes in the original
 * traversal order. Skips files matching common ignore patterns.
 */
export async function readDrop(
  items: DataTransferItemList | null,
  files: FileList | null,
): Promise<FileReadOutcome[]> {
  const outcomes: FileReadOutcome[] = [];

  // Walk webkitEntries when available so folder drops work
  const entries: FileSystemEntry[] = [];
  if (items) {
    for (let i = 0; i < items.length; i += 1) {
      const entry = (items[i] as DataTransferItem & {
        webkitGetAsEntry?: () => FileSystemEntry | null;
      }).webkitGetAsEntry?.();
      if (entry) entries.push(entry);
    }
  }

  if (entries.length > 0) {
    for (const entry of entries) {
      await walk(entry, "", outcomes);
    }
  } else if (files) {
    // Fallback: flat file list
    for (let i = 0; i < files.length; i += 1) {
      outcomes.push(await readFile(files[i]));
    }
  }
  return outcomes;
}

const IGNORE = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "target",
  ".DS_Store",
  ".venv",
  "__pycache__",
]);

async function walk(
  entry: FileSystemEntry,
  prefix: string,
  out: FileReadOutcome[],
): Promise<void> {
  if (IGNORE.has(entry.name)) return;
  const path = prefix ? `${prefix}/${entry.name}` : entry.name;

  if (entry.isFile) {
    const fileEntry = entry as FileSystemFileEntry;
    const file = await new Promise<File>((resolve, reject) =>
      fileEntry.file(resolve, reject),
    );
    out.push(await readFile(file, path));
  } else if (entry.isDirectory) {
    const dirEntry = entry as FileSystemDirectoryEntry;
    const reader = dirEntry.createReader();
    // readEntries returns batches — keep calling until it returns []
    let batch: FileSystemEntry[];
    do {
      batch = await new Promise<FileSystemEntry[]>((resolve, reject) =>
        reader.readEntries(resolve, reject),
      );
      for (const child of batch) {
        await walk(child, path, out);
      }
    } while (batch.length > 0);
  }
}

/**
 * Format attached files into a markdown block that we prepend to the user's
 * next message. Keeps the assistant's view of the workspace deterministic.
 */
export function attachmentsToContext(attachments: Attachment[]): string {
  if (attachments.length === 0) return "";
  const blocks = attachments.map((a) => {
    const lang = a.name.split(".").pop() ?? "";
    return `### \`${a.name}\`\n\n\`\`\`${lang}\n${a.content}\n\`\`\``;
  });
  return `**Attached files:**\n\n${blocks.join("\n\n")}\n\n---\n\n`;
}
