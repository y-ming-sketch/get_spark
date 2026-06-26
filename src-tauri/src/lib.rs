//! Spark desktop shell.
//!
//! Exposes two commands to the React frontend:
//!
//! - `chat_stream` opens a streaming request to DeepSeek (or any
//!   OpenAI-compatible endpoint) and emits one event per content delta:
//!     `spark://chunk-<request_id>`  payload `{ content: String }`
//!     `spark://done-<request_id>`   payload `()`
//!     `spark://error-<request_id>`  payload `{ message: String }`
//!
//! - `chat_stream_abort` flips an atomic flag the running task polls
//!   between chunks, allowing the user to interrupt generation. The
//!   abort path emits `done` (not `error`) — interruption is normal flow.
//!
//! BYOK: the API key is provided per-request by the frontend (read from
//! the encrypted keystore on launch). The Rust process never persists it.

use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};

use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use tauri::{Emitter, State, Window};

// ─── Wire types ────────────────────────────────────────────────────────────

#[derive(Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Serialize)]
struct DeepSeekRequest<'a> {
    model: &'a str,
    messages: &'a [ChatMessage],
    stream: bool,
    temperature: f32,
}

#[derive(Serialize, Clone)]
struct ChunkPayload {
    content: String,
}

#[derive(Serialize, Clone)]
struct ErrorPayload {
    message: String,
}

// ─── In-flight tracking for abort ──────────────────────────────────────────

#[derive(Default)]
pub struct InFlight(Mutex<HashMap<String, Arc<AtomicBool>>>);

// ─── Commands ──────────────────────────────────────────────────────────────

#[tauri::command]
async fn chat_stream(
    window: Window,
    in_flight: State<'_, InFlight>,
    request_id: String,
    api_key: String,
    base_url: String,
    model: String,
    messages: Vec<ChatMessage>,
) -> Result<(), String> {
    let aborted = Arc::new(AtomicBool::new(false));

    if let Ok(mut map) = in_flight.0.lock() {
        map.insert(request_id.clone(), aborted.clone());
    }

    let result = run_stream(
        &window,
        &request_id,
        &api_key,
        &base_url,
        &model,
        &messages,
        &aborted,
    )
    .await;

    // Always emit a terminal event so the frontend's async queue drains.
    match &result {
        Ok(_) => {
            let _ = window.emit(&format!("spark://done-{}", request_id), ());
        }
        Err(msg) => {
            let _ = window.emit(
                &format!("spark://error-{}", request_id),
                ErrorPayload {
                    message: msg.clone(),
                },
            );
        }
    }

    if let Ok(mut map) = in_flight.0.lock() {
        map.remove(&request_id);
    }

    result
}

#[tauri::command]
fn chat_stream_abort(
    in_flight: State<'_, InFlight>,
    request_id: String,
) -> Result<(), String> {
    if let Ok(mut map) = in_flight.0.lock() {
        if let Some(flag) = map.remove(&request_id) {
            flag.store(true, Ordering::Relaxed);
        }
    }
    Ok(())
}

// ─── Streaming core ────────────────────────────────────────────────────────

async fn run_stream(
    window: &Window,
    request_id: &str,
    api_key: &str,
    base_url: &str,
    model: &str,
    messages: &[ChatMessage],
    aborted: &Arc<AtomicBool>,
) -> Result<(), String> {
    let url = format!(
        "{}/chat/completions",
        base_url.trim_end_matches('/')
    );

    let client = reqwest::Client::builder()
        .user_agent(concat!("spark/", env!("CARGO_PKG_VERSION")))
        .build()
        .map_err(|e| e.to_string())?;

    let body = DeepSeekRequest {
        model,
        messages,
        stream: true,
        temperature: 0.7,
    };

    let response = client
        .post(&url)
        .bearer_auth(api_key)
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        return Err(format!(
            "DeepSeek API error ({}): {}",
            status,
            text.chars().take(500).collect::<String>()
        ));
    }

    let mut stream = response.bytes_stream();
    let mut buf: Vec<u8> = Vec::new();

    while let Some(chunk) = stream.next().await {
        if aborted.load(Ordering::Relaxed) {
            return Ok(()); // user pressed Stop; treat as normal completion
        }
        let chunk = chunk.map_err(|e| format!("Stream error: {}", e))?;
        buf.extend_from_slice(&chunk);

        // SSE frames are separated by '\n'. UTF-8 multi-byte sequences
        // never contain a 0x0A byte, so splitting on raw bytes is safe.
        while let Some(nl) = buf.iter().position(|&b| b == b'\n') {
            let line_bytes: Vec<u8> = buf.drain(..=nl).collect();
            let trimmed_end = if line_bytes.last() == Some(&b'\n') {
                line_bytes.len() - 1
            } else {
                line_bytes.len()
            };
            let line = String::from_utf8_lossy(&line_bytes[..trimmed_end]);
            let line = line.trim();

            if line.is_empty() || !line.starts_with("data:") {
                continue;
            }
            let data = line[5..].trim();
            if data == "[DONE]" {
                return Ok(());
            }

            // Tolerant JSON parsing — bad chunks are skipped, not fatal.
            let Ok(parsed) = serde_json::from_str::<serde_json::Value>(data) else {
                continue;
            };
            let delta = parsed
                .get("choices")
                .and_then(|c| c.get(0))
                .and_then(|c| c.get("delta"));
            let content = delta
                .and_then(|d| d.get("content"))
                .and_then(|c| c.as_str())
                .or_else(|| {
                    delta
                        .and_then(|d| d.get("reasoning_content"))
                        .and_then(|c| c.as_str())
                });
            if let Some(c) = content {
                if !c.is_empty() {
                    let _ = window.emit(
                        &format!("spark://chunk-{}", request_id),
                        ChunkPayload {
                            content: c.to_string(),
                        },
                    );
                }
            }
        }
    }

    Ok(())
}

// ─── App entry ─────────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(InFlight::default())
        .invoke_handler(tauri::generate_handler![chat_stream, chat_stream_abort])
        .run(tauri::generate_context!())
        .expect("error while running Spark");
}
