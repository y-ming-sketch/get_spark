/// <reference types="chrome" />

/**
 * Spark MV3 service worker.
 *
 * Responsibilities:
 *   1. Register a "Ask Spark" context menu on selection.
 *   2. When the menu is invoked, stash the selected text in
 *      chrome.storage.session and open the side panel.
 *   3. When the action icon is clicked, open the side panel without
 *      stashing anything.
 *
 * No analytics, no telemetry — see /privacy in the web app and the
 * SECURITY.md threat model.
 */

const MENU_ID = "spark-ask";
const SELECTION_KEY = "spark.pendingSelection";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: "Ask Spark about \"%s\"",
    contexts: ["selection"],
  });
  // Always open the side panel when the toolbar icon is clicked
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch(() => undefined);
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID) return;
  if (typeof info.selectionText !== "string" || !info.selectionText.trim()) return;

  // Stash the selection so the side panel can pick it up on mount.
  try {
    await chrome.storage.session.set({
      [SELECTION_KEY]: {
        text: info.selectionText.trim(),
        sourceUrl: tab?.url ?? null,
        ts: Date.now(),
      },
    });
  } catch {
    /* ignore — selection just won't auto-fill */
  }

  // Open the side panel in the active window
  if (tab?.windowId !== undefined) {
    await chrome.sidePanel
      .open({ windowId: tab.windowId })
      .catch(() => undefined);
  }
});

export {};
