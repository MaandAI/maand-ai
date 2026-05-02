"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChatSession } from "../types";

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
}

export function ChatSidebar({ sessions, currentSessionId, onSelectSession }: ChatSidebarProps) {
  return (
    <Card className="hidden lg:flex flex-col w-56 border-none shadow-sm bg-card/50 backdrop-blur-sm shrink-0">
      <CardHeader className="py-4 border-b">
        <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground font-bold">Past Sessions</CardTitle>
      </CardHeader>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectSession(s.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-xl text-sm transition-all",
                currentSessionId === s.id 
                  ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/10" 
                  : "hover:bg-primary/5 text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="truncate">{s.title || "Untitled Session"}</div>
              <div className={cn("text-[10px] mt-0.5 opacity-70", currentSessionId === s.id ? "text-primary-foreground" : "text-muted-foreground")}>
                {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "Just now"}
              </div>
            </button>
          ))}
          {sessions.length === 0 && (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No sessions yet.
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
