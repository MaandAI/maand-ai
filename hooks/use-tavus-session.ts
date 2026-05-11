"use client";
/**
 * useTavusSession — Tavus as the primary meeting engine.
 *
 * This hook treats Tavus/Daily.co as a black box meeting service.
 * It only concerns itself with:
 *   1. Fetching the conversation URL
 *   2. Joining via Daily.co WebRTC
 *   3. Attaching remote A/V tracks to DOM refs
 *   4. Firing transcript events via a stable callback ref
 *
 * It does NOT manage transcript state, UI, or any app-level logic.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";

export type TavusStatus =
  | "idle"
  | "initializing"
  | "connected"
  | "error"
  | "ended";

export interface TavusTranscriptEvent {
  speaker: "user" | "therapist";
  text: string;
  isFinal: boolean;
}

export interface UseTavusSessionOptions {
  /** Called whenever a transcript segment arrives from Daily or Tavus events. */
  onTranscript?: (event: TavusTranscriptEvent) => void;
}

export function useTavusSession(options: UseTavusSessionOptions = {}) {
  // ── DOM refs — always in the DOM, never conditionally rendered ─────
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // ── Internal refs ──────────────────────────────────────────────────
  const callRef = useRef<DailyCall | null>(null);
  /** Stable callback ref: always points to the latest onTranscript without
   *  causing the Tavus hook to reinitialize on every render. */
  const onTranscriptRef = useRef(options.onTranscript);
  useEffect(() => {
    onTranscriptRef.current = options.onTranscript;
  });

  // ── Public state ───────────────────────────────────────────────────
  const [status, setStatus] = useState<TavusStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // ── Track attachment ────────────────────────────────────────────────
  const attachTrack = useCallback((track: MediaStreamTrack) => {
    if (track.kind === "video") {
      const attempt = (el: HTMLVideoElement | null) => {
        if (!el) return false;
        el.srcObject = new MediaStream([track]);
        el.play().catch((e) =>
          console.warn("[Tavus] video.play() suppressed:", e),
        );
        return true;
      };

      if (!attempt(videoRef.current)) {
        // DOM element not yet mounted — retry after next frame
        console.warn("[Tavus] videoRef not mounted yet, retrying…");
        setTimeout(() => attempt(videoRef.current), 600);
      } else {
        console.log("[Tavus] ✅ video track attached");
      }
    }

    if (track.kind === "audio") {
      const el = audioRef.current;
      if (el) {
        el.srcObject = new MediaStream([track]);
        el.play().catch(() => {});
        console.log("[Tavus] ✅ audio track attached");
      }
    }
  }, []);

  // ── Fire a transcript event through the stable ref ─────────────────
  const fireTranscript = useCallback(
    (speaker: "user" | "therapist", text: string, isFinal = true) => {
      const clean = text?.trim();
      if (!clean) return;
      onTranscriptRef.current?.({ speaker, text: clean, isFinal });
    },
    [],
  );

  // ── Session init ───────────────────────────────────────────────────
  const initTavusSession = useCallback(
    async (therapistId: string) => {
      if (status === "initializing" || status === "connected") {
        console.log("[Tavus] Already active — skipping init");
        return;
      }
      setStatus("initializing");
      setErrorMsg("");
      console.log(`[Tavus] Initializing session for therapist: ${therapistId}`);

      try {
        // 1. Ask our backend to create a Tavus conversation
        const res = await fetch("/api/therapy/tavus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ therapistId }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Backend HTTP ${res.status}`);
        }
        const { conversation_url } = await res.json();
        if (!conversation_url) throw new Error("No conversation_url returned");
        console.log("[Tavus] conversation_url received");

        // 2. Tear down any previous call object
        if (callRef.current) {
          await callRef.current.leave().catch(() => {});
          callRef.current.destroy();
          callRef.current = null;
        }

        // 3. Create Daily call object (Custom UI mode — no iFrame)
        const call = DailyIframe.createCallObject({
          audioSource: true, // mic on so Tavus can hear us
          videoSource: false, // no need to publish local video to Tavus
        });
        callRef.current = call;

        // ── Event listeners ─────────────────────────────────────────
        call.on("joined-meeting", () => {
          console.log("[Tavus] ✅ Joined meeting");
          setStatus("connected");

          // Enable Daily's server-side transcription (captures both sides)
          try {
            (call as any).startTranscription({ language: "en" });
            console.log("[Tavus] ✅ Transcription started");
          } catch (e) {
            console.warn("[Tavus] startTranscription unavailable:", e);
          }
        });

        // Remote tracks (Tavus agent video + audio)
        call.on("track-started", (e: any) => {
          if (!e.participant?.local) {
            console.log(`[Tavus] remote track-started: ${e.track.kind}`);
            attachTrack(e.track);
          }
        });

        call.on("participant-joined", (e: any) => {
          if (!e.participant.local) {
            const vt = e.participant.tracks?.video?.persistentTrack;
            const at = e.participant.tracks?.audio?.persistentTrack;
            if (vt) attachTrack(vt);
            if (at) attachTrack(at);
          }
        });

        call.on("participant-updated", (e: any) => {
          if (!e.participant.local) {
            const vt = e.participant.tracks?.video?.persistentTrack;
            const at = e.participant.tracks?.audio?.persistentTrack;
            if (vt && videoRef.current && !videoRef.current.srcObject)
              attachTrack(vt);
            if (at && audioRef.current && !audioRef.current.srcObject)
              attachTrack(at);
          }
        });

        // Daily server-side transcription (most reliable — both speakers)
        (call as any).on("transcription-message", (e: any) => {
          console.log("[Tavus] transcription-message:", e);
          const text = e.text || e.rawText || "";
          if (!text.trim()) return;

          const participants = call.participants();
          const participant = participants[e.participantId];
          const isLocal = participant?.local ?? false;
          const speaker = isLocal ? "user" : "therapist";
          fireTranscript(speaker, text, e.isFinal ?? true);
        });

        // Tavus CVI app-message (conversation utterance events)
        call.on("app-message", (e: any) => {
          try {
            const raw =
              typeof e.data === "string" ? JSON.parse(e.data) : e.data;
            console.log("[Tavus] app-message:", JSON.stringify(raw, null, 2));

            const eventType: string = raw?.event_type || "";

            // Only handle utterance events
            if (
              !eventType.includes("conversation.utterance") &&
              !eventType.includes("conversation.echo")
            )
              return;

            const props = raw?.properties || {};
            const text: string =
              props.speech || props.text || props.content || "";
            if (!text.trim()) return;

            // "replica" = therapist, "user" = user
            const roleRaw: string = props.role || "replica";
            const speaker: "user" | "therapist" =
              roleRaw === "user" || roleRaw === "human" ? "user" : "therapist";

            // Only fire on final utterances to avoid duplicate streaming chunks
            const isFinal: boolean = props.final ?? true;

            fireTranscript(speaker, text.trim(), isFinal);
          } catch (err) {
            console.error("[Tavus] app-message parse error:", err);
          }
        });

        call.on("error", (e: any) => {
          console.error("[Tavus] error:", e);
          setStatus("error");
          setErrorMsg(e?.errorMsg || "WebRTC error");
        });

        call.on("left-meeting", () => {
          console.log("[Tavus] left-meeting");
          setStatus("ended");
        });

        // 4. Join
        await call.join({ url: conversation_url });
      } catch (err: any) {
        console.error("[Tavus] init failed:", err);
        setStatus("error");
        setErrorMsg(err.message);
      }
    },
    [status, attachTrack, fireTranscript],
  );

  // ── Session teardown ───────────────────────────────────────────────
  const endSession = useCallback(async () => {
    const call = callRef.current;
    if (call) {
      try {
        (call as any).stopTranscription();
      } catch {}
      await call.leave().catch(() => {});
      call.destroy();
      callRef.current = null;
    }
    setStatus("ended");
    setErrorMsg("");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const call = callRef.current;
      if (call) {
        call
          .leave()
          .catch(() => {})
          .finally(() => call.destroy());
        callRef.current = null;
      }
    };
  }, []);

  return {
    videoRef,
    audioRef,
    status,
    errorMsg,
    initTavusSession,
    endSession,
    /** The raw call object — use only for advanced operations like sendAppMessage */
    callObject: callRef.current,
  };
}
