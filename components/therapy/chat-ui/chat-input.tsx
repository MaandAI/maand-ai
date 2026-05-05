"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Send, Volume2, VolumeX, Loader2 } from "lucide-react";
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
    <div className="p-3 md:p-6 bg-card/40 backdrop-blur-2xl border-t border-primary/5">
      <form onSubmit={onSubmit} className="flex gap-2 md:gap-4 items-end max-w-4xl mx-auto">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(
            "rounded-2xl h-11 w-11 md:h-12 md:w-12 border-primary/10 transition-all shrink-0",
            isListening && "bg-destructive text-destructive-foreground animate-pulse border-none shadow-lg shadow-destructive/20"
          )}
          onClick={toggleListening}
          disabled={disabled}
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5 text-primary" />}
        </Button>
        <div className="flex-1 relative group bg-background/40 rounded-[1.5rem] border border-primary/10 transition-all focus-within:border-primary/30 focus-within:bg-background/60 shadow-sm">
          <Textarea
            placeholder="Share your thoughts..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setUserIsTyping(e.target.value.length > 0);
            }}
            className="min-h-[2.75rem] max-h-32 rounded-[1.5rem] border-none focus-visible:ring-0 resize-none py-3 px-4 bg-transparent group-hover:bg-transparent transition-colors text-sm"
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e as any);
              }
            }}
          />
          <div className="absolute right-2 bottom-1.5 flex items-center gap-1">
             <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-full text-muted-foreground transition-colors", voiceEnabled && "text-primary")}
              onClick={() => setVoiceEnabled(!voiceEnabled)}
            >
              {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <Button 
          type="submit" 
          size="icon" 
          className="rounded-2xl h-11 w-11 md:h-12 md:w-12 shadow-xl shadow-primary/10 transition-all active:scale-90 bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
          disabled={disabled || !message.trim() || isTyping}
        >
          {isTyping ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </form>
      <div className="flex items-center justify-center mt-3 opacity-40">
        <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground">
          Your conversation is private & secure
        </p>
      </div>
    </div>
  );
}
