"use client";

import { Button } from "@/components/ui/button";
import { Bot, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isRightSidebarOpen: boolean;
  setIsRightSidebarOpen: (open: boolean) => void;
  onNewSession: () => void;
}

export function ChatHeader({
  isSidebarOpen,
  setIsSidebarOpen,
  isRightSidebarOpen,
  setIsRightSidebarOpen,
  onNewSession,
}: ChatHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className={cn("hidden lg:flex rounded-xl transition-all hover:bg-primary/10", !isSidebarOpen && "text-primary")}
        >
          <Bot className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Therapy Space</h1>
          <p className="text-muted-foreground text-sm">A safe, private space for your thoughts.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)} 
          className={cn("hidden xl:flex rounded-full transition-all", isRightSidebarOpen && "bg-primary/10 border-primary/30")}
        >
          <Settings className="h-4 w-4 mr-2" />
          {isRightSidebarOpen ? "Hide Tools" : "Show Tools"}
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
          onClick={() => router.push("/dashboard/modules")} 
          className="rounded-full"
        >
          Finish Session
        </Button>
      </div>
    </div>
  );
}
