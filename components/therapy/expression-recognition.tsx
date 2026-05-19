"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ExpressionType, expressionResult } from "@/utils/expression-detection";

interface ExpressionRecognitionProps {
  onExpressionDetected: (result: expressionResult) => void;
}

const emotionColors: Record<
  string,
  {
    border: string;
    cardBorder: string;
    bg: string;
    text: string;
    glow: string;
    emoji: string;
    label: string;
  }
> = {
  happy: {
    border: "border-emerald-500/35 shadow-[0_0_30px_rgba(16,185,129,0.25)]",
    cardBorder: "border-emerald-500/30 bg-black/75",
    bg: "bg-emerald-500/20 border border-emerald-500/30",
    text: "text-emerald-400 font-extrabold tracking-wide",
    glow: "bg-gradient-to-t from-emerald-500/10 via-transparent to-transparent opacity-100",
    emoji: "😊",
    label: "Happy",
  },
  sad: {
    border: "border-cyan-500/35 shadow-[0_0_30px_rgba(6,182,212,0.25)]",
    cardBorder: "border-cyan-500/30 bg-black/75",
    bg: "bg-cyan-500/20 border border-cyan-500/30",
    text: "text-cyan-400 font-extrabold tracking-wide",
    glow: "bg-gradient-to-t from-cyan-500/10 via-transparent to-transparent opacity-100",
    emoji: "😢",
    label: "Sad",
  },
  angry: {
    border: "border-rose-500/35 shadow-[0_0_30px_rgba(244,63,94,0.25)]",
    cardBorder: "border-rose-500/30 bg-black/75",
    bg: "bg-rose-500/20 border border-rose-500/30",
    text: "text-rose-400 font-extrabold tracking-wide",
    glow: "bg-gradient-to-t from-rose-500/10 via-transparent to-transparent opacity-100",
    emoji: "😡",
    label: "Angry",
  },
  fearful: {
    border: "border-amber-500/35 shadow-[0_0_30px_rgba(245,158,11,0.25)]",
    cardBorder: "border-amber-500/30 bg-black/75",
    bg: "bg-amber-500/20 border border-amber-500/30",
    text: "text-amber-400 font-extrabold tracking-wide",
    glow: "bg-gradient-to-t from-amber-500/10 via-transparent to-transparent opacity-100",
    emoji: "😨",
    label: "Fearful",
  },
  surprised: {
    border: "border-violet-500/35 shadow-[0_0_30px_rgba(139,92,246,0.25)]",
    cardBorder: "border-violet-500/30 bg-black/75",
    bg: "bg-violet-500/20 border border-violet-500/30",
    text: "text-violet-400 font-extrabold tracking-wide",
    glow: "bg-gradient-to-t from-violet-500/10 via-transparent to-transparent opacity-100",
    emoji: "😲",
    label: "Surprised",
  },
  disgusted: {
    border: "border-orange-500/35 shadow-[0_0_30px_rgba(249,115,22,0.25)]",
    cardBorder: "border-orange-500/30 bg-black/75",
    bg: "bg-orange-500/20 border border-orange-500/30",
    text: "text-orange-400 font-extrabold tracking-wide",
    glow: "bg-gradient-to-t from-orange-500/10 via-transparent to-transparent opacity-100",
    emoji: "🤢",
    label: "Disgusted",
  },
  neutral: {
    border: "border-zinc-500/20 shadow-none",
    cardBorder: "border-zinc-700/50 bg-black/70",
    bg: "bg-zinc-500/10 border border-zinc-500/20",
    text: "text-zinc-300 font-bold",
    glow: "bg-transparent opacity-0",
    emoji: "😐",
    label: "Neutral",
  },
  waiting: {
    border: "border-primary/20 shadow-none",
    cardBorder: "border-primary/10 bg-black/60",
    bg: "bg-primary/5 border border-primary/10",
    text: "text-primary/75 font-medium animate-pulse",
    glow: "bg-transparent opacity-0",
    emoji: "🔍",
    label: "Scanning...",
  },
  noface: {
    border: "border-amber-500/20 shadow-none",
    cardBorder: "border-amber-700/30 bg-black/60",
    bg: "bg-amber-500/10 border border-amber-500/20",
    text: "text-amber-400 font-semibold animate-pulse",
    glow: "bg-transparent opacity-0",
    emoji: "👤",
    label: "No Face Detected",
  },
  error: {
    border: "border-rose-500/30 shadow-none",
    cardBorder: "border-rose-700/30 bg-black/60",
    bg: "bg-rose-500/10 border border-rose-500/20",
    text: "text-rose-400 font-bold animate-pulse",
    glow: "bg-transparent opacity-0",
    emoji: "❌",
    label: "Inference Error",
  },
};

