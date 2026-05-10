"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export function useTherapyVoice() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            setIsListening(false);
          }
        };

        recognitionRef.current.onend = () => {
          if (isListening) {
            setTimeout(() => {
              if (isListening) {
                try {
                  recognitionRef.current?.start();
                } catch (e) {
                  console.warn("STT restart failed:", e);
                }
              }
            }, 1000);
          }
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  const startListening = useCallback((onResult: (transcript: string) => void) => {
    if (!recognitionRef.current) return;
    
    recognitionRef.current.onresult = (event: any) => {
      let currentTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          onResult(transcript);
        } else {
          currentTranscript += transcript;
        }
      }
    };

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.error("Failed to start speech recognition", e);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const speakText = useCallback((text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.name.includes("Female") || v.name.includes("Google US English"),
    );
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled]);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    isSpeaking,
    voiceEnabled,
    setVoiceEnabled,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
  };
}
