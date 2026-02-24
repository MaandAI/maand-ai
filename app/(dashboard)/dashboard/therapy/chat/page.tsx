"use client";

import type React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { usePersonaProfile } from "@/hooks/use-persona-profile";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useState, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMockAIResponse } from "@/lib/mock/ai-responses";
import { cn } from "@/lib/utils";
import { MoodCheckIn } from "@/components/therapy/mood-check-in";
import { MoodCheckInSkeleton } from "@/components/therapy/mood-check-in-skeleton";
import { MoodTrendCard } from "@/components/therapy/mood-trend-card";
import { OutcomeScoresCard } from "@/components/therapy/outcome-scores-card";
import type { Mood } from "@/lib/mock/therapy";
import { detectCrisisKeywords } from "@/lib/mock/crisis-detection";
import { CrisisAlertBanner } from "@/components/therapy/crisis-alert-banner";
import { GroundingExerciseModal } from "@/components/therapy/grounding-exercise-modal";
import { GestureRecognition } from "@/components/therapy/gesture-recognition";
import type { GestureResult } from "@/utils/gesture-detection";
import { useToast } from "@/hooks/use-toast";
import { AvatarDisplay } from "@/components/avatar/avatar-display";
import type { AvatarState } from "@/lib/mock/avatar-states";

type Message = {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
};