// ─── Normalize raw server emotion string → emotionColors key ───────────────
const normalizeEmotion = (raw: string): string => {
  const lower = raw.toLowerCase().trim();

  if (lower === "waiting..." || lower === "waiting") return "waiting";
  if (lower.includes("no face")) return "noface";
  if (lower.includes("error")) return "error";

  const map: Record<string, string> = {
    happiness: "happy",
    happy: "happy",
    sadness: "sad",
    sad: "sad",
    anger: "angry",
    angry: "angry",
    fear: "fearful",
    fearful: "fearful",
    surprise: "surprised",
    surprised: "surprised",
    disgust: "disgusted",
    disgusted: "disgusted",
    neutral: "neutral",
  };

  return map[lower] ?? "waiting";
};

// ─── Map normalized emotion key → ExpressionType enum ─────────────────────
const mapToExpressionType = (key: string): ExpressionType => {
  const map: Record<string, ExpressionType> = {
    happy: ExpressionType.HAPPY,
    sad: ExpressionType.SAD,
    angry: ExpressionType.ANGRY,
    fearful: ExpressionType.FEARFUL,
    surprised: ExpressionType.SURPRISED,
    disgusted: ExpressionType.DISGUSTED,
    neutral: ExpressionType.NEUTRAL,
    noface: ExpressionType.NOFACE,
    error: ExpressionType.ERROR,
  };
  return map[key] ?? ExpressionType.WAITING;
};

