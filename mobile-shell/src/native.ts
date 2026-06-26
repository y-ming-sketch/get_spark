/**
 * Capacitor wiring done at app boot.
 *
 *   - Hide the splash screen once the React tree is mounted.
 *   - Make the keyboard "resize" the WebView so the input bar stays visible.
 *   - Keep the OS status bar's color in sync with our theme.
 *
 * All plugin calls are guarded so the same module works in dev (browser)
 * and inside a real native shell.
 */

interface CapacitorBridge {
  isNativePlatform?: () => boolean;
  Plugins?: Record<string, unknown>;
}

function getCap(): CapacitorBridge | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { Capacitor?: CapacitorBridge };
  return w.Capacitor ?? null;
}

export function isCapacitorNative(): boolean {
  const cap = getCap();
  return Boolean(cap?.isNativePlatform?.());
}

export async function initNative(): Promise<void> {
  if (!isCapacitorNative()) return;

  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide({ fadeOutDuration: 200 });
  } catch {
    /* plugin not installed in dev */
  }

  try {
    const { Keyboard } = await import("@capacitor/keyboard");
    // Push the WebView up by the keyboard height so the input doesn't hide.
    await Keyboard.setResizeMode?.({ mode: "native" });
  } catch {
    /* ignore */
  }

  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    await StatusBar.setStyle({ style: prefersDark ? Style.Dark : Style.Light });
  } catch {
    /* ignore */
  }
}

/**
 * Native share sheet wrapper. Falls back to navigator.share on the web.
 * Used by MessageBubble's share action (Phase 5+ enhancement).
 */
export async function shareText(text: string, title = "Spark"): Promise<void> {
  if (isCapacitorNative()) {
    try {
      const { Share } = await import("@capacitor/share");
      await Share.share({ title, text, dialogTitle: title });
      return;
    } catch {
      /* fall through */
    }
  }
  if (typeof navigator !== "undefined" && "share" in navigator) {
    try {
      await navigator.share({ title, text });
    } catch {
      /* user cancelled */
    }
  }
}
