"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Message } from "@/types/therapy";

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  formatTime: (date: Date) => string;
}

export function MessageList({ messages, isTyping, formatTime }: MessageListProps) {
  return (
    <div className="space-y-6">
      <AnimatePresence initial={false}>
        {messages.map((msg, index) => (
          <motion.div
            key={msg.id || index}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "flex gap-3",
              msg.sender === "user" && "flex-row-reverse"
            )}
          >
            <Avatar className="h-9 w-9 ring-2 ring-background border border-primary/10 shadow-sm">
              <AvatarFallback className={cn(
                msg.sender === "ai" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              )}>
                {msg.sender === "ai" ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
            <div className={cn(
              "max-w-[75%] space-y-1",
              msg.sender === "user" && "flex flex-col items-end"
            )}>
              <div className={cn(
                "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                msg.sender === "ai" 
                  ? "bg-card border border-primary/10 text-foreground rounded-tl-none" 
                  : "bg-primary text-primary-foreground rounded-tr-none"
              )}>
                {msg.content}
              </div>
              <span className="text-[10px] text-muted-foreground px-1 font-medium">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {isTyping && (
        <div className="flex gap-3">
          <Avatar className="h-9 w-9 bg-primary/10 text-primary border border-primary/20">
            <Bot className="h-5 w-5" />
          </Avatar>
          <div className="bg-card border border-primary/10 rounded-2xl rounded-tl-none px-4 py-3 w-16 shadow-sm">
            <div className="flex gap-1 justify-center">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 bg-primary/40 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
