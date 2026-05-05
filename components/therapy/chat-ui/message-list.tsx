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
    <div className="space-y-8 py-4">
      <AnimatePresence initial={false}>
        {messages.map((msg, index) => (
          <motion.div
            key={msg.id || index}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "flex gap-4 group",
              msg.sender === "user" && "flex-row-reverse"
            )}
          >
            <div className="shrink-0 flex flex-col justify-end">
              <Avatar className={cn(
                "h-8 w-8 ring-2 ring-background border border-primary/10 shadow-sm transition-transform group-hover:scale-110",
                msg.sender === "ai" && "bg-primary/5"
              )}>
                <AvatarFallback className={cn(
                  "text-[10px] font-bold",
                  msg.sender === "ai" ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"
                )}>
                  {msg.sender === "ai" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className={cn(
              "max-w-[85%] md:max-w-[70%] space-y-1.5",
              msg.sender === "user" && "flex flex-col items-end"
            )}>
              <div className={cn(
                "rounded-[1.5rem] px-5 py-3.5 text-sm leading-relaxed shadow-sm transition-all",
                msg.sender === "ai" 
                  ? "bg-card/80 border border-primary/5 text-foreground rounded-bl-none hover:shadow-md" 
                  : "bg-primary text-primary-foreground rounded-br-none shadow-primary/10 hover:shadow-lg hover:shadow-primary/20"
              )}>
                {msg.content}
              </div>
              <div className="flex items-center gap-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-tighter">
                  {msg.sender === "ai" ? "Therapist" : "You"}
                </span>
                <span className="text-[10px] text-muted-foreground/50">•</span>
                <span className="text-[10px] text-muted-foreground/50 font-medium">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {isTyping && (
        <div className="flex gap-4 items-end">
          <Avatar className="h-8 w-8 bg-primary/5 text-primary border border-primary/10 ring-2 ring-background">
             <AvatarFallback className="bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
             </AvatarFallback>
          </Avatar>
          <div className="bg-card/80 border border-primary/5 rounded-[1.5rem] rounded-bl-none px-5 py-3.5 w-20 shadow-sm">
            <div className="flex gap-1.5 justify-center">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 bg-primary/30 rounded-full"
                  animate={{ y: [0, -4, 0], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
