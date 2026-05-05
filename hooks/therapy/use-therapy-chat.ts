"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useChatAPI } from "@/hooks/api/useChat";
import { usePersonaProfile } from "@/hooks/use-persona-profile";
import { useToast } from "@/hooks/use-toast";
import { detectCrisisKeywords } from "@/lib/mock/crisis-detection";
import { Message, ChatSession } from "@/types/therapy";
import { Mood } from "@/lib/mock/therapy";

export function useTherapyChat() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const querySessionId = searchParams.get("sessionId");

  const [sessionId, setSessionId] = useState<string | null>(querySessionId);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [showMoodCheckIn, setShowMoodCheckIn] = useState(!querySessionId);

  const {
    getSessions,
    getSessionHistory,
    createSession: apiCreateSession,
    loading: apiLoading,
  } = useChatAPI();
  const { persona } = usePersonaProfile();

  // Load Sessions
  const loadSessions = useCallback(async () => {
    try {
      const data = await getSessions();
      setSessions(data);
    } catch (e) {
      console.error("Failed to load sessions", e);
    }
  }, [getSessions]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Load History
  useEffect(() => {
    if (sessionId && sessionId !== "null") {
      const isNewSessionInUI =
        messages.some((m) => m.id === "welcome") || messages.length === 0;
      if (isNewSessionInUI) {
        getSessionHistory(sessionId)
          .then((history) => {
            if (history.length > 0) {
              const formattedHistory = history.map((m: any) => ({
                id: m.id,
                content: m.content,
                sender: m.sender,
                timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
              }));
              setMessages(formattedHistory);
            }
          })
          .catch(console.error);
      }
    } else {
      const welcomeContent = moduleParam
        ? `Hello! I'm your AI therapy assistant. I see you're starting the "${moduleParam}" module. I'm here to support you through these exercises. How are you feeling as we begin this focus today?`
        : "Hello! I'm your AI therapy assistant. I'm here to provide a supportive space for you to explore your thoughts and feelings. How are you feeling today?";

      setMessages([
        {
          id: "welcome",
          content: welcomeContent,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    }
  }, [sessionId, getSessionHistory]);

  const [message, setMessage] = useState("");

  const handleNewSession = useCallback(async () => {
    try {
      const newId = await apiCreateSession(persona);
      setSessionId(newId);
      setMessages([]);
      setMessage("");
      setShowMoodCheckIn(true);
      setShowCrisisAlert(false);
      toast({
        title: "New Session Started",
        description: "Let's begin with a quick mood check-in.",
      });
      router.push(`/dashboard/therapy/chat?sessionId=${newId}`);
      loadSessions();
    } catch (e) {
      // Fallback to lazy creation if API fails
      setSessionId(null);
      setMessages([]);
      setMessage("");
      setShowMoodCheckIn(true);
      router.push("/dashboard/therapy/chat");
    }
  }, [router, toast, apiCreateSession, persona, loadSessions]);

  const handleSelectSession = useCallback(
    (id: string) => {
      setMessages([]);
      setMessage("");
      setSessionId(id);
      setShowMoodCheckIn(false);
      router.push(`/dashboard/therapy/chat?sessionId=${id}`);
    },
    [router],
  );

  const moduleParam = searchParams.get("module");

  const sendMessage = useCallback(
    async (content: string, onSuccess?: (aiResponse: string) => void) => {
      const textToSubmit = content || message;
      if (!textToSubmit.trim()) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        content: textToSubmit.trim(),
        sender: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setMessage("");

      if (detectCrisisKeywords(userMessage.content)) {
        setShowCrisisAlert(true);
      }

      setIsTyping(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage.content,
            persona,
            sessionId: sessionId === "null" ? null : sessionId,
            module: moduleParam,
          }),
        });

        let data;
        try {
          data = await res.json();
        } catch (parseError) {
          throw new Error("The server encountered an unexpected error. Please try again.");
        }

        if (!res.ok) throw new Error(data.error || "Failed to get AI response");

        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response || "I'm here with you. Tell me more.",
          sender: "ai",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiResponse]);

        if (data.sessionId && (!sessionId || sessionId === "null")) {
          setSessionId(data.sessionId);
          router.push(`/dashboard/therapy/chat?sessionId=${data.sessionId}`, {
            scroll: false,
          });
          loadSessions();
        }

        if (data.isCrisis) setShowCrisisAlert(true);
        onSuccess?.(aiResponse.content);
      } catch (e: any) {
        console.error("Chat Error:", e);
        toast({
          title: "Message failed",
          description: e.message || "I'm having trouble connecting right now. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsTyping(false);
      }
    },
    [persona, sessionId, router, loadSessions, message, toast],
  );

  const completeSession = useCallback(
    async (id?: string) => {
      const activeId = id || sessionId;
      console.log("Active ID", activeId);
      if (!activeId || activeId === "null") {
        toast({
          title: "Cannot Finish Session",
          description:
            "Please start a conversation before finishing the session.",
          variant: "destructive",
        });
        return;
      }

      if (isCompleting) return;

      setIsCompleting(true);
      toast({
        title: "Generating Report",
        description: "Please wait while we analyze your session...",
      });

      try {
        const res = await fetch(`/api/chat/${activeId}/complete`, {
          method: "POST",
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to generate report");
        }

        toast({
          title: "Session Completed",
          description: "Your structured report has been generated and saved.",
        });

        router.push("/dashboard/modules");
      } catch (e: any) {
        console.error("Complete Session Error:", e);
        toast({
          title: "Completion Error",
          description: e.message || "We couldn't finalize the session report.",
          variant: "destructive",
        });
      } finally {
        setIsCompleting(false);
      }
    },
    [router, toast, isCompleting, sessionId],
  );

  const addAIMessage = useCallback((content: string) => {
    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      content,
      sender: "ai",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMessage]);
  }, []);

  return {
    sessionId,
    sessions,
    messages,
    isTyping,
    isCompleting,
    showCrisisAlert,
    setShowCrisisAlert,
    showMoodCheckIn,
    setShowMoodCheckIn,
    handleNewSession,
    handleSelectSession,
    message,
    setMessage,
    sendMessage,
    completeSession,
    addAIMessage,
    loadSessions,
    apiLoading,
  };
}
