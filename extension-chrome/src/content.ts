/**
 * Content script.
 *
 * Currently a no-op stub: the selection capture happens via
 * chrome.contextMenus.onClicked.info.selectionText in the service
 * worker, so we don't need to inject anything in the page. The script
 * is still declared in the manifest so Chrome wires up the host
 * permissions cleanly and we have a place to hook future features
 * (e.g. "Summarize this page" by walking document.body.innerText).
 */

export {};
