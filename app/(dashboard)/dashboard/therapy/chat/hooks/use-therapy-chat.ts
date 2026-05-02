"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useChatAPI } from "@/hooks/api/useChat";
import { usePersonaProfile } from "@/hooks/use-persona-profile";
import { detectCrisisKeywords } from "@/lib/mock/crisis-detection";
import { Message, ChatSession } from "../types";
import { Mood } from "@/lib/mock/therapy";

export function useTherapyChat() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const querySessionId = searchParams.get("sessionId");

  const [sessionId, setSessionId] = useState<string | null>(querySessionId);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [showMoodCheckIn, setShowMoodCheckIn] = useState(!querySessionId);
  
  const { getSessions, getSessionHistory, loading: apiLoading } = useChatAPI();
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
    if (sessionId) {
      const isNewSessionInUI = messages.some(m => m.id === "welcome") || messages.length === 0;
      if (isNewSessionInUI) {
        getSessionHistory(sessionId).then((history) => {
          if (history.length > 0) {
            const formattedHistory = history.map((m: any) => ({
              id: m.id,
              content: m.content,
              sender: m.sender,
              timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
            }));
            setMessages(formattedHistory);
          }
        }).catch(console.error);
      }
    } else {
      setMessages([
        {
          id: "welcome",
          content: "Hello! I'm your AI therapy assistant. I'm here to provide a supportive space for you to explore your thoughts and feelings. How are you feeling today?",
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    }
  }, [sessionId, getSessionHistory]);

  const [message, setMessage] = useState("");

  const handleNewSession = useCallback(() => {
    setSessionId(null);
    setMessages([]);
    setMessage("");
    setShowMoodCheckIn(true);
    router.push("/dashboard/therapy/chat");
  }, [router]);

  const handleSelectSession = useCallback((id: string) => {
    setMessages([]);
    setMessage("");
    setSessionId(id);
    setShowMoodCheckIn(false);
    router.push(`/dashboard/therapy/chat?sessionId=${id}`);
  }, [router]);

  const sendMessage = useCallback(async (content: string, onSuccess?: (aiResponse: string) => void) => {
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
          sessionId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || "I'm here with you. Tell me more.",
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
        router.push(`/dashboard/therapy/chat?sessionId=${data.sessionId}`, { scroll: false });
        loadSessions();
      }

      if (data.isCrisis) setShowCrisisAlert(true);
      onSuccess?.(aiResponse.content);
      
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  }, [persona, sessionId, router, loadSessions]);

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
    showCrisisAlert,
    setShowCrisisAlert,
    showMoodCheckIn,
    setShowMoodCheckIn,
    handleNewSession,
    handleSelectSession,
    message,
    setMessage,
    sendMessage,
    addAIMessage,
    apiLoading,
  };
}
