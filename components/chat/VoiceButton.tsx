"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { classifyError, createRecognition, speechLangFor } from "@/lib/voice";
import { useSpark } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Props {
  /** Called whenever the live transcript changes (interim or final). */
  onTranscript: (text: string, isFinal: boolean) => void;
  disabled?: boolean;
}

/**
 * Push-to-talk mic. Click to start; click again or release outside to stop.
 * Live (interim) results are streamed to the parent via onTranscript so the
 * message input can render the in-progress transcription.
 */
export function VoiceButton({ onTranscript, disabled }: Props) {
  const t = useTranslations("voice");
  const uiLocale = useLocale();
  const sttLang = useSpark((s) => s.sttLang);

  const [supported, setSupported] = useState<boolean | null>(null);
  const [recording, setRecording] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recRef = useRef<ReturnType<typeof createRecognition> | null>(null);

  useEffect(() => {
    const rec = createRecognition();
    setSupported(Boolean(rec));
    return () => {
      try {
        recRef.current?.abort();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const start = () => {
    const rec = createRecognition();
    if (!rec) {
      setErrorMsg(t("unsupported"));
      return;
    }
    rec.lang = sttLang === "auto" ? speechLangFor(uiLocale) : sttLang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;

    rec.onresult = (ev) => {
      let interim = "";
      let final = "";
      for (let i = ev.resultIndex; i < ev.results.length; i += 1) {
        const result = ev.results[i];
        const alt = result[0];
        if (result.isFinal) final += alt.transcript;
        else interim += alt.transcript;
      }
      if (final) onTranscript(final, true);
      else if (interim) onTranscript(interim, false);
    };
    rec.onerror = (ev) => {
      const reason = classifyError(ev);
      if (reason === "permission") setErrorMsg(t("permissionDenied"));
      else if (reason === "no-speech") setErrorMsg(null);
      else setErrorMsg(t("unsupported"));
      setRecording(false);
    };
    rec.onend = () => setRecording(false);

    setErrorMsg(null);
    recRef.current = rec;
    try {
      rec.start();
      setRecording(true);
    } catch {
      // Some browsers throw if start() is called too quickly after a prior stop
      setErrorMsg(t("unsupported"));
    }
  };

  const stop = () => {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
  };

  if (supported === false) return null; // Hide if the browser doesn't support it

  return (
    <div className="relative">
      <button
        type="button"
        onClick={recording ? stop : start}
        disabled={disabled || supported === null}
        aria-label={recording ? t("stopAria") : t("startAria")}
        aria-pressed={recording}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
          recording
            ? "bg-spark-500 text-white animate-pulse"
            : "text-ink-400 hover:bg-cream-200 dark:hover:bg-ink-600 hover:text-ink-700 dark:hover:text-ink-100",
          (disabled || supported === null) && "opacity-50 cursor-not-allowed",
        )}
      >
        {supported === null ? (
          <Loader2 size={14} className="animate-spin" />
        ) : recording ? (
          <Mic size={14} fill="currentColor" />
        ) : (
          <MicOff size={14} />
        )}
      </button>
      {errorMsg && (
        <div
          role="alert"
          className="absolute bottom-full end-0 mb-2 w-56 rounded-lg border border-spark-500/40 bg-spark-500/5 px-2 py-1 text-[11px] text-spark-600 dark:text-spark-400 leading-snug"
        >
          {errorMsg}
        </div>
      )}
    </div>
  );
}