export default function TherapyChatPage() {
  const [showMoodCheckIn, setShowMoodCheckIn] = useState(true);
  const [sessionMood, setSessionMood] = useState<Mood | null>(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content:
        "Hello! I'm your AI therapy assistant. I'm here to provide a supportive space for you to explore your thoughts and feelings. How are you feeling today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [showGroundingModal, setShowGroundingModal] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>("calm");
  const [avatarEnabled, setAvatarEnabled] = useState(true);
  const [userIsTyping, setUserIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { persona, savePersona } = usePersonaProfile();

  // Setup Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              setMessage((prev) => prev + transcript + " ");
            } else {
              currentTranscript += transcript;
            }
          }
          if (currentTranscript) {
            // Optional: handle interim results visual feedback
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          if (isListening) recognitionRef.current?.start(); // auto-restart if still "listening"
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setMessage(""); // Clear message when starting fresh dictation
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const speakText = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    // Optional: pick a specific soothing voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.name.includes("Female") || v.name.includes("Google US English"),
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.rate = 0.9; // Slightly slower, calmer
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (showCrisisAlert) {
      setAvatarState("supportive");
    } else if (isTyping) {
      setAvatarState("thinking");
    } else if (userIsTyping) {
      setAvatarState("listening");
    } else {
      setAvatarState("calm");
    }
  }, [isTyping, userIsTyping, showCrisisAlert]);

  const handleMoodComplete = (mood: Mood, note?: string) => {
    setSessionMood(mood);
    setShowMoodCheckIn(false);
    setAvatarState("reflective");

    const moodMessage: Message = {
      id: `mood-${Date.now()}`,
      content: `Thank you for taking a moment to check in. I understand you're feeling ${mood.label.toLowerCase()} right now${
        note ? `. I hear you: "${note}"` : ""
      }. There's no right or wrong way to feel—I'm simply here to listen and support you. What would feel helpful to explore today?`,
      sender: "ai",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, moodMessage]);
    speakText(moodMessage.content);

    setTimeout(() => setAvatarState("calm"), 2000);
  };

  const handleConnectProvider = () => {
    toast({
      title: "Connecting to Provider",
      description:
        "In production, this would connect you to a licensed mental health professional.",
    });
  };

  const handleGroundingExercise = () => {
    setShowGroundingModal(true);
  };

  const handleGestureDetected = (result: GestureResult) => {
    console.log("Detected Gesture", result);
    // Treat the detected intent like a chat message
    if (result.intent !== "Unknown") {
      toast({
        title: "Gesture Recognized",
        description: `Detected: ${result.intent} (${Math.round(result.confidence * 100)}%)`,
      });
      // Optional: automatically set message text or send directly
      setMessage((prev) => {
        const sep = prev.endsWith(" ") || prev.length === 0 ? "" : " ";
        return prev + sep + result.intent;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (isListening) toggleListening(); // Stop mic when sending
    window.speechSynthesis.cancel(); // Stop talking if user interrupts

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    const hasCrisisKeywords = detectCrisisKeywords(userMessage.content);
    if (hasCrisisKeywords) {
      setShowCrisisAlert(true);
    }

    setMessage("");
    setUserIsTyping(false);
    setIsTyping(true);

    const thinkingTime = 1000 + Math.random() * 1000;
    await new Promise((resolve) => setTimeout(resolve, thinkingTime));

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      content: "",
      sender: "ai",
      timestamp: new Date(),
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          persona,
          sessionId,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      aiResponse.content = data.response || "I'm here with you. Tell me more.";
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }
      if (data.isCrisis) {
        setShowCrisisAlert(true);
      }
    } catch (e) {
      console.error(e);
      aiResponse.content =
        "I'm having trouble connecting right now, but I'm still here physically. Please try again in a moment.";
    }

    setMessages((prev) => [...prev, aiResponse]);
    setIsTyping(false);
    speakText(aiResponse.content);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-balance">
          Your Therapy Space
        </h1>
        <p className="text-muted-foreground mt-2 text-pretty">
          A confidential space to explore your thoughts and feelings at your own
          pace. This conversation is between you and your AI companion—private,
          judgment-free, and completely secure.
        </p>
      </div>

      <Alert className="border-primary/20 bg-primary/5">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm leading-relaxed">
          <strong className="font-medium">A note about safety:</strong> This AI
          assistant provides supportive listening but isn't a replacement for
          professional care. If you're in crisis or need immediate support,
          please reach out to a licensed provider or crisis line. You deserve
          care from a human who can fully support you.
        </AlertDescription>
      </Alert>

      {showCrisisAlert && (
        <CrisisAlertBanner
          onConnectProvider={handleConnectProvider}
          onGroundingExercise={handleGroundingExercise}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Who would you like to talk to?</CardTitle>
          <CardDescription>
            Describe how this person spoke, felt, and responded emotionally. The
            assistant will respond in a style inspired by your description.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Textarea
            placeholder="Example:
Calm, gentle voice.
Listened before responding.
Emotionally steady, never rushed advice.
Used short, reassuring sentences."
            value={persona?.description || ""}
            onChange={(e) =>
              savePersona({
                description: e.target.value,
              })
            }
          />

          <p className="text-xs text-muted-foreground">
            This does not recreate the person. Responses are inspired by the
            traits you describe.
          </p>
        </CardContent>
      </Card>

      {showMoodCheckIn ? (
        <Suspense fallback={<MoodCheckInSkeleton />}>
          <MoodCheckIn onComplete={handleMoodComplete} />
        </Suspense>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <MoodTrendCard />
          <OutcomeScoresCard />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
        <Card className="h-[calc(100vh-16rem)]">
          <CardHeader className="border-b">
            <CardTitle>Today's Conversation</CardTitle>
            <CardDescription>
              Take your time. Share whatever feels right—there's no pressure to
              talk about anything specific.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-[calc(100%-5rem)]">
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <GestureRecognition onGestureDetected={handleGestureDetected} />

              {messages.length === 1 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-3 max-w-md">
                    <div className="rounded-full bg-muted p-4 inline-block mb-2">
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium">Your space, your pace</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Beginning a conversation can feel vulnerable. There's no
                      rush—take a breath, and share what feels comfortable when
                      you're ready. I'll be here.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "flex gap-3",
                        msg.sender === "user" && "flex-row-reverse",
                      )}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback
                          className={cn(
                            msg.sender === "ai"
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground",
                          )}
                        >
                          {msg.sender === "ai" ? (
                            <Bot className="h-4 w-4" />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          "flex-1 max-w-[80%]",
                          msg.sender === "user" && "flex flex-col items-end",
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-lg p-3",
                            msg.sender === "ai"
                              ? "bg-muted"
                              : "bg-primary text-primary-foreground",
                          )}
                        >
                          <p className="text-sm leading-relaxed">
                            {msg.content}
                          </p>
                        </div>
                        <p
                          className={cn(
                            "text-xs text-muted-foreground mt-1",
                            msg.sender === "user" && "text-right",
                          )}
                        >
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-3"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-3 w-16">
                        <div className="flex gap-1 items-center justify-center">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-muted-foreground rounded-full"
                              animate={{
                                y: [0, -8, 0],
                              }}
                              transition={{
                                duration: 0.6,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: i * 0.15,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Button
                  type="button"
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  className={cn("shrink-0", isListening && "animate-pulse")}
                  onClick={toggleListening}
                  title={isListening ? "Stop listening" : "Start speaking"}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
                <Input
                  placeholder="Share what's on your mind..."
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setUserIsTyping(e.target.value.length > 0);
                  }}
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isTyping || (!message.trim() && !isListening)}
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </form>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                  Powered by clinical-grade AI and live emotion detection.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => {
                    setVoiceEnabled(!voiceEnabled);
                    if (voiceEnabled) window.speechSynthesis.cancel();
                  }}
                >
                  {voiceEnabled ? (
                    <Volume2 className="h-3 w-3 mr-1" />
                  ) : (
                    <VolumeX className="h-3 w-3 mr-1" />
                  )}
                  {voiceEnabled ? "Voice On" : "Voice Off"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hidden lg:block lg:w-80">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Therapy Avatar</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAvatarEnabled(!avatarEnabled)}
                className="text-xs h-8"
              >
                {avatarEnabled ? "Hide" : "Show"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <AvatarDisplay
              state={avatarState}
              enabled={avatarEnabled}
              size="lg"
            />

            {avatarEnabled && (
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full animate-pulse",
                      avatarState === "calm" && "bg-blue-400",
                      avatarState === "supportive" && "bg-pink-400",
                      avatarState === "reflective" && "bg-purple-400",
                      avatarState === "listening" && "bg-green-400",
                      avatarState === "thinking" && "bg-amber-400",
                    )}
                  />
                  <p className="text-sm font-medium capitalize">
                    {avatarState}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {avatarState === "listening" && "Luna is listening to you..."}
                  {avatarState === "thinking" && "Luna is thinking..."}
                  {avatarState === "supportive" &&
                    "Luna is here to support you"}
                  {avatarState === "reflective" &&
                    "Luna is reflecting on your feelings"}
                  {avatarState === "calm" && "Luna is ready to help"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <GroundingExerciseModal
        open={showGroundingModal}
        onOpenChange={setShowGroundingModal}
      />
    </div>
  );
}
