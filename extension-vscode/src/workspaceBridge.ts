/**
 * Workspace bridge — methods the webview can invoke to peek into the
 * editor. Kept minimal on purpose: every method should be cheap to call,
 * return only what the webview asked for, and never mutate state.
 */
import * as vscode from "vscode";

interface ActiveFileResult {
  path: string;
  content: string;
  language: string;
}

interface SelectionResult {
  path: string;
  content: string;
  language: string;
  startLine: number;
  endLine: number;
}

interface OpenFile {
  path: string;
  language: string;
  isDirty: boolean;
}

const READ_CAP = 1024 * 1024; // 1 MB — same cap as the file picker

export async function handleBridgeRequest(
  method: string,
  params?: Record<string, unknown>,
): Promise<unknown> {
  switch (method) {
    case "getActiveFile":
      return getActiveFile();
    case "getSelection":
      return getSelection();
    case "listOpenFiles":
      return listOpenFiles();
    case "readWorkspaceFile":
      return readWorkspaceFile((params?.path as string) ?? "");
    default:
      throw new Error(`Unknown bridge method: ${method}`);
  }
}

function getActiveFile(): ActiveFileResult | null {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return null;
  return {
    path: vscode.workspace.asRelativePath(editor.document.uri),
    content: editor.document.getText(),
    language: editor.document.languageId,
  };
}

function getSelection(): SelectionResult | null {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.selection.isEmpty) return null;
  const content = editor.document.getText(editor.selection);
  return {
    path: vscode.workspace.asRelativePath(editor.document.uri),
    content,
    language: editor.document.languageId,
    startLine: editor.selection.start.line + 1,
    endLine: editor.selection.end.line + 1,
  };
}

function listOpenFiles(): OpenFile[] {
  return vscode.workspace.textDocuments
    .filter(
      (doc) =>
        doc.uri.scheme === "file" && !doc.isUntitled && doc.languageId !== "log",
    )
    .map((doc) => ({
      path: vscode.workspace.asRelativePath(doc.uri),
      language: doc.languageId,
      isDirty: doc.isDirty,
    }));
}

async function readWorkspaceFile(path: string): Promise<ActiveFileResult> {
  if (!path) throw new Error("path is required");
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) {
    throw new Error("No workspace folder open");
  }
  const uri = vscode.Uri.joinPath(folders[0].uri, path);
  const bytes = await vscode.workspace.fs.readFile(uri);
  if (bytes.byteLength > READ_CAP) {
    throw new Error(`${path} exceeds the 1 MB read cap`);
  }
  const content = new TextDecoder("utf-8").decode(bytes);
  // Best-effort language: look up by extension via VS Code's known mapping
  const ext = path.split(".").pop() ?? "";
  return {
    path,
    content,
    language: ext,
  };
}