export const ExpressionRecognition: React.FC<ExpressionRecognitionProps> = ({
  onExpressionDetected,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [emotionKey, setEmotionKey] = useState<string>("waiting");
  const [connected, setConnected] = useState(false);

  // Stable callback ref so onmessage never closes over a stale handler
  const onExpressionDetectedRef = useRef(onExpressionDetected);
  useEffect(() => {
    onExpressionDetectedRef.current = onExpressionDetected;
  });

  // Track consecutive emotions for debouncing/hold logic
  const consecutiveEmotionRef = useRef<{ label: string; count: number }>({
    label: "None",
    count: 0,
  });

  const lastFiredEmotionRef = useRef<string>("None");

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    connectWebSocket();
  };

  const connectWebSocket = () => {
    const ws = new WebSocket("ws://localhost:8000/ws");

    ws.onopen = () => {
      console.log("WS Connected");
      setConnected(true);
      startSendingFrames();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.emotion) {
        const rawEmotion = data.emotion.toLowerCase().trim();
        const normalized = normalizeEmotion(rawEmotion);

        setEmotionKey(normalized);

        // Determine whether this emotion is a triggering one
        const isNegative = [
          "sad",
          "angry",
          "fearful",
          "disgusted",
          "sadness",
          "anger",
          "fear",
          "disgust",
        ].includes(rawEmotion);

        const isPositive = [
          "happy",
          "surprised",
          "happiness",
          "surprise",
        ].includes(rawEmotion);

        const isTriggeringEmotion = isNegative || isPositive;

        if (isTriggeringEmotion) {
          // If this exact emotion was the last one fired, don't fire again until reset
          if (lastFiredEmotionRef.current === rawEmotion) {
            consecutiveEmotionRef.current = { label: rawEmotion, count: 0 };
          } else if (consecutiveEmotionRef.current.label === rawEmotion) {
            consecutiveEmotionRef.current.count++;

            // 4 consecutive frames (~2 seconds at 500ms interval)
            if (consecutiveEmotionRef.current.count === 4) {
              onExpressionDetectedRef.current({
                emotion: data.emotion,
                confidence: 0.9,
                emotionResult: mapToExpressionType(normalized),
                source: "face",
              });

              console.log(
                "Expression detected:",
                data.emotion,
                "→",
                normalized,
              );

              lastFiredEmotionRef.current = rawEmotion;
              consecutiveEmotionRef.current.count = 0;
            }
          } else {
            consecutiveEmotionRef.current = { label: rawEmotion, count: 1 };
          }
        } else {
          // Neutral or non-triggering: reset the lock
          lastFiredEmotionRef.current = "None";
          consecutiveEmotionRef.current = { label: "None", count: 0 };
        }
      }
    };

    ws.onclose = () => {
      console.log("WS Closed");
      setConnected(false);
    };

    wsRef.current = ws;
  };

  const startSendingFrames = () => {
    intervalRef.current = setInterval(() => {
      sendFrame();
    }, 500);
  };

  const sendFrame = () => {
    if (!videoRef.current || !canvasRef.current || !wsRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const base64 = canvas.toDataURL("image/jpeg", 0.7);
    wsRef.current.send(base64);
  };

  useEffect(() => {
    startCamera();

    return () => {
      intervalRef.current && clearInterval(intervalRef.current);
      wsRef.current?.close();

      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((t) => t.stop());
      }
    };
  }, []);

  const colors = emotionColors[emotionKey] ?? emotionColors["waiting"];

  return (
    <div className="relative rounded-[2rem] overflow-hidden border border-primary/10 bg-card/30 backdrop-blur-xl shadow-2xl p-5  mb-8 transition-all duration-300">
      {/* Dynamic Keyframes Injection */}
      <style>{`
        @keyframes scan-animation {
          0% { transform: translateY(0); opacity: 0; }
          15% { opacity: 0.8; }
          85% { opacity: 0.8; }
          100% { transform: translateY(180px); opacity: 0; }
        }
        .scan-sweeper {
          animation: scan-animation 3.5s ease-in-out infinite;
        }
      `}</style>

      {/* Standalone Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-sm tracking-tight">
            Visual Intent Recognition
          </h3>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider opacity-70">
            Facial affect scanning via WebSocket inference
          </p>
        </div>
      </div>

      {/* Video Viewport Container */}
      <div
        className={cn(
          "relative w-full rounded-2xl overflow-hidden bg-background/50 border transition-all duration-500 ease-in-out",
          "aspect-[16/9] max-h-[420px]",
          colors.border,
        )}
      >
        {/* Mirror-scaled Live Video */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover -scale-x-100 opacity-80 grayscale-[20%]"
        />

        <canvas ref={canvasRef} className="hidden" />

        {/* Dynamic color-shifting ambient vignette overlay */}
        <div
          className={cn(
            "absolute inset-0 pointer-events-none transition-all duration-500 ease-in-out mix-blend-screen",
            colors.glow,
          )}
        />

        {/* Scanning grid sweeper laser */}
        {connected && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            <div className="absolute left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent scan-sweeper" />
          </div>
        )}

        {/* Dynamic Connected Status badge top-right */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-lg">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-all duration-300",
              connected ? "bg-emerald-400 animate-pulse" : "bg-red-500",
            )}
          />
          <span className="text-[8px] font-black uppercase tracking-widest text-white/80">
            {connected ? "Live Scanner" : "Offline"}
          </span>
        </div>

        {/* Scanning Target frame overlay in center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-[28%] max-w-40 aspect-square border border-white/10 rounded-[2.5rem] relative">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/40 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/40 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/40 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/40 rounded-br-lg" />
          </div>
        </div>

        {/* Affect Display floating panel in bottom-left */}
        <div className="absolute bottom-3 left-3 z-20 transition-all duration-300">
          <div
            className={cn(
              "flex items-center gap-2 sm:gap-3 backdrop-blur-md px-4 py-2.5 rounded-2xl border shadow-2xl transition-all duration-500",
              colors.cardBorder,
            )}
          >
            <div
              className={cn(
                "h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center text-lg shadow-lg transition-all duration-500",
                colors.bg,
              )}
            >
              {colors.emoji}
            </div>

            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/40">
                Detected Affect
              </span>
              <span
                className={cn(
                  "text-xs transition-colors duration-500 flex items-center gap-1.5",
                  colors.text,
                )}
              >
                {colors.emoji} {colors.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Instruction footer */}
      <div className="mt-3 text-center">
        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/35 leading-tight">
          Hold emotion for 2 seconds to trigger therapeutic inputs · Cooldown 5s
          after trigger
        </p>
      </div>
    </div>
  );
};
