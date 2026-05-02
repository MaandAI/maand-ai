"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Send, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  message: string;
  setMessage: (m: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isListening: boolean;
  toggleListening: () => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  disabled: boolean;
  isTyping: boolean;
  setUserIsTyping: (typing: boolean) => void;
}

export function ChatInput({
  message,
  setMessage,
  onSubmit,
  isListening,
  toggleListening,
  voiceEnabled,
  setVoiceEnabled,
  disabled,
  isTyping,
  setUserIsTyping,
}: ChatInputProps) {
  return (
    <div className="p-4 bg-card/50 backdrop-blur-xl border-t border-primary/10">
      <form onSubmit={onSubmit} className="flex gap-3 items-end">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(
            "rounded-2xl h-12 w-12 border-primary/20 transition-all",
            isListening && "bg-destructive text-destructive-foreground animate-pulse border-none"
          )}
          onClick={toggleListening}
          disabled={disabled}
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        <div className="flex-1 relative group">
          <Textarea
            placeholder="Type your message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setUserIsTyping(e.target.value.length > 0);
            }}
            className="min-h-[3rem] max-h-32 rounded-2xl border-primary/20 focus-visible:ring-primary/30 resize-none py-3 px-4 bg-background/50 group-hover:bg-background transition-colors"
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e as any);
              }
            }}
          />
        </div>
        <Button 
          type="submit" 
          size="icon" 
          className="rounded-2xl h-12 w-12 shadow-lg shadow-primary/20 transition-transform active:scale-95 bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={disabled || !message.trim() || isTyping}
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
      <div className="flex items-center justify-between mt-3 px-1">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-60">
          Secure AI Consultation
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-primary transition-colors"
          onClick={() => setVoiceEnabled(!voiceEnabled)}
        >
          {voiceEnabled ? <Volume2 className="h-3 w-3 mr-1" /> : <VolumeX className="h-3 w-3 mr-1" />}
          Voice {voiceEnabled ? "On" : "Off"}
        </Button>
      </div>
    </div>
  );
}
