"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  FileText, 
  MessageSquare,
  MoreVertical,
  X
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuHeader,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "next-auth/react";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export function NotificationCenter() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.data.filter((n: Notification) => !n.isRead).length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  }, [session]);

  useEffect(() => {
    fetchNotifications();
    // Simple polling for "real-time" updates
    const interval = setInterval(fetchNotifications, 30000); // 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      setNotifications(prev => prev.filter(n => n._id !== id));
      const wasUnread = notifications.find(n => n._id === id && !n.isRead);
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "error": return <ShieldAlert className="h-4 w-4 text-rose-500" />;
      case "report": return <FileText className="h-4 w-4 text-primary" />;
      case "session": return <MessageSquare className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-primary/10 transition-colors">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-rose-500 border-2 border-background text-[10px] font-black animate-in zoom-in"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0 border-primary/10 shadow-2xl rounded-3xl overflow-hidden bg-card/95 backdrop-blur-xl">
        <div className="flex items-center justify-between p-4 border-b border-primary/5 bg-primary/5">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm tracking-tight">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] font-bold">
                {unreadCount} New
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10"
            onClick={markAllAsRead}
          >
            <CheckCheck className="h-3 w-3 mr-1.5" />
            Mark all read
          </Button>
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length > 0 ? (
            <div className="divide-y divide-primary/5">
              {notifications.map((n) => (
                <div 
                  key={n._id}
                  onClick={() => markAsRead(n._id)}
                  className={cn(
                    "p-4 flex gap-4 hover:bg-primary/5 transition-colors cursor-pointer relative group",
                    !n.isRead && "bg-primary/5"
                  )}
                >
                  <div className="shrink-0 mt-1">
                    <div className="h-9 w-9 rounded-xl bg-background flex items-center justify-center shadow-sm">
                      {getIcon(n.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-xs font-bold truncate", n.isRead ? "text-foreground/70" : "text-foreground")}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap mt-0.5">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-rose-500 hover:bg-rose-50"
                    onClick={(e) => deleteNotification(n._id, e)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  {!n.isRead && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="h-16 w-16 bg-muted/20 rounded-full flex items-center justify-center">
                <Bell className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-muted-foreground">All caught up!</p>
                <p className="text-xs text-muted-foreground/50">You don't have any unread notifications.</p>
              </div>
            </div>
          )}
        </ScrollArea>
        
        <div className="p-3 border-t border-primary/5 bg-muted/10 text-center">
          <Button variant="ghost" size="sm" className="w-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest h-8 rounded-xl">
            View All Activity
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
