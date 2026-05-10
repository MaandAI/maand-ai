"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import type { TherapistVoice } from "@/lib/therapist-personas";

interface MediaControllerOptions {
  voice: TherapistVoice;
  onTranscript?: (text: string) => void;
  enableVideo?: boolean;
}

export function useUnifiedMedia({
  voice,
  onTranscript,
  enableVideo = false,
}: MediaControllerOptions) {
  // --- States ---
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [camStream, setCamStream] = useState<MediaStream | null>(null);

  // --- Refs ---
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null); // Persistent Mic Stream
  const videoStreamRef = useRef<MediaStream | null>(null); // Persistent Cam Stream
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const voiceQueueRef = useRef<string[]>([]);
  const isSpeakingRef = useRef(false);

  const { toast } = useToast();

  // --- 1. Stream Initialization (Singleton) ---
  const initMedia = useCallback(async (withVideo = false) => {
    try {
      if (!streamRef.current) {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = audioStream;
        setMicStream(audioStream);
      }

      if (withVideo && !videoStreamRef.current) {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
        });
        videoStreamRef.current = videoStream;
        setCamStream(videoStream);
      }
      return { audio: streamRef.current, video: videoStreamRef.current };
    } catch (err) {
      console.error("Media access error:", err);
      toast({
        title: "Media Access Denied",
        description: "Please enable camera and microphone to continue.",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  // --- 2. Recording Logic (STT) ---
  const startRecording = useCallback(() => {
    const stream = streamRef.current;
    if (!stream || recorderRef.current?.state === "recording") return;

    try {
      const rec = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];

      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      rec.onstop = async () => {
        if (chunksRef.current.length === 0) return;
        setIsProcessing(true);

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", blob);

        try {
          const res = await apiClient.post("/therapy/voice-stt", formData);
          if (res.data?.transcript && onTranscript) {
            onTranscript(res.data.transcript);
          }
        } catch (error: any) {
          console.error("STT Error:", error);
        } finally {
          setIsProcessing(false);
        }
      };

      rec.start();
      recorderRef.current = rec;
      setIsRecording(true);
    } catch (err) {
      console.error("Recorder error:", err);
    }
  }, [onTranscript]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  // --- 3. AI Voice (Premium TTS Pipeline) ---
  const processQueue = useCallback(async () => {
    if (isSpeakingRef.current || voiceQueueRef.current.length === 0) return;

    const text = voiceQueueRef.current.shift()!;
    isSpeakingRef.current = true;
    setIsSpeaking(true);

    const cleanText = text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").replace(/#{1,6}\s/g, "").replace(/\n+/g, ". ");

    try {
      const res = await fetch("/api/therapy/voice-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText }),
      });

      if (!res.ok) throw new Error("TTS fetch failed");

      const audioData = await res.arrayBuffer();
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioBuffer = await audioContextRef.current.decodeAudioData(audioData);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        processQueue();
      };

      source.start(0);
      currentAudioSourceRef.current = source;
    } catch (error) {
      console.warn("Premium TTS failed, falling back to browser SpeechSynthesis:", error);
      
      // Free Fallback: Browser Native TTS
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = voice.rate || 1;
        utterance.pitch = voice.pitch || 1;
        utterance.volume = voice.volume || 1;

        const voices = window.speechSynthesis.getVoices();
        const foundVoice = voices.find(v => voice.voiceNames.some(pref => v.name.includes(pref))) || voices.find(v => v.lang.startsWith("en"));
        if (foundVoice) utterance.voice = foundVoice;

        utterance.onend = () => {
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          processQueue();
        };

        utterance.onerror = () => {
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          processQueue();
        };

        window.speechSynthesis.speak(utterance);
        
        // Save the synth reference for interruption capability
        (window as any)._activeUtterance = utterance;
      } else {
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        processQueue();
      }
    }
  }, [voice]);

  const speak = useCallback((text: string) => {
    voiceQueueRef.current.push(text);
    processQueue();
  }, [processQueue]);

  const stopSpeaking = useCallback(() => {
    if (currentAudioSourceRef.current) {
      try { currentAudioSourceRef.current.stop(); } catch {}
      currentAudioSourceRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    voiceQueueRef.current = [];
    isSpeakingRef.current = false;
    setIsSpeaking(false);
  }, []);

  // --- 4. Cleanup ---
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      videoStreamRef.current?.getTracks().forEach((t) => t.stop());
      if (currentAudioSourceRef.current) {
        try { currentAudioSourceRef.current.stop(); } catch {}
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return {
    micStream,
    camStream,
    isRecording,
    isProcessing,
    isSpeaking,
    initMedia,
    startRecording,
    stopRecording,
    speak,
    stopSpeaking,
  };
}
