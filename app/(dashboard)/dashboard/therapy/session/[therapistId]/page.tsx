"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api-client";
import { getPersona } from "@/lib/therapist-personas";
import { useTavusSession } from "@/hooks/use-tavus-session";
import { useTherapistStore } from "@/lib/store/therapist-store";
import { GestureRecognition } from "@/components/therapy/gesture-recognition";
import type { GestureResult } from "@/utils/gesture-detection";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Mic, MicOff, Video, VideoOff, Phone, MessageSquare,
  FileText, CheckCircle2, Send, Brain, Loader2,
} from "lucide-react";

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

interface TEntry { speaker: "user" | "therapist"; text: string; }

const BTN = "h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300";
const BTN_ON = "bg-white/10 text-white hover:bg-white/20";
const BTN_OFF = "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30";

export default function VideoSessionPage() {
  const params = useParams();
  const router = useRouter();
  const therapistId = (params?.therapistId as string) || "ava";
  const persona = getPersona(therapistId);
  const { startSession, endSession: endStoreSession, setAvatarState } = useTherapistStore();

  // ── All state/refs first — no temporal dead zone ─────────────────
  const [phase, setPhase] = useState<"starting"|"ready"|"active"|"ending"|"report">("starting");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState<TEntry[]>([]);
  const [report, setReport] = useState<any>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [caption, setCaption] = useState("");
  const [interimCaption, setInterimCaption] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [gestureInsights, setGestureInsights] = useState<{meaning:string;gesture:string;timestamp:Date}[]>([]);

  const camRef = useRef<HTMLVideoElement>(null);
  const txEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string | null>(null);
  const transcriptRef = useRef<TEntry[]>([]);
  const gestureRef = useRef(gestureInsights);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const recRef = useRef<MediaRecorder | null>(null);
  const recChunks = useRef<Blob[]>([]);
  const camStream = useRef<MediaStream | null>(null);

  // Keep refs in sync
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);
  useEffect(() => { transcriptRef.current = transcript; txEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [transcript]);
  useEffect(() => { gestureRef.current = gestureInsights; }, [gestureInsights]);

  // Re-bind camera stream whenever phase changes (new video element mounts)
  useEffect(() => {
    const stream = camStream.current;
    const el = camRef.current;
    if (stream && el && el.srcObject !== stream) {
      el.srcObject = stream;
      el.play().catch(() => {});
    }
  }, [phase]);

  // ── Stable helpers (no deps on late-declared state) ───────────────
  const saveEntry = useCallback((speaker: string, text: string) => {
    if (!sessionIdRef.current) return;
    apiClient.post(`/therapy/video-sessions/${sessionIdRef.current}/transcript`, { speaker, text }).catch(() => {});
  }, []);

  const addTranscript = useCallback((speaker: "user"|"therapist", text: string, isFinal: boolean) => {
    const clean = text.trim();
    if (!clean) return;
    if (!isFinal && speaker === "user") {
      setInterimCaption(`You: ${clean}`);
      return;
    }
    setInterimCaption("");
    setTranscript(p => {
      const last = p[p.length - 1];
      if (last?.speaker === speaker && last?.text === clean) return p;
      return [...p, { speaker, text: clean }];
    });
    const label = speaker === "user" ? "You" : persona.name;
    setCaption(`${label}: ${clean.slice(0, 100)}${clean.length > 100 ? "…" : ""}`);
    saveEntry(speaker, clean);
  }, [persona.name, saveEntry]);

  // ── Tavus — meeting engine ─────────────────────────────────────────
  const tavus = useTavusSession({
    onTranscript: useCallback((e) => addTranscript(e.speaker, e.text, e.isFinal), [addTranscript]),
  });

  // ── Camera/mic init ────────────────────────────────────────────────
  const initCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      camStream.current = stream;
      if (camRef.current) { camRef.current.srcObject = stream; camRef.current.play().catch(() => {}); }
      setCamOn(true);
    } catch (e) { console.warn("[Camera] Could not access camera:", e); }
  }, []);

  // ── Session lifecycle ──────────────────────────────────────────────
  const init = useCallback(async () => {
    await initCamera();
    try {
      const res = await apiClient.post("/therapy/video-sessions", { therapistId });
      const id = res.data?.data?._id || null;
      setSessionId(id);
      sessionIdRef.current = id;
      if (id) startSession("video", id);
    } catch {}
    setTimeout(() => setPhase("ready"), 1200);
  }, [therapistId, initCamera, startSession]);

  const startActive = useCallback(async () => {
    setPhase("active");
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    // Start recording
    if (camStream.current) {
      try {
        recChunks.current = [];
        const mr = new MediaRecorder(camStream.current, { mimeType: "video/webm;codecs=vp8,opus" });
        mr.ondataavailable = e => { if (e.data.size > 0) recChunks.current.push(e.data); };
        mr.start(1000);
        recRef.current = mr;
      } catch {}
    }
    // Tavus is the meeting engine — just join and let it handle conversation
    tavus.initTavusSession(therapistId);
  }, [therapistId, tavus]);

  const endSession = useCallback(async () => {
    setPhase("ending");
    clearInterval(timerRef.current);
    if (recRef.current?.state !== "inactive") recRef.current?.stop();
    camStream.current?.getTracks().forEach(t => t.stop());
    tavus.endSession();
    endStoreSession();

    if (sessionIdRef.current && transcriptRef.current.length >= 2) {
      try {
        const ctrl = new AbortController();
        setTimeout(() => ctrl.abort(), 45_000);
        const res = await apiClient.post(
          `/therapy/video-sessions/${sessionIdRef.current}/end`,
          { gestureInsights: gestureRef.current },
          { signal: ctrl.signal }
        );
        setReport(res.data?.data);
      } catch (e: any) { console.warn("[endSession]", e.message); }
    }
    setPhase("report");
  }, [tavus, endStoreSession]);

  useEffect(() => { init(); return () => { clearInterval(timerRef.current); tavus.endSession(); endStoreSession(); }; }, []);

  // ── Send typed message to Tavus ───────────────────────────────────
  const sendChat = useCallback(() => {
    const text = chatInput.trim();
    if (!text || !tavus.callObject) return;
    setChatInput("");
    addTranscript("user", text, true);
    try {
      tavus.callObject.sendAppMessage({ message_type: "conversation", event_type: "conversation.echo", properties: { text } });
    } catch (e) { console.warn("[sendChat]", e); }
  }, [chatInput, tavus.callObject, addTranscript]);

  // ── Gesture handler ───────────────────────────────────────────────
  const handleGesture = useCallback((r: GestureResult) => {
    if (r.intent !== "None") {
      setGestureInsights(p => [...p, { meaning: r.intent, gesture: r.label, timestamp: new Date() }]);
    }
  }, []);

  // ── Mic/cam toggle ────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    camStream.current?.getAudioTracks().forEach(t => { t.enabled = micOn ? false : true; });
    if (tavus.callObject) { try { tavus.callObject.setLocalAudio(!micOn); } catch {} }
    setMicOn(v => !v);
  }, [micOn, tavus.callObject]);

  const toggleCam = useCallback(() => {
    camStream.current?.getVideoTracks().forEach(t => { t.enabled = camOn ? false : true; });
    setCamOn(v => !v);
  }, [camOn]);

  // ── Phase screens ─────────────────────────────────────────────────
  if (phase === "starting") return (
    <div className="h-screen bg-[#0a0a0f] flex items-center justify-center">
      <motion.div animate={{ opacity: [0.4,1,0.4] }} transition={{ duration: 2, repeat: Infinity }} className="text-center space-y-4">
        <div className={cn("h-24 w-24 mx-auto rounded-[2rem] flex items-center justify-center text-5xl bg-gradient-to-br shadow-2xl", persona.gradient)}>{persona.emoji}</div>
        <p className="text-sm font-black uppercase tracking-[0.3em] text-white/40">Connecting with {persona.name}…</p>
      </motion.div>
    </div>
  );

  if (phase === "ending") return (
    <div className="h-screen bg-[#0a0a0f] flex items-center justify-center">
      <motion.div animate={{ opacity: [0.4,1,0.4] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-center space-y-4">
        <Brain className="h-10 w-10 text-primary mx-auto" />
        <p className="text-sm font-black uppercase tracking-widest text-white/40">Generating session report…</p>
      </motion.div>
    </div>
  );

  if (phase === "ready") return (
    <div className="h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-8">
      <div className="text-center space-y-3">
        <div className={cn("h-24 w-24 mx-auto rounded-[2rem] flex items-center justify-center text-5xl bg-gradient-to-br shadow-2xl", persona.gradient)}>{persona.emoji}</div>
        <p className="text-xl font-black text-white">{persona.name} is ready</p>
        <p className="text-sm text-white/50">{persona.title}</p>
      </div>
      <div className="h-32 w-48 rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl relative">
        <video ref={camRef} autoPlay playsInline muted className="w-full h-full object-cover -scale-x-100" />
        <span className="absolute bottom-2 left-2 text-[10px] font-black text-white/50 uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded-full">Camera</span>
      </div>
      <button onClick={startActive} className="h-12 px-8 rounded-full bg-primary text-primary-foreground text-sm font-black tracking-wide shadow-lg hover:opacity-90 transition flex items-center gap-2">
        <Video className="h-4 w-4" /> Join Session
      </button>
    </div>
  );

  if (phase === "report") return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-3">
          <div className={cn("h-20 w-20 mx-auto rounded-[1.75rem] flex items-center justify-center text-4xl bg-gradient-to-br shadow-2xl", persona.gradient)}>{persona.emoji}</div>
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
            <div className="flex flex-wrap gap-2">{report.keyTopics.map((t: string) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}</div>
          </div>
        )}
        {report?.recommendations?.length > 0 && (
          <div className="rounded-2xl border border-primary/10 bg-card/60 p-5 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-3">Recommendations</p>
            {report.recommendations.map((r: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />{r}</div>
            ))}
          </div>
        )}
        {report?.emotionalSummary && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-sm text-emerald-400 italic">&ldquo;{report.emotionalSummary}&rdquo;</p>
          </div>
        )}
        {!report && (
          <div className="rounded-2xl border border-primary/10 bg-card/60 p-6 text-center text-muted-foreground text-sm">
            {transcript.length < 2 ? "Session was too short to generate a report." : `${transcript.length} exchanges · ${fmt(elapsed)}`}
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={() => router.push("/dashboard/sessions")} className="flex-1 h-11 rounded-2xl bg-primary text-primary-foreground text-sm font-black flex items-center justify-center gap-2 hover:opacity-90 transition">
            <FileText className="h-4 w-4" /> View Sessions
          </button>
          <button onClick={() => router.push("/dashboard/avatar")} className="flex-1 h-11 rounded-2xl border border-primary/20 text-sm font-black hover:bg-primary/5 transition">
            New Session
          </button>
        </div>
      </motion.div>
    </div>
  );

  // ── ACTIVE MEETING UI ─────────────────────────────────────────────
  return (
    <div className="h-screen bg-[#0a0a0f] text-white flex flex-col overflow-hidden relative">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className={cn("absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] bg-gradient-to-br", persona.gradient)} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] bg-primary/20" />
      </div>

      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-6 py-3 z-50 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-3">
          <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br shadow", persona.gradient)}>{persona.emoji}</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black">{persona.name}</span>
              <Badge variant="outline" className="bg-primary/10 border-primary/20 text-[9px] font-black uppercase h-4 py-0">LIVE</Badge>
              {tavus.status === "connected" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
            </div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">{sessionId?.slice(-8) || "connecting…"}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-mono font-black tabular-nums text-white/60">{fmt(elapsed)}</span>
          <button onClick={() => setShowSidebar(v => !v)} className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition">
            <MessageSquare className="h-4 w-4 text-white/60" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative px-4 pb-24 gap-4">
        {/* Tavus video — full height, fills available space */}
        <div className="flex-1 relative min-h-0">
          <div className="absolute inset-0 rounded-3xl overflow-hidden bg-[#0d0d14] border border-white/5 shadow-2xl">
            {/* ALWAYS mounted — never conditional */}
            <video ref={tavus.videoRef} autoPlay playsInline muted={false} className="w-full h-full object-cover" />
            <audio ref={tavus.audioRef} autoPlay />

            {/* Loading overlay — fades out when connected */}
            <AnimatePresence>
              {tavus.status !== "connected" && (
                <motion.div key="loading" initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.5 } }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm z-10">
                  {tavus.status === "error" ? (
                    <>
                      <div className="h-14 w-14 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-4 text-2xl">⚠️</div>
                      <p className="text-red-400 text-sm font-semibold">Connection Failed</p>
                      <p className="text-white/30 text-xs mt-1 text-center px-8">{tavus.errorMsg}</p>
                    </>
                  ) : (
                    <>
                      <div className={cn("h-20 w-20 rounded-3xl flex items-center justify-center text-5xl mb-5 bg-gradient-to-br border border-white/10 shadow-2xl", persona.gradient)}>{persona.emoji}</div>
                      <Loader2 className="h-5 w-5 text-white/30 animate-spin mb-3" />
                      <p className="text-white/50 text-sm font-semibold">{persona.name}</p>
                      <p className="text-white/25 text-xs mt-1">{tavus.status === "initializing" ? "Joining session…" : "Starting…"}</p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Live captions — always rendered over Tavus video */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-20 flex flex-col gap-1.5 pointer-events-none">
            <AnimatePresence>
              {interimCaption && (
                <motion.div key="interim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-black/50 backdrop-blur-sm rounded-xl px-4 py-1.5 border border-white/5">
                  <p className="text-center text-white/50 text-sm italic">{interimCaption}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              {caption && (
                <motion.div key={caption} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="bg-black/75 backdrop-blur-md rounded-2xl px-5 py-2.5 border border-white/10 shadow-xl">
                  <p className="text-center text-white/95 text-sm font-semibold">{caption}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar — local cam PiP + transcript */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div initial={{ x: 280, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 280, opacity: 0 }}
              className="w-72 flex flex-col gap-3 py-1 z-40 shrink-0">
              {/* Local camera PiP with gesture overlay */}
              <div className="h-44 rounded-2xl overflow-hidden border border-white/10 bg-black shadow-xl relative group">
                <video ref={camRef} autoPlay playsInline muted className={cn("w-full h-full object-cover -scale-x-100", !camOn && "hidden")} />
                {!camOn && <div className="w-full h-full flex items-center justify-center bg-zinc-900"><VideoOff className="h-7 w-7 text-white/20" /></div>}

                {/* Gesture overlay — visually on top of camera, independent of Tavus */}
                <GestureRecognition
                  onGestureDetected={handleGesture}
                  stream={camStream.current}
                  autoStart={phase === "active"}
                  asOverlay
                />

                <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-2 py-0.5">
                  <div className="h-1 w-1 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[8px] font-black text-emerald-400 uppercase tracking-wide">AI Vision</span>
                </div>
              </div>

              {/* Transcript drawer */}
              <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden min-h-0">
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between shrink-0">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Session Log</span>
                  <div className={cn("h-1.5 w-1.5 rounded-full", tavus.status === "connected" ? "bg-emerald-500 animate-pulse" : "bg-white/10")} />
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-hide">
                  {transcript.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 gap-2">
                      <MessageSquare className="h-7 w-7" />
                      <p className="text-[9px] uppercase font-black tracking-widest text-center">Waiting for conversation</p>
                    </div>
                  )}
                  {transcript.map((e, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: e.speaker === "user" ? 10 : -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-0.5">
                      <span className={cn("text-[9px] font-black uppercase tracking-widest", e.speaker === "therapist" ? "text-primary/60" : "text-white/30")}>
                        {e.speaker === "therapist" ? persona.name : "You"}
                      </span>
                      <p className={cn("text-xs leading-relaxed", e.speaker === "therapist" ? "text-white/80" : "text-white/60")}>{e.text}</p>
                    </motion.div>
                  ))}
                  <div ref={txEndRef} />
                </div>
                {/* Chat input — sends text to Tavus */}
                <div className="p-2.5 bg-black/20 shrink-0">
                  <div className="relative">
                    <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && sendChat()}
                      placeholder="Type a message…"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-3 pr-8 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-primary/40 transition" />
                    <button onClick={sendChat} className="absolute right-2 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary transition">
                      <Send className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls dock */}
      <div className="fixed bottom-0 inset-x-0 pb-6 flex justify-center pointer-events-none z-[100]">
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-2.5 flex items-center gap-2 pointer-events-auto shadow-2xl">
          <button onClick={toggleMic} title="Toggle Mic" className={cn(BTN, micOn ? BTN_ON : BTN_OFF)}>
            {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>
          <button onClick={toggleCam} title="Toggle Camera" className={cn(BTN, camOn ? BTN_ON : BTN_OFF)}>
            {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>
          <button onClick={() => setShowSidebar(v => !v)} title="Toggle Sidebar" className={cn(BTN, showSidebar ? BTN_ON : "bg-white/5 text-white/40 hover:bg-white/10")}>
            <MessageSquare className="h-5 w-5" />
          </button>
          <div className="w-px h-8 bg-white/10 mx-1" />
          <button onClick={endSession} className="h-12 px-6 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition text-xs font-black uppercase tracking-wider flex items-center gap-2">
            <Phone className="h-4 w-4 rotate-[135deg]" /> End
          </button>
        </motion.div>
      </div>
    </div>
  );
}
