"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Volume2, Square } from "lucide-react";
import { speak, ttsCancel, ttsSupported, speechLangFor } from "@/lib/voice";

interface Props {
  text: string;
}

/**
 * Per-message text-to-speech toggle. One global utterance at a time so
 * starting another button stops the previous (handled by speak()'s implicit
 * cancel-before-speak).
 */
export function SpeakButton({ text }: Props) {
  const t = useTranslations("voice");
  const locale = useLocale();
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(ttsSupported());
  }, []);

  // If another SpeakButton is started, this one should reflect that it's no
  // longer speaking. Easiest is a polling check while we're in the speaking
  // state — speechSynthesis.speaking is the source of truth.
  useEffect(() => {
    if (!speaking) return;
    const id = setInterval(() => {
      if (typeof window !== "undefined" && !window.speechSynthesis.speaking) {
        setSpeaking(false);
      }
    }, 300);
    return () => clearInterval(id);
  }, [speaking]);

  if (!supported) return null;

  const toggle = () => {
    if (speaking) {
      ttsCancel();
      setSpeaking(false);
      return;
    }
    speak(text, {
      lang: speechLangFor(locale),
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
    setSpeaking(true);
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-ink-400 hover:text-ink-700 dark:hover:text-ink-100"
      aria-label={speaking ? t("stopSpeakAria") : t("speakAria")}
      aria-pressed={speaking}
    >
      {speaking ? <Square size={12} fill="currentColor" /> : <Volume2 size={12} />}
    </button>
  );
}
