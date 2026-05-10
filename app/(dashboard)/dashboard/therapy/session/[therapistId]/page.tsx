"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api-client";
import { getPersona } from "@/lib/therapist-personas";
import { useTherapistVoice } from "@/hooks/use-therapist-voice";
import { useTherapistStore } from "@/lib/store/therapist-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GestureRecognition } from "@/components/therapy/gesture-recognition";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import type { GestureResult } from "@/utils/gesture-detection";
import {
  Mic, MicOff, Video, VideoOff, MonitorUp, Phone,
  MessageSquare, FileText, Brain, CheckCircle2, Circle,
} from "lucide-react";

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

interface TEntry { speaker: "user" | "therapist"; text: string; }

export default function VideoSessionPage() {
  const params = useParams();
  const router = useRouter();
  const therapistId = (params?.therapistId as string) || "ava";
  const persona = getPersona(therapistId);

  // Global therapist store — keeps sidebar in sync
  const {
    startSession,
    endSession: endStoreSession,
    setAvatarState: setStoreAvatarState,
  } = useTherapistStore();

  const [sessionId, setSessionId]   = useState<string | null>(null);
  const [phase, setPhase]           = useState<"starting"|"ready"|"active"|"ending"|"report">("starting");
  const [elapsed, setElapsed]       = useState(0);
  const [transcript, setTranscript] = useState<TEntry[]>([]);
  const [report, setReport]         = useState<any>(null);

  const [camOn,    setCamOn]    = useState(false);
  const [micOn,    setMicOn]    = useState(true);
  const [sharing,  setSharing]  = useState(false);
  const [aiTyping, setAiTyping]  = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [caption, setCaption]    = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [showTx,  setShowTx]    = useState(true);
  const [recording, setRecording] = useState(false);

  const camRef     = useRef<HTMLVideoElement>(null);   // user camera PiP
  const screenRef  = useRef<HTMLVideoElement>(null);   // screen share (not used for display yet)
  const camStream  = useRef<MediaStream | null>(null);
  const screenStream = useRef<MediaStream | null>(null);
  const recRef     = useRef<MediaRecorder | null>(null);
  const recChunks  = useRef<Blob[]>([]);
  const timerRef   = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const txEndRef   = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string | null>(null);
  const transcriptRef = useRef<TEntry[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [gestureInsights, setGestureInsights] = useState<{ meaning: string; gesture: string; timestamp: Date }[]>([]);
  const gestureInsightsRef = useRef<{ meaning: string; gesture: string; timestamp: Date }[]>([]);

  // Re-bind camera and ensure playback
  useEffect(() => {
    if (phase === "active" && camRef.current && camStream.current && camRef.current.srcObject !== camStream.current) {
      camRef.current.srcObject = camStream.current;
      camRef.current.play().catch(() => {});
    }
  }, [phase, camOn]);

  const { speak, stop: stopVoice } = useTherapistVoice({ voice: persona.voice, enabled: true });

  // keep refs in sync
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);
  useEffect(() => {
    transcriptRef.current = transcript;
    txEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // timer & session limits
  useEffect(() => {
    if (phase !== "active") return;
    timerRef.current = setInterval(() => {
      setElapsed(e => {
        if (e >= 300) { // 5 minutes max
          clearInterval(timerRef.current);
          endSession();
          return e;
        }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // INIT
  useEffect(() => {
    init();
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const init = async () => {
    // camera — optional, don't block if denied
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      camStream.current = s;
      if (camRef.current) camRef.current.srcObject = s;
      setCamOn(true);
    } catch {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        camStream.current = s;
      } catch { /* no mic either */ }
    }

    // create DB session
    try {
      const res = await apiClient.post("/therapy/video-sessions", { therapistId });
      const id = res.data?.data?._id || null;
      setSessionId(id);
      sessionIdRef.current = id;
      if (id) startSession("video", id); // ← notify global store
    } catch { /* continue without DB */ }

    setTimeout(() => {
      setPhase("ready");
    }, 1200);
  };

  const startActiveSession = async () => {
    setPhase("active");
    await sayTherapist(persona.greeting);
    setTimeout(startListening, 1500);
  };

  const cleanup = () => {
    camStream.current?.getTracks().forEach(t => t.stop());
    screenStream.current?.getTracks().forEach(t => t.stop());
    stopRec();
    stopVoice();
    stopListening();
    clearInterval(timerRef.current);
    endStoreSession(); // ← clear sidebar active state
  };

  // ── TTS ──────────────────────────────────────────────────────
  const sayTherapist = async (text: string) => {
    setTranscript(p => [...p, { speaker: "therapist", text }]);
    setCaption(text.slice(0, 100) + (text.length > 100 ? "…" : ""));
    setIsSpeaking(true);
    setStoreAvatarState("speaking"); // ← sidebar sees "speaking"
    speak(text);
    const dur = Math.min(text.length * 55 + 800, 8000);
    await new Promise(r => setTimeout(r, dur));
    setIsSpeaking(false);
    setStoreAvatarState("listening"); // ← sidebar sees "listening"
    setCaption("");
    saveEntry("therapist", text);
  };

  const saveEntry = (speaker: string, text: string) => {
    const id = sessionIdRef.current;
    if (!id) return;
    apiClient.post(`/therapy/video-sessions/${id}/transcript`, { speaker, text }).catch(() => {});
  };

  // ── AI response ───────────────────────────────────────────────
  const handleUserSpeech = useCallback(async (text: string) => {
    if (!text.trim() || aiTyping) return;
    setTranscript(p => [...p, { speaker: "user", text }]);
    setCaption(`You: ${text}`);
    setAiTyping(true);
    saveEntry("user", text);

    try {
      const res = await apiClient.post("/chat", {
        message: text,
        // Do NOT pass videoSession ID here — /api/chat expects a ChatSession._id.
        // The video transcript is saved separately via /therapy/video-sessions/:id/transcript.
        persona: { description: persona.systemPrompt.slice(0, 2000) },
      });
      const reply: string = res.data?.response || "Tell me more about that.";
      await sayTherapist(reply);
    } catch {
      await sayTherapist("Thank you for sharing. What else comes up for you?");
    } finally {
      setAiTyping(false);
      // restart listening after AI finishes
      setTimeout(startListening, 600);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiTyping, persona]);

  // ── STT ──────────────────────────────────────────────────────
  const handleSTTResult = useCallback((text: string, isFinal: boolean) => {
    if (isFinal) {
      setInterimTranscript("");
      handleUserSpeech(text);
      stopListening(); // Stop listening so AI can respond
    } else {
      setInterimTranscript(text);
    }
  }, [handleUserSpeech]);

  const { isListening: listening, startListening, stopListening } = useSpeechRecognition({
    onResult: handleSTTResult,
    continuous: true,
  });

  // Auto-restart if we didn't explicitly stop it and not ai typing
  useEffect(() => {
    if (!aiTyping && phase === "active" && micOn && !listening) {
       startListening();
    }
  }, [aiTyping, phase, micOn, listening, startListening]);

  // ── Controls ──────────────────────────────────────────────────
  const toggleCam = () => {
    camStream.current?.getVideoTracks().forEach(t => { t.enabled = camOn ? false : true; });
    setCamOn(v => !v);
  };

  const toggleMic = () => {
    camStream.current?.getAudioTracks().forEach(t => { t.enabled = !micOn; });
    setMicOn(v => !v);
    if (micOn) stopListening(); else setTimeout(startListening, 300);
  };

  const toggleScreen = async () => {
    if (sharing) {
      screenStream.current?.getTracks().forEach(t => t.stop());
      screenStream.current = null;
      setSharing(false);
      return;
    }
    try {
      const s = await (navigator.mediaDevices as any).getDisplayMedia({ video: true, audio: false });
      screenStream.current = s;
      s.getVideoTracks()[0].onended = () => { setSharing(false); screenStream.current = null; };
      setSharing(true);
    } catch { }
  };

  // ── Recording ─────────────────────────────────────────────────
  const startRec = () => {
    const stream = camStream.current;
    if (!stream || recRef.current) return;
    recChunks.current = [];
    try {
      const mr = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp8,opus" });
      mr.ondataavailable = e => { if (e.data.size > 0) recChunks.current.push(e.data); };
      mr.start(1000);
      recRef.current = mr;
      setRecording(true);
    } catch { }
  };

  const stopRec = () => {
    if (!recRef.current) return;
    recRef.current.stop();
    recRef.current = null;
    setRecording(false);
  };

  // ── Gestures ──────────────────────────────────────────────────
  const handleGesture = useCallback((result: GestureResult) => {
    // Only log meaningful intents
    if (result.intent !== "None") {
      setGestureInsights(p => {
        const newInsights = [...p, { meaning: result.intent, gesture: result.label, timestamp: new Date() }];
        gestureInsightsRef.current = newInsights;
        return newInsights;
      });
    }
  }, []);

  // ── End Session ───────────────────────────────────────────────
  const endSession = async () => {
    setPhase("ending");
    stopListening();
    stopVoice();
    stopRec();
    camStream.current?.getTracks().forEach(t => t.stop());
    clearInterval(timerRef.current);

    // Minimum interaction threshold: 10 total messages
    if (transcriptRef.current.length < 10) {
      setPhase("report");
      return;
    }

    if (sessionIdRef.current) {
      try {
        const res = await apiClient.post(`/therapy/video-sessions/${sessionIdRef.current}/end`, {
           gestureInsights: gestureInsightsRef.current
        });
        setReport(res.data?.data);
      } catch { }
    }
    setPhase("report");
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    handleUserSpeech(chatInput);
    setChatInput("");
  };

  // ── REPORT ────────────────────────────────────────────────────
  if (phase === "report") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-3">
            <div className={cn("h-20 w-20 mx-auto rounded-[1.75rem] flex items-center justify-center text-4xl bg-gradient-to-br shadow-2xl", persona.gradient)}>
              {persona.emoji}
            </div>
            <h1 className="text-3xl font-black">Session Complete</h1>
            <p className="text-muted-foreground">{fmt(elapsed)} · {transcript.length} exchanges · {persona.name}</p>
          </div>

          {report?.sessionNotes && (
            <div className="rounded-2xl border border-primary/10 bg-card/60 p-6 space-y-3">
              <div className="flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /><h3 className="font-black text-sm">Session Notes</h3></div>
              <p className="text-sm text-muted-foreground leading-relaxed">{report.sessionNotes}</p>
            </div>
          )}

          {report?.keyTopics?.length > 0 && (
            <div className="rounded-2xl border border-primary/10 bg-card/60 p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-3">Key Topics</p>
              <div className="flex flex-wrap gap-2">
                {report.keyTopics.map((t: string) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
              </div>
            </div>
          )}

          {report?.recommendations?.length > 0 && (
            <div className="rounded-2xl border border-primary/10 bg-card/60 p-5 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-3">Recommendations</p>
              {report.recommendations.map((r: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />{r}
                </div>
              ))}
            </div>
          )}

          {report?.emotionalSummary && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="text-sm text-emerald-400 italic">"{report.emotionalSummary}"</p>
            </div>
          )}

          {!report && transcript.length < 10 && (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-center space-y-2">
              <p className="text-sm font-black text-rose-400">Session Too Short</p>
              <p className="text-xs text-muted-foreground">
                We need a bit more interaction (at least 10 exchanges) to generate a meaningful clinical report. 
                Your session lasted {fmt(elapsed)} with {transcript.length} messages.
              </p>
            </div>
          )}

          {!report && transcript.length >= 10 && (
            <div className="rounded-2xl border border-primary/10 bg-card/60 p-6 text-center text-muted-foreground text-sm">
              {transcript.length} exchanges · {fmt(elapsed)} total
            </div>
          )}

          <div className="flex gap-3">
            <Button className="flex-1 rounded-2xl" onClick={() => router.push("/dashboard/sessions")}>
              <FileText className="h-4 w-4 mr-2" />View Sessions
            </Button>
            <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => router.push("/dashboard/avatar")}>
              New Session
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── STARTING ──────────────────────────────────────────────────
  if (phase === "starting") {
    return (
      <div className="h-screen bg-[#0a0a0f] flex items-center justify-center">
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
          className="text-center space-y-4">
          <div className={cn("h-24 w-24 mx-auto rounded-[2rem] flex items-center justify-center text-5xl bg-gradient-to-br shadow-2xl", persona.gradient)}>
            {persona.emoji}
          </div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-white/40">Connecting with {persona.name}…</p>
        </motion.div>
      </div>
    );
  }

  // ── ENDING ────────────────────────────────────────────────────
  if (phase === "ending") {
    return (
      <div className="h-screen bg-[#0a0a0f] flex items-center justify-center">
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
          className="text-center space-y-4">
          <Brain className="h-10 w-10 text-primary mx-auto" />
          <p className="text-sm font-black uppercase tracking-widest text-white/40">Generating your session report…</p>
        </motion.div>
      </div>
    );
  }

  // ── READY ─────────────────────────────────────────────────────
  if (phase === "ready") {
    return (
      <div className="h-screen bg-[#0a0a0f] flex flex-col items-center justify-center space-y-8">
        <div className="text-center space-y-4">
          <div className={cn("h-24 w-24 mx-auto rounded-[2rem] flex items-center justify-center text-5xl bg-gradient-to-br shadow-2xl", persona.gradient)}>
            {persona.emoji}
          </div>
          <p className="text-xl font-black text-white">{persona.name} is ready</p>
          <p className="text-sm text-white/50">{persona.title}</p>
        </div>
        <div className="flex gap-4">
          <div className="h-32 w-48 rounded-2xl overflow-hidden border border-white/10 bg-black relative shadow-2xl">
            <video ref={camRef} autoPlay playsInline muted className="w-full h-full object-cover -scale-x-100" />
            <span className="absolute bottom-2 left-2 text-[10px] font-black text-white/50 uppercase tracking-widest bg-black/50 px-2 py-0.5 rounded-full">Camera Preview</span>
          </div>
        </div>
        <Button size="lg" className="rounded-full px-8 h-12 text-sm font-black tracking-wide" onClick={startActiveSession}>
          Join Session <Video className="h-4 w-4 ml-2" />
        </Button>
      </div>
    );
  }

  // ── MEETING UI ────────────────────────────────────────────────
  return (
    <div className="h-screen bg-[#0a0a0f] text-white flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between px-5 py-3 bg-black/50 backdrop-blur border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br", persona.gradient)}>
            {persona.emoji}
          </div>
          <div>
            <p className="text-sm font-black">{persona.name}</p>
            <p className="text-[9px] uppercase tracking-widest text-white/30">{persona.tagline}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {recording && (
            <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 rounded-full px-2.5 py-1">
              <Circle className="h-2 w-2 fill-red-500 text-red-500 animate-pulse" />
              <span className="text-[9px] font-black text-red-400">REC</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-black text-white/50">{fmt(elapsed)}</span>
          </div>
          <button onClick={() => setShowTx(v => !v)}
            className={cn("h-8 px-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
              showTx ? "bg-primary/20 text-primary" : "bg-white/5 text-white/40")}>
            <MessageSquare className="h-3.5 w-3.5 inline mr-1" />Transcript
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main video area */}
        <div className="flex-1 relative bg-[#0d0d14] overflow-hidden">
          {/* Therapist avatar */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <motion.div
                animate={{ scale: isSpeaking ? [1, 1.05, 1] : [1, 1.015, 1] }}
                transition={{ duration: isSpeaking ? 0.55 : 4, repeat: Infinity }}
                className={cn("h-52 w-52 rounded-[3rem] flex items-center justify-center text-8xl shadow-2xl bg-gradient-to-br border border-white/10", persona.gradient)}
              >
                {persona.emoji}
              </motion.div>
              {isSpeaking && [1, 2, 3].map(i => (
                <motion.div key={i} className="absolute inset-0 rounded-[3rem] border border-white/15"
                  animate={{ scale: [1, 1 + i * 0.13], opacity: [0.6, 0] }}
                  transition={{ duration: 1.4, delay: i * 0.22, repeat: Infinity }} />
              ))}
              {aiTyping && (
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
                  {[0,1,2].map(i => (
                    <motion.div key={i} className="h-2.5 w-2.5 rounded-full bg-primary/50"
                      animate={{ y: [0,-6,0] }} transition={{ duration: 0.7, delay: i*0.15, repeat: Infinity }} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Live caption */}
          <AnimatePresence>
            {(caption || interimTranscript) && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute bottom-24 inset-x-4 flex justify-center z-10">
                <div className="bg-black/75 backdrop-blur rounded-2xl px-5 py-3 max-w-lg text-center text-sm text-white/90 font-medium">
                  {interimTranscript ? `You: ${interimTranscript}...` : caption}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Listening indicator */}
          <AnimatePresence>
            {listening && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-primary/20 border border-primary/40 rounded-full px-4 py-1.5">
                <Mic className="h-3.5 w-3.5 text-primary animate-pulse" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Listening…</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User PiP */}
          <div className="absolute bottom-4 right-4 h-32 w-48 rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl">
            <video ref={camRef} autoPlay playsInline muted
              className={cn("w-full h-full object-cover -scale-x-100", !camOn && "hidden")} />
            {!camOn && (
              <div className="w-full h-full flex items-center justify-center bg-[#1a1a24]">
                <VideoOff className="h-6 w-6 text-white/20" />
              </div>
            )}
            <span className="absolute bottom-1.5 left-2 text-[8px] font-black text-white/30 uppercase">You</span>
          </div>
        </div>

        {/* Transcript panel */}
        <AnimatePresence>
          {showTx && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              className="shrink-0 border-l border-white/5 bg-black/60 backdrop-blur flex flex-col overflow-hidden">
              <div className="p-4 border-b border-white/5 shrink-0">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Live Transcript</p>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {transcript.length === 0 && (
                  <p className="text-[10px] text-white/20 text-center mt-6">Conversation will appear here…</p>
                )}
                {transcript.map((e, i) => (
                  <div key={i} className={cn("text-xs leading-relaxed", e.speaker === "therapist" ? "text-white/70" : "text-primary/90")}>
                    <span className="block text-[8px] font-black uppercase tracking-widest opacity-40 mb-0.5">
                      {e.speaker === "therapist" ? persona.name : "You"}
                    </span>
                    {e.text}
                  </div>
                ))}
                <div ref={txEndRef} />
              </div>
              
              {/* Text Chat Input */}
              <div className="p-3 border-t border-white/5 shrink-0 flex gap-2">
                <input 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  placeholder="Type a message..."
                  disabled={aiTyping || listening}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-primary/50 disabled:opacity-50"
                />
                <button 
                  onClick={sendChat} 
                  disabled={!chatInput.trim() || aiTyping || listening}
                  className="bg-primary disabled:bg-primary/50 text-white rounded-xl p-2 flex items-center justify-center transition-all"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="shrink-0 bg-black/60 backdrop-blur border-t border-white/5 px-6 py-4">
        <div className="flex items-center justify-center gap-3">
          <button onClick={toggleMic}
            className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-all",
              micOn ? "bg-white/10 hover:bg-white/20" : "bg-destructive/80 hover:bg-destructive")}>
            {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>

          <button onClick={toggleCam}
            className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-all",
              camOn ? "bg-white/10 hover:bg-white/20" : "bg-destructive/80 hover:bg-destructive")}>
            {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>

          <button onClick={toggleScreen}
            className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-all",
              sharing ? "bg-primary/70" : "bg-white/10 hover:bg-white/20")}>
            <MonitorUp className="h-5 w-5" />
          </button>

          {/* Push-to-talk */}
          <motion.button whileTap={{ scale: 0.93 }} onClick={startListening}
            disabled={listening || aiTyping}
            className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-all shadow-xl",
              listening ? "bg-primary shadow-primary/40 animate-pulse" : "bg-primary/80 hover:bg-primary shadow-primary/20",
              aiTyping && "opacity-40 cursor-not-allowed")}>
            <Mic className="h-6 w-6" />
          </motion.button>

          <button onClick={recording ? stopRec : startRec}
            className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-all",
              recording ? "bg-red-600 hover:bg-red-700" : "bg-white/10 hover:bg-white/20")}>
            <Circle className={cn("h-5 w-5", recording ? "fill-white" : "")} />
          </button>

          <button onClick={endSession}
            className="h-12 w-12 rounded-2xl flex items-center justify-center bg-destructive/80 hover:bg-destructive transition-all">
            <Phone className="h-5 w-5 rotate-[135deg]" />
          </button>
        </div>
        <p className="text-center text-[9px] font-black uppercase tracking-widest text-white/20 mt-3">
          {listening ? "Listening — speak freely" : aiTyping ? `${persona.name} is responding…` : "Tap mic to speak · Auto-listens after each response"}
        </p>
      </div>

      <GestureRecognition 
        stream={camStream.current} 
        onGestureDetected={handleGesture} 
        autoStart={camOn}
        hiddenUI={true} 
      />
    </div>
  );
}
