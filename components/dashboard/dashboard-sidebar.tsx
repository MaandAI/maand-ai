"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Brain,
  User,
  Settings,
  Bell,
  CreditCard,
  Menu,
  MessageSquare,
  Bot,
  Glasses,
  Lock,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { useState } from "react";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Modules", href: "/dashboard/modules", icon: Brain },
  { name: "Chat Sessions", href: "/dashboard/sessions", icon: MessageSquare },
  { name: "Clinical Reports", href: "/dashboard/reports", icon: FileText },
  { name: "AI Therapy", href: "/dashboard/therapy/chat", icon: MessageSquare },
  { name: "Therapy Avatar", href: "/dashboard/avatar", icon: Bot },
  {
    name: "Immersive",
    href: "/dashboard/immersive",
    icon: Glasses,
    locked: true,
  },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

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

      <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto custom-scrollbar">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const isLocked = item.locked;

          if (isLocked) {
            return (
              <div
                key={item.name}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium cursor-not-allowed opacity-40",
                  "text-muted-foreground transition-all",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1">{item.name}</span>
                <Lock className="h-3.5 w-3.5 opacity-60" />
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary hover:translate-x-1",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground group-hover:text-primary",
                )}
              />
              <span className="flex-1">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="h-1.5 w-1.5 rounded-full bg-primary-foreground"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t bg-muted/5">
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 border border-primary/10">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            Current Plan
          </p>
          <p className="text-sm font-bold mb-2">Pro Individual</p>
          <div className="h-1.5 w-full bg-primary/20 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-2/3 rounded-full" />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            12 of 20 sessions used
          </p>
        </div>
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-72 border-r-0">
          <div className="h-full bg-background/95 backdrop-blur-xl border-r">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col border-r bg-card/50 backdrop-blur-sm sticky top-0 h-screen transition-all duration-300">
        <SidebarContent />
      </aside>

      {/* Global Mobile Trigger - Hidden on desktop */}
      <div className="lg:hidden fixed top-3 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setOpen(true)}
          className="bg-background/80 backdrop-blur shadow-sm border-primary/20 hover:border-primary/50 transition-all"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
}
