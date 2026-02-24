"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { analyzeHandGestures, GestureResult } from "@/utils/gesture-detection";
import { Button } from "@/components/ui/button";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GestureRecognitionProps {
  onGestureDetected: (result: GestureResult) => void;
}

export const GestureRecognition: React.FC<GestureRecognitionProps> = ({
  onGestureDetected,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isWebcamEnabled, setIsWebcamEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
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
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsWebcamEnabled(false);
  };

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
        const gestureInfo = analyzeHandGestures(landmarks);

        // Debounce: Only trigger if the same gesture is held for ~5 frames
        if (gestureInfo.intent !== "Unknown") {
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

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4 bg-card w-full mb-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-sm">Visual Intent Recognition</h3>
          <p className="text-xs text-muted-foreground">
            Sign simple gestures to communicate.
          </p>
        </div>
        <Button
          variant={isWebcamEnabled ? "destructive" : "secondary"}
          size="sm"
          disabled={isLoading}
          onClick={isWebcamEnabled ? stopWebcam : enableWebcam}
          className="h-8 gap-1"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isWebcamEnabled ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          {isWebcamEnabled ? "Stop Tracking" : "Start Camera"}
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      ) : null}

      <div
        className={`relative rounded-md overflow-hidden bg-muted transition-all duration-300 ${isWebcamEnabled ? "h-48" : "h-0"}`}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover -scale-x-100 opacity-60"
          autoPlay
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover -scale-x-100 z-10"
        />
        {isWebcamEnabled && (
          <div className="absolute bottom-2 left-2 z-20 bg-black/60 text-white text-[10px] px-2 py-1 rounded">
            Hold gesture for 1 second to send
          </div>
        )}
      </div>
    </div>
  );
};
