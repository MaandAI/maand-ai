import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChatSession } from "@/types/therapy";
import { 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Search, 
  Star, 
  StarOff,
  Filter,
  History
} from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useChatAPI } from "@/hooks/api/useChat";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  className?: string;
  onRefresh?: () => void;
}

export function ChatSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  className,
  onRefresh,
}: ChatSidebarProps) {
  const { renameSession, deleteSession, toggleFavorite } = useChatAPI();
  const { toast } = useToast();
  
  // UI State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "completed">("active");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Filtering Logic
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const matchesSearch = (s.title || "Untitled Session").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = s.status === statusFilter;
      const matchesFavorite = showFavoritesOnly ? s.isFavorite : true;
      return matchesSearch && matchesStatus && matchesFavorite;
    });
  }, [sessions, searchQuery, statusFilter, showFavoritesOnly]);

  const handleRename = async (id: string) => {
    if (!editTitle.trim()) return;
    try {
      await renameSession(id, editTitle.trim());
      setEditingId(null);
      onRefresh?.();
      toast({ title: "Session renamed" });
    } catch (e) {
      toast({ title: "Failed to rename", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    try {
      await deleteSession(id);
      onRefresh?.();
      toast({ title: "Session deleted" });
    } catch (e) {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, s: ChatSession) => {
    e.stopPropagation();
    try {
      await toggleFavorite(s.id, !s.isFavorite);
      onRefresh?.();
      toast({ 
        title: s.isFavorite ? "Removed from favorites" : "Added to favorites",
        description: s.title || "Session updated"
      });
    } catch (e) {
      toast({ title: "Failed to update favorite", variant: "destructive" });
    }
  };

  return (
    <Card
      className={cn(
        "flex flex-col w-72 border-none shadow-sm bg-card/40 backdrop-blur-xl shrink-0 overflow-hidden rounded-r-3xl border-r border-primary/5",
        className,
      )}
    >
      <CardHeader className="py-6 border-b border-primary/5 bg-primary/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm uppercase tracking-[0.2em] font-black text-foreground/80">
              Journal
            </CardTitle>
          </div>
          <Badge variant="outline" className="rounded-full bg-background/50 border-primary/10 px-2 py-0 h-5 text-[10px]">
            {sessions.length}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search sessions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 text-xs bg-background/50 border-primary/5 focus-visible:ring-primary/20 rounded-xl transition-all"
            />
          </div>

          <div className="flex p-1 bg-muted/30 rounded-xl gap-1">
            <button
              onClick={() => setStatusFilter("active")}
              className={cn(
                "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                statusFilter === "active" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:bg-background/50"
              )}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={cn(
                "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                statusFilter === "completed" ? "bg-background shadow-sm text-emerald-500" : "text-muted-foreground hover:bg-background/50"
              )}
            >
              Finished
            </button>
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-all flex items-center justify-center",
                showFavoritesOnly 
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm" 
                  : "text-muted-foreground hover:bg-background/50 border border-transparent"
              )}
              title={showFavoritesOnly ? "Showing Favorites Only" : "Show All"}
            >
              <Star className={cn("h-3.5 w-3.5", showFavoritesOnly ? "fill-amber-500" : "")} />
            </button>
          </div>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {filteredSessions.map((s) => (
            <div key={s.id} className="group relative">
              {editingId === s.id ? (
                <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl border border-primary/10">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="h-8 text-xs border-none bg-transparent focus-visible:ring-0"
                    autoFocus
                  />
                  <div className="flex gap-0.5">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-emerald-500 hover:bg-emerald-500/10"
                      onClick={() => handleRename(s.id)}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-rose-500 hover:bg-rose-500/10"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => onSelectSession(s.id)}
                  className={cn(
                    "group/item flex items-center gap-2 p-3 rounded-2xl text-sm transition-all cursor-pointer relative overflow-hidden",
                    currentSessionId === s.id
                      ? "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 scale-[1.02]"
                      : "hover:bg-primary/10 text-muted-foreground hover:text-foreground border border-transparent hover:border-primary/10",
                  )}
                >
                  {/* Active Indicator */}
                  {currentSessionId === s.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-foreground/30" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-xs tracking-tight">
                        {s.title || "Untitled Session"}
                      </div>
                      {s.isFavorite && (
                        <Star className={cn("h-3 w-3 shrink-0", currentSessionId === s.id ? "fill-primary-foreground" : "fill-amber-400 text-amber-400")} />
                      )}
                    </div>
                    <div
                      className={cn(
                        "text-[10px] mt-1 font-medium flex items-center gap-1",
                        currentSessionId === s.id
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground/60",
                      )}
                    >
                      {s.createdAt
                        ? new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                        : "Just now"}
                    </div>
                  </div>

                  <div className="flex items-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className={cn(
                        "h-8 w-8 rounded-full",
                        currentSessionId === s.id ? "hover:bg-primary-foreground/10 text-primary-foreground" : "hover:bg-primary/10 text-muted-foreground"
                      )}
                      onClick={(e) => handleToggleFavorite(e, s)}
                    >
                      <Star className={cn("h-4 w-4", s.isFavorite ? "fill-amber-400 text-amber-400" : "")} />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className={cn(
                            "h-8 w-8 rounded-full",
                            currentSessionId === s.id ? "hover:bg-primary-foreground/10 text-primary-foreground" : "hover:bg-primary/10 text-muted-foreground"
                          )}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-2xl border-primary/10 shadow-2xl">
                        <DropdownMenuItem
                          className="rounded-xl cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(s.id);
                            setEditTitle(s.title || "");
                          }}
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-2.5 text-blue-500" />
                          <span className="text-xs font-bold">Rename Session</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-primary/5 mx-1" />
                        <DropdownMenuItem
                          className="text-rose-500 rounded-xl cursor-pointer focus:bg-rose-500/10 focus:text-rose-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(s.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2.5" />
                          <span className="text-xs font-bold">Delete Session</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {filteredSessions.length === 0 && (
            <div className="py-20 text-center space-y-3">
              <div className="h-12 w-12 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
                <Search className="h-6 w-6 text-muted-foreground/30" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground">No matches found</p>
                <p className="text-[10px] text-muted-foreground/50 px-8">
                  Try adjusting your search or filters to find your session.
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
