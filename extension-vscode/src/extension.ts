/**
 * Spark VS Code extension — entry point.
 *
 * Registers:
 *   - A custom Activity Bar container hosting a webview chat view
 *   - Commands to open Spark, attach the active file, and ask about a
 *     selection (right-click menu)
 *
 * All AI traffic is BYOK: the user pastes a DeepSeek key inside the
 * webview's Settings panel, where it's stored encrypted in localStorage
 * scoped to the webview origin. Future PRs will swap that for VS Code's
 * SecretStorage API so the key is OS-protected.
 */
import * as vscode from "vscode";
import { SparkViewProvider } from "./SparkProvider";

export function activate(context: vscode.ExtensionContext): void {
  const provider = new SparkViewProvider(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("sparkChat", provider, {
      webviewOptions: { retainContextWhenHidden: true },
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("spark.open", async () => {
      await vscode.commands.executeCommand("sparkChat.focus");
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("spark.askAboutSelection", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("Spark: no active editor.");
        return;
      }
      const text = editor.document.getText(editor.selection);
      if (!text.trim()) {
        vscode.window.showInformationMessage(
          "Spark: nothing selected — select code first.",
        );
        return;
      }
      await vscode.commands.executeCommand("sparkChat.focus");
      provider.sendToWebview({
        type: "spark.askSelection",
        payload: {
          text,
          language: editor.document.languageId,
          path: vscode.workspace.asRelativePath(editor.document.uri),
        },
      });
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("spark.attachActiveFile", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("Spark: no active editor.");
        return;
      }
      await vscode.commands.executeCommand("sparkChat.focus");
      provider.sendToWebview({
        type: "spark.attachFile",
        payload: {
          path: vscode.workspace.asRelativePath(editor.document.uri),
          content: editor.document.getText(),
          language: editor.document.languageId,
        },
      });
    }),
  );
}

export function deactivate(): void {
  /* no-op */
}
