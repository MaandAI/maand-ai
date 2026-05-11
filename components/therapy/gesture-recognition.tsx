"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  FilesetResolver,
  HandLandmarker,
  FaceLandmarker,
  PoseLandmarker,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import { analyzeGestures, GestureResult } from "@/utils/gesture-detection";
import { Button } from "@/components/ui/button";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface GestureRecognitionProps {
  onGestureDetected: (result: GestureResult) => void;
  /** External stream (e.g. from the video session page camera). When provided,
   *  GestureRecognition will not request its own stream and will not stop
   *  tracks on unmount. */
  stream?: MediaStream | null;
  /** Automatically start detection when ready (and stream is available). */
  autoStart?: boolean;
  /** Render nothing visible — just run detection in the background. */
  hiddenUI?: boolean;
  /** Render as an absolutely-positioned overlay (for PiP camera cards). */
  asOverlay?: boolean;
}

// MediaPipe CDN base — pinned version for stability
const MEDIAPIPE_CDN =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm";

const HAND_MODEL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const FACE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const POSE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

export const GestureRecognition: React.FC<GestureRecognitionProps> = ({
  onGestureDetected,
  stream,
  autoStart,
  hiddenUI,
  asOverlay,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isWebcamEnabled, setIsWebcamEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<
    "hand" | "face" | "pose" | "none"
  >("none");
  // Track which models loaded for the readiness indicators
  const [modelsReady, setModelsReady] = useState({
    hand: false,
    face: false,
    pose: false,
  });

  // ── Model refs ─────────────────────────────────────────────────────
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);

  // ── Loop control refs (avoid stale closures in RAF) ─────────────────
  const animationFrameRef = useRef<number>(0);
  const lastVideoTimeRef = useRef<number>(-1);
  const isWebcamEnabledRef = useRef(false);
  const consecutiveGestureRef = useRef<{ label: string; count: number }>({
    label: "None",
    count: 0,
  });

  // Stable callback ref so predictWebcam never closes over a stale handler
  const onGestureDetectedRef = useRef(onGestureDetected);
  useEffect(() => {
    onGestureDetectedRef.current = onGestureDetected;
  });

  // ── Initialize all three MediaPipe models in parallel ──────────────
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_CDN);

        const [hand, face, pose] = await Promise.all([
          HandLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: HAND_MODEL, delegate: "CPU" },
            runningMode: "VIDEO",
            numHands: 1,
          }),
          FaceLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: FACE_MODEL, delegate: "CPU" },
            runningMode: "VIDEO",
            numFaces: 1,
            outputFaceBlendshapes: false,
          }),
          PoseLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: POSE_MODEL, delegate: "CPU" },
            runningMode: "VIDEO",
            numPoses: 1,
          }),
        ]);

        if (cancelled) {
          hand.close();
          face.close();
          pose.close();
          return;
        }

        handLandmarkerRef.current = hand;
        faceLandmarkerRef.current = face;
        poseLandmarkerRef.current = pose;
        setModelsReady({ hand: true, face: true, pose: true });
        setIsReady(true);
        console.log(
          "[GestureRecognition] ✅ All three MediaPipe models ready (Hand + Face + Pose)",
        );
      } catch (e: any) {
        if (!cancelled) {
          console.error("[GestureRecognition] MediaPipe init failed:", e);
          setError("Failed to load gesture recognition models.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    init();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrameRef.current);
      handLandmarkerRef.current?.close();
      faceLandmarkerRef.current?.close();
      poseLandmarkerRef.current?.close();
    };
  }, []);

  // ── RAF prediction loop ────────────────────────────────────────────
  // Zero deps — reads everything via refs to avoid stale closure issues.
  const predictWebcam = useCallback(() => {
    if (!isWebcamEnabledRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      animationFrameRef.current = requestAnimationFrame(predictWebcam);
      return;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      animationFrameRef.current = requestAnimationFrame(predictWebcam);
      return;
    }

    if (lastVideoTimeRef.current === video.currentTime) {
      animationFrameRef.current = requestAnimationFrame(predictWebcam);
      return;
    }
    lastVideoTimeRef.current = video.currentTime;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);

    const now = performance.now();

    // ── Run all three detectors ──────────────────────────────────
    let handLandmarks: NormalizedLandmark[] | null = null;
    let faceLandmarks: NormalizedLandmark[] | null = null;
    let poseLandmarks: NormalizedLandmark[] | null = null;

    try {
      if (handLandmarkerRef.current) {
        const r = handLandmarkerRef.current.detectForVideo(video, now);
        handLandmarks = r.landmarks?.[0] ?? null;
      }
    } catch {}

    try {
      if (faceLandmarkerRef.current) {
        const r = faceLandmarkerRef.current.detectForVideo(video, now);
        faceLandmarks = r.faceLandmarks?.[0] ?? null;
      }
    } catch {}

    try {
      if (poseLandmarkerRef.current) {
        const r = poseLandmarkerRef.current.detectForVideo(video, now);
        poseLandmarks = (r.landmarks?.[0] as NormalizedLandmark[]) ?? null;
      }
    } catch {}

    // ── Draw hand landmarks (blue dots) ──────────────────────────
    if (ctx && handLandmarks) {
      ctx.fillStyle = "#3b82f6";
      for (const lm of handLandmarks) {
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // ── Draw face mesh (purple dots, sampled) ─────────────────────
    if (ctx && faceLandmarks) {
      ctx.fillStyle = "rgba(168, 85, 247, 0.4)";
      for (let i = 0; i < faceLandmarks.length; i += 10) {
        const lm = faceLandmarks[i];
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // ── Draw pose landmarks (green dots) ─────────────────────────
    if (ctx && poseLandmarks) {
      ctx.fillStyle = "rgba(34, 197, 94, 0.6)";
      for (const lm of poseLandmarks) {
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // ── Analyze + debounce ────────────────────────────────────────
    const gestureInfo = analyzeGestures(
      handLandmarks,
      faceLandmarks,
      poseLandmarks,
    );

    if (gestureInfo.intent !== "None") {
      setActiveSource(gestureInfo.source);
      if (consecutiveGestureRef.current.label === gestureInfo.label) {
        consecutiveGestureRef.current.count++;
        if (consecutiveGestureRef.current.count === 15) {
          onGestureDetectedRef.current(gestureInfo);
          consecutiveGestureRef.current.count = -30; // 1s cooldown
        }
      } else {
        consecutiveGestureRef.current = { label: gestureInfo.label, count: 1 };
      }
    } else {
      setActiveSource("none");
      consecutiveGestureRef.current = { label: "None", count: 0 };
    }

    if (isWebcamEnabledRef.current) {
      animationFrameRef.current = requestAnimationFrame(predictWebcam);
    }
  }, []); // zero deps

  // ── Enable webcam ──────────────────────────────────────────────────
  const enableWebcam = useCallback(
    async (overrideStream?: MediaStream | null) => {
      if (!isReady) {
        console.warn("[GestureRecognition] Models not ready yet");
        return;
      }
      try {
        const resolvedStream =
          overrideStream ??
          stream ??
          (await navigator.mediaDevices.getUserMedia({ video: true }));

        if (!resolvedStream || !videoRef.current) return;

        videoRef.current.srcObject = resolvedStream;

        const onLoaded = () => {
          isWebcamEnabledRef.current = true;
          setIsWebcamEnabled(true);
          console.log(
            "[GestureRecognition] ✅ Video ready — starting prediction loop",
          );
          predictWebcam();
          videoRef.current?.removeEventListener("loadeddata", onLoaded);
        };

        videoRef.current.addEventListener("loadeddata", onLoaded);
        videoRef.current.play().catch(() => {});
      } catch (e: any) {
        console.error("[GestureRecognition] Webcam error:", e);
        setError("Could not access webcam. Please check permissions.");
      }
    },
    [isReady, stream, predictWebcam],
  );

  // ── Disable webcam ─────────────────────────────────────────────────
  const stopWebcam = useCallback(() => {
    isWebcamEnabledRef.current = false;
    setIsWebcamEnabled(false);
    setActiveSource("none");
    cancelAnimationFrame(animationFrameRef.current);
    if (videoRef.current) {
      if (!stream) {
        const s = videoRef.current.srcObject as MediaStream | null;
        s?.getTracks().forEach((t) => t.stop());
      }
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  // ── Auto-start when both isReady AND stream are available ──────────
  useEffect(() => {
    if (autoStart && isReady && !isWebcamEnabledRef.current) {
      enableWebcam(stream);
    }
  }, [autoStart, isReady, stream, enableWebcam]);

  // ── Swap stream if it changes while already running ────────────────
  useEffect(() => {
    if (!stream || !isWebcamEnabledRef.current || !videoRef.current) return;
    videoRef.current.srcObject = stream;
    videoRef.current.play().catch(() => {});
  }, [stream]);

  const sourceBadge: Record<"hand" | "face" | "pose" | "none", string> = {
    hand: "✋ Hand",
    face: "😐 Face",
    pose: "🧍 Pose",
    none: "",
  };

  // ── Hidden mode ────────────────────────────────────────────────────
  if (hiddenUI) {
    return (
      <div className="hidden">
        <video ref={videoRef} autoPlay playsInline muted />
        <canvas ref={canvasRef} />
      </div>
    );
  }

  // ── Overlay mode (video session PiP) ──────────────────────────────
  if (asOverlay) {
    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        <video ref={videoRef} className="hidden" autoPlay playsInline muted />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover -scale-x-100"
        />
        {isWebcamEnabled && activeSource !== "none" && (
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm border border-primary/30 rounded-full px-2 py-0.5">
            <span className="text-[8px] font-black text-primary uppercase tracking-wide">
              {sourceBadge[activeSource]} detected
            </span>
          </div>
        )}
        {isLoading && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full px-2 py-0.5">
            <Loader2 className="h-2 w-2 text-white/40 animate-spin" />
            <span className="text-[8px] font-black text-white/40 uppercase tracking-wide">
              Loading models…
            </span>
          </div>
        )}
        {isWebcamEnabled && activeSource === "none" && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-emerald-500/30 rounded-full px-2 py-0.5">
            <div className="h-1 w-1 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-wide">
              Gesture Active
            </span>
          </div>
        )}
      </div>
    );
  }

  // ── Standalone mode (chat page) ───────────────────────────────────
  return (
    <div className="flex flex-col gap-3 rounded-[2rem] border border-primary/10 p-5 bg-card/40 backdrop-blur-xl w-full mb-8 shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-sm tracking-tight">
            Visual Intent Recognition
          </h3>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider opacity-70">
            Hand · Face · Posture — all detected automatically.
          </p>
        </div>
        <Button
          variant={isWebcamEnabled ? "destructive" : "outline"}
          size="sm"
          disabled={isLoading}
          onClick={isWebcamEnabled ? stopWebcam : () => enableWebcam()}
          className="h-9 rounded-full px-4 gap-2 border-primary/10 hover:bg-primary/5 transition-all"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isWebcamEnabled ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4 text-primary" />
          )}
          <span className="text-xs font-bold">
            {isLoading
              ? "Loading models…"
              : isWebcamEnabled
                ? "Stop Tracking"
                : "Start Camera"}
          </span>
        </Button>
      </div>

      {/* Model readiness badges */}
      <div className="flex gap-2">
        {(["hand", "face", "pose"] as const).map((m) => (
          <div
            key={m}
            className={cn(
              "flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border transition-all",
              modelsReady[m]
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-white/10 bg-white/5 text-white/20",
            )}
          >
            <div
              className={cn(
                "h-1 w-1 rounded-full",
                modelsReady[m] ? "bg-emerald-400" : "bg-white/20",
              )}
            />
            {m}
          </div>
        ))}
      </div>

      {error && (
        <Alert
          variant="destructive"
          className="py-2 rounded-xl border-none bg-destructive/10 text-destructive"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs font-medium">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div
        className={cn(
          "relative rounded-2xl overflow-hidden bg-background/50 transition-all duration-500 ease-in-out",
          isWebcamEnabled ? "h-48 shadow-inner" : "h-0",
        )}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover -scale-x-100 opacity-40 grayscale"
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover -scale-x-100 z-10"
        />
        {isWebcamEnabled && (
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2">
            <div className="bg-background/80 backdrop-blur-md text-foreground text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-primary/10">
              Hold gesture 1s to send
            </div>
            {activeSource !== "none" && (
              <div className="bg-primary/20 backdrop-blur-md text-primary text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-primary/20 animate-pulse">
                {sourceBadge[activeSource]}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
