"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { usePersonaProfile } from "@/hooks/use-persona-profile";

// UI Components
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MoodCheckIn } from "@/components/therapy/mood-check-in";
import { CrisisAlertBanner } from "@/components/therapy/crisis-alert-banner";
import { GroundingExerciseModal } from "@/components/therapy/grounding-exercise-modal";
import { GestureRecognition } from "@/components/therapy/gesture-recognition";

// Refactored Components
import { ChatHeader } from "./components/chat-header";
import { ChatSidebar } from "./components/chat-sidebar";
import { MessageList } from "./components/message-list";
import { ChatInput } from "./components/chat-input";
import { ToolsSidebar } from "./components/tools-sidebar";

// Hooks & Types
import { useTherapyChat } from "./hooks/use-therapy-chat";
import { useTherapyVoice } from "./hooks/use-therapy-voice";
import { AvatarState } from "./types";
import { Mood } from "@/lib/mock/therapy";

export default function TherapyChatPage() {
  const { toast } = useToast();
  const { persona, savePersona } = usePersonaProfile();
  
  // Custom Hooks
  const chat = useTherapyChat();
  const voice = useTherapyVoice();

  // Local UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [showGroundingModal, setShowGroundingModal] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>("calm");
  const [userIsTyping, setUserIsTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages, chat.isTyping]);

  // Sync Avatar State
  useEffect(() => {
    if (chat.showCrisisAlert) {
      setAvatarState("supportive");
    } else if (chat.isTyping) {
      setAvatarState("thinking");
    } else if (userIsTyping) {
      setAvatarState("listening");
    } else {
      setAvatarState("calm");
    }
  }, [chat.isTyping, userIsTyping, chat.showCrisisAlert]);

  const handleMoodComplete = (mood: Mood, note?: string) => {
    chat.setShowMoodCheckIn(false);
    setAvatarState("reflective");

    const content = `Thank you for taking a moment to check in. I understand you're feeling ${mood.label.toLowerCase()} right now${
      note ? `. I hear you: "${note}"` : ""
    }. There's no right or wrong way to feel—I'm simply here to listen and support you. What would feel helpful to explore today?`;
    
    chat.addAIMessage(content);
    voice.speakText(content);

    setTimeout(() => setAvatarState("calm"), 2000);
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (voice.isListening) voice.stopListening();
    voice.stopSpeaking();

    await chat.sendMessage(chat.message, (aiResponse) => {
      voice.speakText(aiResponse);
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-6">
      <ChatHeader 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isRightSidebarOpen={isRightSidebarOpen}
        setIsRightSidebarOpen={setIsRightSidebarOpen}
        onNewSession={chat.handleNewSession}
      />

      <div className="flex-1 flex gap-6 overflow-hidden">
        {isSidebarOpen && (
          <ChatSidebar 
            sessions={chat.sessions}
            currentSessionId={chat.sessionId}
            onSelectSession={chat.handleSelectSession}
          />
        )}

        <div className="flex-1 flex gap-6 overflow-hidden relative">
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            {chat.showCrisisAlert && (
              <CrisisAlertBanner
                onConnectProvider={() => toast({ title: "Connecting..." })}
                onGroundingExercise={() => setShowGroundingModal(true)}
              />
            )}

            <div className="flex-1 flex gap-6 overflow-hidden">
              <Card className="flex-1 flex flex-col border-none shadow-xl bg-card/30 backdrop-blur-md rounded-3xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                
                {/* Interaction Mask during Mood Check */}
                {chat.showMoodCheckIn && (
                  <div className="absolute inset-x-0 bottom-0 top-[60px] bg-background/40 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-b-3xl">
                    <div className="bg-card/80 px-6 py-3 rounded-2xl shadow-xl border border-primary/10 text-sm font-medium animate-in fade-in zoom-in duration-300">
                      Complete your mood check-in to start chatting
                    </div>
                  </div>
                )}

                <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                  <GestureRecognition onGestureDetected={(r) => chat.setMessage(prev => prev + " " + r.intent)} />

                  <div className="space-y-6">
                    {chat.showMoodCheckIn ? (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <MoodCheckIn onComplete={handleMoodComplete} />
                      </motion.div>
                    ) : (
                      <MessageList 
                        messages={chat.messages}
                        isTyping={chat.isTyping}
                        formatTime={formatTime}
                      />
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <ChatInput 
                  message={chat.message}
                  setMessage={chat.setMessage}
                  onSubmit={handleMessageSubmit}
                  isListening={voice.isListening}
                  toggleListening={() => voice.isListening ? voice.stopListening() : voice.startListening(t => chat.setMessage(prev => prev + t + " "))}
                  voiceEnabled={voice.voiceEnabled}
                  setVoiceEnabled={voice.setVoiceEnabled}
                  disabled={chat.showMoodCheckIn}
                  isTyping={chat.isTyping}
                  setUserIsTyping={setUserIsTyping}
                />
              </Card>

              {isRightSidebarOpen && (
                <ToolsSidebar 
                  avatarState={avatarState}
                  avatarEnabled={voice.voiceEnabled}
                  personaDescription={persona?.description || ""}
                  onPersonaChange={(d) => savePersona({ description: d })}
                  sessionId={chat.sessionId}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <GroundingExerciseModal open={showGroundingModal} onOpenChange={setShowGroundingModal} />
    </div>
  );
}
