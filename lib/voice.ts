/**
 * Web Speech API helpers — both directions:
 *   - Speech-to-text (SpeechRecognition / webkitSpeechRecognition)
 *   - Text-to-speech (SpeechSynthesis)
 *
 * Both are stubbed when running on the server or in environments without
 * the relevant APIs (Tauri's WebKit on Linux, older Firefox).
 */

// ── Type bridging ──────────────────────────────────────────────────────────

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: this, ev: SpeechRecognitionEvent) => unknown) | null;
  onerror: ((this: this, ev: SpeechRecognitionErrorEvent) => unknown) | null;
  onend: ((this: this, ev: Event) => unknown) | null;
  onstart: ((this: this, ev: Event) => unknown) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

interface VendorWindow extends Window {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
}

// ── STT ───────────────────────────────────────────────────────────────────

/** Returns a fresh SpeechRecognition instance or null if unsupported. */
export function createRecognition(): SpeechRecognitionInstance | null {
  if (typeof window === "undefined") return null;
  const w = window as VendorWindow;
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;
  return new Ctor();
}

export type SpeechErrorReason =
  | "permission"
  | "no-speech"
  | "network"
  | "unknown";

export function classifyError(ev: SpeechRecognitionErrorEvent): SpeechErrorReason {
  switch (ev.error) {
    case "not-allowed":
    case "service-not-allowed":
      return "permission";
    case "no-speech":
      return "no-speech";
    case "network":
      return "network";
    default:
      return "unknown";
  }
}

/** Map a Spark UI locale to a BCP-47 tag the SpeechRecognition API accepts. */
export function speechLangFor(locale: string): string {
  // Map our 2-letter codes to common BCP-47 dialects with broad browser support.
  const map: Record<string, string> = {
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE",
    ja: "ja-JP",
    zh: "zh-CN",
    ko: "ko-KR",
    pt: "pt-BR",
    ru: "ru-RU",
    ar: "ar-SA",
    hi: "hi-IN",
    id: "id-ID",
  };
  return map[locale] ?? "en-US";
}

// ── TTS ───────────────────────────────────────────────────────────────────

/** True when the platform exposes window.speechSynthesis. */
export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Cancel any in-flight utterance. Safe to call when nothing is speaking. */
export function ttsCancel(): void {
  if (ttsSupported()) window.speechSynthesis.cancel();
}

export interface SpeakOptions {
  /** BCP-47 tag, e.g. en-US. Defaults to speechLangFor(locale). */
  lang?: string;
  /** 0.5 - 2.0, default 1.0 */
  rate?: number;
  /** 0.0 - 1.0, default 1.0 */
  volume?: number;
  onEnd?: () => void;
  onError?: () => void;
}

/**
 * Speak the given text. Cancels any prior utterance first so that toggling
 * playback feels instant.
 */
export function speak(text: string, opts: SpeakOptions = {}): void {
  if (!ttsSupported() || !text.trim()) return;
  ttsCancel();
  const utter = new SpeechSynthesisUtterance(text);
  if (opts.lang) utter.lang = opts.lang;
  utter.rate = opts.rate ?? 1.0;
  utter.volume = opts.volume ?? 1.0;
  if (opts.onEnd) utter.onend = opts.onEnd;
  if (opts.onError) utter.onerror = opts.onError;
  window.speechSynthesis.speak(utter);
}
