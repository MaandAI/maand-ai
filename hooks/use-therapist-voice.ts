"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import type { TherapistVoice } from "@/lib/therapist-personas";

interface UseTherapistVoiceOptions {
  voice: TherapistVoice;
  enabled: boolean;
}

export function useTherapistVoice({ voice, enabled }: UseTherapistVoiceOptions) {
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceReady, setVoiceReady] = useState(false);
  const resolvedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Initialize and resolve the best matching voice
  useEffect(() => {
    if (typeof window === "undefined") return;
    synthRef.current = window.speechSynthesis;

    const resolveVoice = () => {
      const voices = synthRef.current!.getVoices();
      if (voices.length === 0) return;

      // Try each preferred voice name in order
      for (const preferred of voice.voiceNames) {
        const found = voices.find((v) =>
          v.name.toLowerCase().includes(preferred.toLowerCase())
        );
        if (found) {
          resolvedVoiceRef.current = found;
          setVoiceReady(true);
          return;
        }
      }

      // Fallback: first English voice
      const englishVoice = voices.find((v) => v.lang.startsWith("en"));
      resolvedVoiceRef.current = englishVoice || voices[0] || null;
      setVoiceReady(true);
    };

    // Chrome loads voices asynchronously
    if (synthRef.current.getVoices().length > 0) {
      resolveVoice();
    } else {
      synthRef.current.addEventListener("voiceschanged", resolveVoice);
    }

    return () => {
      synthRef.current?.removeEventListener("voiceschanged", resolveVoice);
      synthRef.current?.cancel();
    };
  }, [voice.voiceNames]);

  const speak = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve) => {
        if (!enabled || !synthRef.current || !voiceReady) {
          resolve();
          return;
        }

        // Fix for notorious Chrome speech engine stall bug
        synthRef.current.cancel();
        synthRef.current.resume();

        // Strip markdown formatting for cleaner speech
        const cleanText = text
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*(.*?)\*/g, "$1")
          .replace(/#{1,6}\s/g, "")
          .replace(/\n+/g, ". ");

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = voice.rate;
        utterance.pitch = voice.pitch;
        utterance.volume = voice.volume;
        if (resolvedVoiceRef.current) {
          utterance.voice = resolvedVoiceRef.current;
        }

        // Chrome bug: long utterances get garbage collected unless bound to window
        (window as any)._currentUtterance = utterance;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          resolve();
        };
        utterance.onerror = (e) => {
          console.error("Speech Synthesis Error:", e);
          setIsSpeaking(false);
          resolve();
        };

        utteranceRef.current = utterance;
        synthRef.current.speak(utterance);
      });
    },
    [enabled, voiceReady, voice.rate, voice.pitch, voice.volume]
  );

  const stop = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  const toggle = useCallback(() => {
    if (isSpeaking) {
      stop();
    }
  }, [isSpeaking, stop]);

  return { speak, stop, toggle, isSpeaking, voiceReady };
}
