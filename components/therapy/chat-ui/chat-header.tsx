"use client";

import { Button } from "@/components/ui/button";
import { Bot, Plus, Settings, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isRightSidebarOpen: boolean;
  setIsRightSidebarOpen: (open: boolean) => void;
  onNewSession: () => void;
  onCompleteSession: () => void;
  isCompleting?: boolean;
  sessionStatus?: "active" | "completed";
}

export function ChatHeader({
  isSidebarOpen,
  setIsSidebarOpen,
  isRightSidebarOpen,
  setIsRightSidebarOpen,
  onNewSession,
  onCompleteSession,
  isCompleting = false,
  sessionStatus = "active",
}: ChatHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between shrink-0 px-1">
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className={cn("rounded-full transition-all hover:bg-primary/10", isSidebarOpen && "text-primary bg-primary/5")}
        >
          <Bot className="h-5 w-5" />
        </Button>
        <div className="hidden sm:block">
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Therapy Space</h1>
          <p className="text-muted-foreground text-[10px]">Your private reflection sanctuary</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 mr-2">
           <Button 
            size="sm" 
            variant="ghost"
            onClick={onNewSession} 
            className="rounded-full text-xs font-semibold hover:bg-primary/5"
          >
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onCompleteSession} 
            className="rounded-full text-xs font-semibold border-primary/20 hover:bg-primary/5"
            disabled={isCompleting || sessionStatus === "completed"}
          >
            {isCompleting ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : null}
            {sessionStatus === "completed" ? "Session Ended" : "Finish Session"}
          </Button>
        </div>

        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)} 
          className={cn("rounded-full transition-all border-primary/10", isRightSidebarOpen && "bg-primary/10 border-primary/30")}
        >
          <Settings className="h-4 w-4" />
        </Button>

        <div className="md:hidden flex gap-1">
           <Button 
            size="icon" 
            variant="ghost"
            onClick={onNewSession} 
            className="rounded-full"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
