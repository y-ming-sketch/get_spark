/**
 * SparkViewProvider — VS Code WebviewViewProvider hosting the React chat.
 *
 * The webview HTML is produced by extension-vscode/webview/ (a separate
 * Vite build that imports the shared /components and /lib from the repo
 * root). At build time the static files are copied into dist/webview/
 * and served from there with a tight Content-Security-Policy.
 *
 * Two-way bridge with the webview:
 *   - Extension → webview: postMessage from sendToWebview()
 *   - Webview → extension: WebviewView.onDidReceiveMessage (handles
 *     bridge.getActiveFile, bridge.getSelection, bridge.listOpenFiles)
 */
import * as vscode from "vscode";
import { handleBridgeRequest } from "./workspaceBridge";

interface BridgeRequestMessage {
  type: "spark.bridge.request";
  id: string;
  method:
    | "getActiveFile"
    | "getSelection"
    | "listOpenFiles"
    | "readWorkspaceFile";
  params?: Record<string, unknown>;
}

export class SparkViewProvider implements vscode.WebviewViewProvider {
  private view: vscode.WebviewView | undefined;

  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(view: vscode.WebviewView): void {
    this.view = view;
    view.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, "dist", "webview"),
      ],
    };
    view.webview.html = this.buildHtml(view.webview);

    view.webview.onDidReceiveMessage(async (msg: BridgeRequestMessage) => {
      if (msg?.type !== "spark.bridge.request") return;
      try {
        const result = await handleBridgeRequest(msg.method, msg.params);
        view.webview.postMessage({
          type: "spark.bridge.response",
          id: msg.id,
          result,
        });
      } catch (err) {
        view.webview.postMessage({
          type: "spark.bridge.response",
          id: msg.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    });
  }

  /** Push an event to the webview (selection asks, attach file, etc.). */
  sendToWebview(message: unknown): void {
    this.view?.webview.postMessage(message);
  }

  private buildHtml(webview: vscode.Webview): string {
    const dist = vscode.Uri.joinPath(
      this.context.extensionUri,
      "dist",
      "webview",
    );
    // The webview's Vite build always emits these names (configured in
    // webview/vite.config.ts via output.entryFileNames / chunkFileNames).
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(dist, "assets", "main.js"),
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(dist, "assets", "main.css"),
    );
    const nonce = makeNonce();
    const csp = [
      "default-src 'none'",
      `style-src ${webview.cspSource} 'unsafe-inline'`,
      `script-src 'nonce-${nonce}'`,
      "connect-src https://api.deepseek.com https://api.github.com",
      `img-src ${webview.cspSource} data:`,
      `font-src ${webview.cspSource}`,
    ].join("; ");

    return /* html */ `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="${csp}" />
    <title>Spark</title>
    <link rel="stylesheet" href="${styleUri}" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
  </body>
</html>`;
  }
}

function makeNonce(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 32; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}
