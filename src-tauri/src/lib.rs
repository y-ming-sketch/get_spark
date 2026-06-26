//! Spark desktop shell.
//!
//! This is intentionally a thin wrapper around the web UI today: in dev it
//! loads the Next.js dev server at http://localhost:3000, and the existing
//! Edge-runtime /api/chat route handles DeepSeek streaming.
//!
//! In the next PR (BYOK) this lib will also expose a Rust `chat_stream`
//! command that calls DeepSeek directly using the user's locally-stored
//! API key, eliminating the need for any server in production builds.

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        // .invoke_handler(tauri::generate_handler![]) // <- BYOK commands land here
        .run(tauri::generate_context!())
        .expect("error while running Spark");
}
