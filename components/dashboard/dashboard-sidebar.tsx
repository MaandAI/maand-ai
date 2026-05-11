"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Brain,
  User,
  Settings,
  CreditCard,
  Menu,
  MessageSquare,
  Bot,
  Glasses,
  Lock,
  FileText,
  History,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { useState } from "react";
import { useUserStore } from "@/lib/store/user-store";
import { getPersona } from "@/lib/therapist-personas";
import { EmergencyCalm } from "../therapy/emergency-calm";

const groups = [
  {
    title: "Main",
    items: [
      { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { name: "Modules", href: "/dashboard/modules", icon: Brain },
      { name: "Clinical Reports", href: "/dashboard/reports", icon: FileText },
    ],
  },
  {
    title: "Therapeutic",
    items: [
      {
        name: "AI Therapy Chat",
        href: "/dashboard/therapy/chat",
        icon: MessageSquare,
      },
      { name: "Video Session", href: "/dashboard/avatar", icon: Bot },
      { name: "Chat History", href: "/dashboard/sessions", icon: History },
      {
        name: "Immersive",
        href: "/dashboard/immersive",
        icon: Glasses,
        locked: true,
      },
    ],
  },
  {
    title: "Management",
    items: [
      { name: "Public Profile", href: "/dashboard/profile", icon: User },
      { name: "Account Settings", href: "/dashboard/settings", icon: Settings },
      { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
    ],
  },
];

function SidebarContent({
  onNavigate,
  onOpenCalm,
}: {
  onNavigate?: () => void;
  onOpenCalm: () => void;
}) {
  const pathname = usePathname();
  const { user } = useUserStore();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-6 bg-gradient-to-r from-primary/5 to-transparent">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl tracking-tight"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transform hover:scale-105 transition-transform">
            M
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Maand
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-8 p-4 overflow-y-auto custom-scrollbar">
        {/* Emergency Calm Mode Trigger */}
        <div className="px-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 rounded-2xl border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all group relative overflow-hidden"
            onClick={onOpenCalm}
          >
            <div className="absolute inset-0 bg-rose-500/10 group-hover:bg-transparent animate-pulse" />
            <ShieldAlert className="h-4 w-4 relative z-10" />
            <span className="font-black text-[10px] uppercase tracking-widest relative z-10">
              Emergency Calm
            </span>
          </Button>
        </div>

        {groups.map((group) => (
          <div key={group.title} className="space-y-3">
            <h3 className="px-4 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const isLocked = item.locked;

                if (isLocked) {
                  return (
                    <div
                      key={item.name}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-bold cursor-not-allowed opacity-30",
                        "text-muted-foreground transition-all",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1 truncate">{item.name}</span>
                      <Lock className="h-3 w-3" />
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-300",
                      isActive
                        ? "bg-primary text-white shadow-[0_8px_16px_-4px_rgba(var(--primary-rgb),0.3)] scale-[1.02]"
                        : "text-muted-foreground hover:bg-primary/5 hover:text-primary hover:translate-x-1",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 transition-transform duration-300 group-hover:scale-110",
                        isActive
                          ? "text-white"
                          : "text-muted-foreground/70 group-hover:text-primary",
                      )}
                    />
                    <span className="flex-1 truncate">{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className="h-1.5 w-1.5 rounded-full bg-white shadow-sm"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 pt-0">
        <div className="rounded-[2rem] bg-card border border-primary/10 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              Active Plan
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black capitalize">
              {user?.role || "Free"}
            </p>
            <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground">
              <span>Account Usage</span>
              <span className="text-primary">Syncing...</span>
            </div>
          </div>
          <div className="h-1.5 w-full bg-primary/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              className="h-full bg-primary/20 rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  const [open, setOpen] = useState(false);
  const [isCalmOpen, setIsCalmOpen] = useState(false);

  return (
    <>
      {/* Emergency Calm Portal */}
      <EmergencyCalm isOpen={isCalmOpen} onClose={() => setIsCalmOpen(false)} />

      {/* Mobile / tablet sheet sidebar — visible on < lg */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-72 border-r-0">
          <div className="h-full bg-background/95 backdrop-blur-xl">
            <SidebarContent
              onNavigate={() => setOpen(false)}
              onOpenCalm={() => {
                setIsCalmOpen(true);
                setOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile / tablet trigger button — hidden on lg+ where the inline sidebar takes over */}
      <div className="lg:hidden fixed top-3 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setOpen(true)}
          className="bg-background/80 backdrop-blur shadow-sm border-primary/20"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Desktop inline sidebar — only shown on lg+ */}
      <div className="hidden lg:flex flex-col h-full bg-card/50 backdrop-blur-sm">
        <SidebarContent onOpenCalm={() => setIsCalmOpen(true)} />
      </div>
    </>
  );
}
