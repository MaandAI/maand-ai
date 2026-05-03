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
}

export function ChatHeader({
  isSidebarOpen,
  setIsSidebarOpen,
  isRightSidebarOpen,
  setIsRightSidebarOpen,
  onNewSession,
  onCompleteSession,
  isCompleting = false,
}: ChatHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className={cn("rounded-xl transition-all hover:bg-primary/10 px-2", !isSidebarOpen && "text-primary")}
        >
          <Bot className="h-5 w-5 mr-1" />
          <span className="text-xs font-bold md:hidden">History</span>
        </Button>
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight">Therapy Space</h1>
          <p className="text-muted-foreground text-[10px] md:text-sm">A safe, private space for your thoughts.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)} 
          className={cn("rounded-full transition-all px-3", isRightSidebarOpen && "bg-primary/10 border-primary/30")}
        >
          <Settings className="h-4 w-4 mr-1 md:mr-2" />
          <span className="text-xs font-bold md:hidden">Tools</span>
          <span className="hidden md:inline">{isRightSidebarOpen ? "Hide Tools" : "Show Tools"}</span>
        </Button>
        <Button 
          size="sm" 
          onClick={onNewSession} 
          className="rounded-full shadow-md shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Session
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={onCompleteSession} 
          className="rounded-full"
          disabled={isCompleting}
        >
          {isCompleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          {isCompleting ? "Generating Report..." : "Finish Session"}
        </Button>
      </div>
    </div>
  );
}
