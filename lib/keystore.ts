/**
 * keystore — encrypted local storage for secrets (API keys, PATs).
 *
 * Web/PWA/Chrome-extension implementation uses WebCrypto AES-GCM over a
 * key derived via PBKDF2 from a device-bound salt stored in localStorage.
 *
 * HONEST DISCLOSURE
 * -----------------
 * On the web platform this is OBFUSCATION, not true security: any
 * JavaScript that runs in the same origin can derive the same key.
 * Real protection comes from the platform:
 *   • Tauri  — app data dir lives in an OS-restricted location and
 *              future PRs swap this for the OS keychain.
 *   • Capacitor — Preferences API + biometric unlock.
 *   • VS Code — SecretStorage API.
 * Until those land, the encryption layer here defends against the
 * common case of someone pulling localStorage from a backup or browser
 * inspector and seeing a plaintext key. It does NOT defend against
 * malicious scripts on the same origin.
 */

export interface Keystore {
  /** True if the runtime can read/write secrets. */
  available(): boolean;
  /** Fetch a stored secret. Returns null if missing. */
  get(key: string): Promise<string | null>;
  /** Store a secret, replacing any existing value. */
  set(key: string, value: string): Promise<void>;
  /** Remove a single key. */
  remove(key: string): Promise<void>;
  /** Wipe all stored secrets and reset the salt. */
  clear(): Promise<void>;
}

const STORAGE_KEY = "spark:keystore:v1";
const SALT_KEY = "spark:keystore:salt:v1";

// ────────────────────────────────────────────────────────────────────────────
// Base64 helpers (chunked to stay off the call stack for large buffers)
// ────────────────────────────────────────────────────────────────────────────

function bytesToBase64(bytes: Uint8Array): string {
  let str = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    str += String.fromCharCode(
      ...bytes.subarray(i, Math.min(i + chunk, bytes.length)),
    );
  }
  return btoa(str);
}

/**
 * Always returns a Uint8Array backed by a fresh ArrayBuffer (not a
 * SharedArrayBuffer / ArrayBufferLike), so it satisfies the WebCrypto
 * `BufferSource` type without casts.
 */
function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64);
  const buf = new ArrayBuffer(bin.length);
  const out = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

function randomBytes(n: number): Uint8Array<ArrayBuffer> {
  const buf = new ArrayBuffer(n);
  const arr = new Uint8Array(buf);
  crypto.getRandomValues(arr);
  return arr;
}

// ────────────────────────────────────────────────────────────────────────────
// WebCrypto plumbing
// ────────────────────────────────────────────────────────────────────────────

function isSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof crypto !== "undefined" &&
    typeof crypto.subtle !== "undefined"
  );
}

function getOrCreateSalt(): Uint8Array<ArrayBuffer> {
  const stored = localStorage.getItem(SALT_KEY);
  if (stored) return base64ToBytes(stored);
  const salt = randomBytes(16);
  localStorage.setItem(SALT_KEY, bytesToBase64(salt));
  return salt;
}

let cachedKey: CryptoKey | null = null;

async function deriveKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  const salt = getOrCreateSalt();
  // Origin-bound passphrase — see disclosure at top of file. The point is
  // to defeat trivial inspection, not to be a vault.
  const passphrase = `spark::${typeof location !== "undefined" ? location.origin : "tauri"}::v1`;
  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );
  cachedKey = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
  return cachedKey;
}

async function readBlob(): Promise<Record<string, string>> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as { iv: string; ciphertext: string };
    const iv = base64ToBytes(parsed.iv);
    const ciphertext = base64ToBytes(parsed.ciphertext);
    const key = await deriveKey();
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext,
    );
    return JSON.parse(new TextDecoder().decode(decrypted));
  } catch {
    // Corrupt / wrong-salt blob — pretend it's empty rather than crash.
    return {};
  }
}

async function writeBlob(map: Record<string, string>): Promise<void> {
  const iv = randomBytes(12);
  const key = await deriveKey();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(JSON.stringify(map)),
  );
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      iv: bytesToBase64(iv),
      ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
    }),
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Public Keystore
// ────────────────────────────────────────────────────────────────────────────

export const keystore: Keystore = {
  available() {
    return isSupported();
  },

  async get(name) {
    if (!isSupported()) return null;
    const map = await readBlob();
    return map[name] ?? null;
  },

  async set(name, value) {
    if (!isSupported()) throw new Error("Keystore not supported");
    const map = await readBlob();
    map[name] = value;
    await writeBlob(map);
  },

  async remove(name) {
    if (!isSupported()) return;
    const map = await readBlob();
    if (!(name in map)) return;
    delete map[name];
    await writeBlob(map);
  },

  async clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SALT_KEY);
    cachedKey = null;
  },
};

// Stable names used across the app
export const SECRET_KEYS = {
  DEEPSEEK_API_KEY: "deepseek_api_key",
  DEEPSEEK_BASE_URL: "deepseek_base_url",
  // future: GITHUB_PAT, ANTHROPIC_API_KEY, etc.
} as const;
