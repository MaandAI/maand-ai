"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ChatSidebar } from "@/components/therapy/chat-ui/chat-sidebar";
import { MessageList } from "@/components/therapy/chat-ui/message-list";
import { ToolsSidebar } from "@/components/therapy/chat-ui/tools-sidebar";
import { ChatInput } from "@/components/therapy/chat-ui/chat-input";
import { ChatHeader } from "@/components/therapy/chat-ui/chat-header";
import { AvatarState } from "@/types/therapy";
import { Mood } from "@/lib/mock/therapy";
import { useTherapyChat } from "@/hooks/therapy/use-therapy-chat";
import { useTherapyVoice } from "@/hooks/therapy/use-therapy-voice";
import { AvatarDisplay } from "@/components/avatar/avatar-display";

export default function TherapyChatPage() {
  const { toast } = useToast();
  const { persona, savePersona } = usePersonaProfile();

  // Custom Hooks
  const chat = useTherapyChat();
  const voice = useTherapyVoice();

  // Local UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [showGroundingModal, setShowGroundingModal] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>("calm");
  const [userIsTyping, setUserIsTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (!chat.showMoodCheckIn) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat.messages, chat.isTyping, chat.showMoodCheckIn]);

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

  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => setIsLargeScreen(window.innerWidth >= 1024);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleNewSession = useCallback(() => {
    setIsSidebarOpen(false);
    setIsRightSidebarOpen(false);
    chat.handleNewSession();
  }, [chat]);

  return (
    <div className="flex flex-col h-[calc(100dvh-6rem)] md:h-[calc(100vh-8rem)] min-h-0 gap-4">
      <ChatHeader
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isRightSidebarOpen={isRightSidebarOpen}
        setIsRightSidebarOpen={setIsRightSidebarOpen}
        onNewSession={handleNewSession}
        onCompleteSession={() => chat.completeSession(chat.sessionId)}
        isCompleting={chat.isCompleting}
        sessionStatus={chat.currentSession?.status}
      />

      <div className="flex-1 min-h-0 flex gap-4 md:gap-6 overflow-hidden relative">
        {/* Left Sidebar: Mobile Sheet (Only on small/medium screens) */}
        {!isLargeScreen && (
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetContent side="left" className="p-0 w-72">
              <ChatSidebar
                sessions={chat.sessions}
                currentSessionId={chat.sessionId}
                onSelectSession={(id) => {
                  chat.handleSelectSession(id);
                  setIsSidebarOpen(false);
                }}
                onRefresh={chat.loadSessions}
                className="flex w-full h-full border-none shadow-none bg-transparent"
              />
            </SheetContent>
          </Sheet>
        )}

        {/* Left Sidebar: Desktop Motion Div (Only on large screens) */}
        <AnimatePresence>
          {isSidebarOpen && isLargeScreen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="hidden lg:flex shrink-0 h-full overflow-hidden"
            >
              <ChatSidebar
                sessions={chat.sessions}
                currentSessionId={chat.sessionId}
                onSelectSession={chat.handleSelectSession}
                onRefresh={chat.loadSessions}
                className="w-full h-full"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-hidden relative">
          {chat.showCrisisAlert && (
            <CrisisAlertBanner
              onConnectProvider={() => toast({ title: "Connecting..." })}
              onGroundingExercise={() => setShowGroundingModal(true)}
            />
          )}

          <div className="flex-1 min-h-0 flex gap-6 overflow-hidden relative">
            <Card className="flex-1 flex flex-col border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2rem] overflow-hidden relative border border-primary/5">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />

              <div className="flex-1 min-h-0 relative">
                <ScrollArea 
                  className="absolute inset-0 w-full h-full p-4 md:p-8" 
                  ref={scrollRef}
                  hideScrollbar={!chat.showMoodCheckIn}
                >
                {!chat.showMoodCheckIn && (
                  <GestureRecognition
                    onGestureDetected={(r) =>
                      chat.setMessage((prev) => prev + " " + r.intent)
                    }
                  />
                )}

                <div className="max-w-4xl mx-auto space-y-6">
                  {chat.showMoodCheckIn ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-4 md:py-8 min-h-[500px] flex flex-col items-center justify-center"
                    >
                      <MoodCheckIn onComplete={handleMoodComplete} />
                    </motion.div>
                  ) : (
                    <MessageList
                      messages={chat.messages}
                      isTyping={chat.isTyping}
                      formatTime={formatTime}
                    />
                  )}
                  <div ref={messagesEndRef} className="h-4" />
                </div>
              </ScrollArea>
            </div>

              {/* Floating Avatar when right sidebar is closed - Desktop only */}
              <AnimatePresence>
                {!isRightSidebarOpen &&
                  !chat.showMoodCheckIn &&
                  isLargeScreen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: 20 }}
                      className="absolute top-6 right-6 z-10"
                    >
                      <div className="bg-card/90 backdrop-blur-md p-2 rounded-full shadow-2xl border border-primary/20 scale-75 transform-gpu origin-top-right">
                        <AvatarDisplay
                          state={avatarState}
                          enabled={true}
                          size="sm"
                        />
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>

              <ChatInput
                message={chat.message}
                setMessage={chat.setMessage}
                onSubmit={handleMessageSubmit}
                isListening={voice.isListening}
                toggleListening={() =>
                  voice.isListening
                    ? voice.stopListening()
                    : voice.startListening((t) =>
                        chat.setMessage((prev) => prev + t + " "),
                      )
                }
                voiceEnabled={voice.voiceEnabled}
                setVoiceEnabled={voice.setVoiceEnabled}
                disabled={chat.showMoodCheckIn || chat.currentSession?.status === "completed"}
                isTyping={chat.isTyping}
                setUserIsTyping={setUserIsTyping}
              />
            </Card>

            {/* Right Sidebar: Mobile Sheet (Only on small/medium screens) */}
            {!isLargeScreen && (
              <Sheet
                open={isRightSidebarOpen}
                onOpenChange={setIsRightSidebarOpen}
              >
                <SheetContent side="right" className="p-0 w-80">
                  <ScrollArea className="h-full">
                    <ToolsSidebar
                      avatarState={avatarState}
                      avatarEnabled={true}
                      personaDescription={persona?.description || ""}
                      onPersonaChange={(d) => savePersona({ description: d })}
                      sessionId={chat.sessionId}
                      className="flex w-full p-4 border-none shadow-none bg-transparent"
                    />
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            )}

            {/* Right Sidebar: Desktop Motion Div (Only on large screens) */}
            <AnimatePresence>
              {isRightSidebarOpen && isLargeScreen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 340, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="hidden lg:flex shrink-0 h-full overflow-hidden"
                >
                  <ScrollArea className="w-full h-full">
                    <ToolsSidebar
                      avatarState={avatarState}
                      avatarEnabled={true}
                      personaDescription={persona?.description || ""}
                      onPersonaChange={(d) => savePersona({ description: d })}
                      sessionId={chat.sessionId}
                      className="w-full h-full p-4"
                    />
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <GroundingExerciseModal
        open={showGroundingModal}
        onOpenChange={setShowGroundingModal}
      />
    </div>
  );
}
