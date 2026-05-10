"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { analyzeGestures, GestureResult } from "@/utils/gesture-detection";
import { Button } from "@/components/ui/button";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface GestureRecognitionProps {
  onGestureDetected: (result: GestureResult) => void;
  stream?: MediaStream | null;
  autoStart?: boolean;
  hiddenUI?: boolean;
  asOverlay?: boolean;
}

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
  const [isReady, setIsReady] = useState(false); // true once MediaPipe model is loaded
  const [error, setError] = useState<string | null>(null);

  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const animationFrameRef = useRef<number>(0);
  const lastVideoTimeRef = useRef<number>(-1);
  const consecutiveGesturesRef = useRef<{ label: string; count: number }>({
    label: "None",
    count: 0,
  });

  // Initialize MediaPipe Task
  const initializeMediaPipe = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm",
      );

      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "CPU", // use CPU first
        },
        runningMode: "VIDEO",
        numHands: 1,
      });
      handLandmarkerRef.current = landmarker;
      setIsReady(true);
      console.log("[GestureRecognition] ✅ MediaPipe HandLandmarker ready");
    } catch (e: any) {
      console.error("Failed to initialize MediaPipe:", e);
      setError("Failed to load gesture recognition model.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeMediaPipe();
    return () => {
      stopWebcam();
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
      }
    };
  }, []);

  const enableWebcam = async () => {
    if (!handLandmarkerRef.current) return;
    try {
      let activeStream = stream;
      if (!activeStream) {
        activeStream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      if (videoRef.current && activeStream) {
        videoRef.current.srcObject = activeStream;
        videoRef.current.addEventListener("loadeddata", predictWebcam);
        setIsWebcamEnabled(true);
      }
    } catch (e: any) {
      console.error("Webcam error:", e);
      setError("Could not access webcam. Please check permissions.");
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      if (!stream) {
        // Only stop tracks if we own the stream
        const activeStream = videoRef.current.srcObject as MediaStream;
        activeStream.getTracks().forEach((track) => track.stop());
      }
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsWebcamEnabled(false);
  };

  // Auto-start when MediaPipe is ready AND a stream is available or autoStart is requested
  useEffect(() => {
    if (autoStart && isReady && !isWebcamEnabled) {
      console.log("[GestureRecognition] 🚀 Auto-starting gesture detection");
      enableWebcam();
    }
  }, [autoStart, isReady]);

  useEffect(() => {
    if (stream && isWebcamEnabled && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const predictWebcam = useCallback(async () => {
    if (
      !videoRef.current ||
      !canvasRef.current ||
      !handLandmarkerRef.current ||
      !isWebcamEnabled
    )
      return;

    const video = videoRef.current;

    // Check if video dimensions are valid before predicting
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      if (isWebcamEnabled) {
        animationFrameRef.current = requestAnimationFrame(predictWebcam);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Sync canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const startTimeMs = performance.now();

    if (lastVideoTimeRef.current !== video.currentTime) {
      lastVideoTimeRef.current = video.currentTime;

      const results = handLandmarkerRef.current.detectForVideo(
        video,
        startTimeMs,
      );

      ctx?.clearRect(0, 0, canvas.width, canvas.height);

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];

        // Draw Landmarks (Visual Feedback)
        ctx!.fillStyle = "#3b82f6";
        for (const landmark of landmarks) {
          ctx?.beginPath();
          ctx?.arc(
            landmark.x * canvas.width,
            landmark.y * canvas.height,
            4,
            0,
            2 * Math.PI,
          );
          ctx?.fill();
        }

        // Analyze gesture
        const gestureInfo = analyzeGestures(landmarks);

        // Debounce: Only trigger if the same gesture is held for ~5 frames
        if (gestureInfo.intent !== "None") {
          if (consecutiveGesturesRef.current.label === gestureInfo.label) {
            consecutiveGesturesRef.current.count++;
            if (consecutiveGesturesRef.current.count === 15) {
              // Roughly 0.5s hold time
              onGestureDetected(gestureInfo);
              // Reset counter after emission to prevent spam, require "None" to reset
              consecutiveGesturesRef.current.count = -30; // 1s cool-down
            }
          } else {
            consecutiveGesturesRef.current = {
              label: gestureInfo.label,
              count: 1,
            };
          }
        } else {
          consecutiveGesturesRef.current = { label: "None", count: 0 };
        }
      } else {
        consecutiveGesturesRef.current = { label: "None", count: 0 };
      }
    }

    if (isWebcamEnabled) {
      animationFrameRef.current = requestAnimationFrame(predictWebcam);
    }
  }, [isWebcamEnabled, onGestureDetected]);

  useEffect(() => {
    if (isWebcamEnabled) {
      predictWebcam();
    }
  }, [isWebcamEnabled, predictWebcam]);

  if (hiddenUI) {
    return (
      <div className="hidden">
        <video ref={videoRef} autoPlay playsInline muted />
        <canvas ref={canvasRef} />
      </div>
    );
  }

  if (asOverlay) {
    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Hidden video just for mediapipe processing, canvas shows the landmarks */}
        <video ref={videoRef} className="hidden" autoPlay playsInline muted />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover -scale-x-100" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-[2rem] border border-primary/10 p-5 bg-card/40 backdrop-blur-xl w-full mb-8 shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-sm tracking-tight">
            Visual Intent Recognition
          </h3>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider opacity-70">
            Sign simple gestures to communicate.
          </p>
        </div>
        <Button
          variant={isWebcamEnabled ? "destructive" : "outline"}
          size="sm"
          disabled={isLoading}
          onClick={isWebcamEnabled ? stopWebcam : enableWebcam}
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
            {isWebcamEnabled ? "Stop Tracking" : "Start Camera"}
          </span>
        </Button>
      </div>

      {error ? (
        <Alert
          variant="destructive"
          className="py-2 rounded-xl border-none bg-destructive/10 text-destructive"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs font-medium">
            {error}
          </AlertDescription>
        </Alert>
      ) : null}

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
          <div className="absolute bottom-3 left-3 z-20 bg-background/80 backdrop-blur-md text-foreground text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-primary/10">
            Hold gesture for 1s to send
          </div>
        )}
      </div>
    </div>
  );
};
