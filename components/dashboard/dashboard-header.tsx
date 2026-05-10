"use client";

import { Bell, LogOut, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useRouter, usePathname } from "next/navigation";
import { useUserStore } from "@/lib/store/user-store";
import { Badge } from "@/components/ui/badge";
import { signOut } from "next-auth/react";
import { NotificationCenter } from "@/components/dashboard/notification-center";

export function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUserStore();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const getPageTitle = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length <= 1) return "Dashboard";

    // /dashboard/modules/[slug]  → "Modules"
    // /dashboard/modules/[slug]/stage/[id] → "Active Stage"
    if (parts.includes("modules")) {
      const moduleIdx = parts.indexOf("modules");
      if (parts.includes("stage")) return "Active Stage";
      if (parts.length > moduleIdx + 1) return "Modules";
      return "Modules";
    }

    const last = parts[parts.length - 1];
    // Convert kebab-case slugs and capitalise
    return last
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <header className="shrink-0 z-40 border-b bg-background/80 backdrop-blur-md transition-all duration-200">
      <div className="flex h-16 items-center justify-between px-6 md:px-8">
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col">
            <h2 className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">
              Workspace / {getPageTitle()}
            </h2>
            <h1 className="text-xl font-black tracking-tighter">
              {getPageTitle()}
            </h1>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-muted/40 rounded-xl border border-primary/5 w-64 group hover:border-primary/20 transition-all cursor-text">
            <svg
              className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
              Search Journal...
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 pr-4 border-r border-primary/5">
            <ThemeToggle />
            <NotificationCenter />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="gap-3 px-1 hover:bg-transparent transition-all group"
              >
                <div className="hidden md:flex flex-col items-end text-right">
                  <span className="text-xs font-black group-hover:text-primary transition-colors">
                    {user?.name || "User"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                      Professional
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <Avatar className="h-9 w-9 ring-2 ring-background border border-primary/10 group-hover:ring-primary/20 transition-all shadow-sm">
                    <AvatarImage
                      src={user?.image || "/placeholder.svg"}
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback className="bg-primary text-white font-black text-xs">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background shadow-sm" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push("/dashboard/profile")}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push("/dashboard/settings")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              {user?.role === "admin" && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push("/admin")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Switch to Admin View
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
