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
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { signOut } from "next-auth/react";

export function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useAuth();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const getPageTitle = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length <= 1) return "Dashboard";
    return (
      parts[parts.length - 1].charAt(0).toUpperCase() +
      parts[parts.length - 1].slice(1)
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-all duration-200">
      <div className="flex h-16 items-center justify-between px-6 md:px-8">
        <div className="flex items-center gap-4">
          {/* Mobile menu trigger is handled in Sidebar component for better state management */}
          <div className="hidden md:flex flex-col">
            <h2 className="text-sm font-medium text-muted-foreground/60 uppercase tracking-wider text-[10px]">
              Maand / Home
            </h2>
            <h1 className="text-xl font-bold tracking-tight">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-primary/10 transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 mt-2 p-2">
              <DropdownMenuLabel className="px-2 pb-2">
                Notifications
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-4 text-center">
                <div className="bg-muted/50 rounded-full h-10 w-10 flex items-center justify-center mx-auto mb-2 text-muted-foreground">
                  <Bell className="h-5 w-5" />
                </div>
                <p className="text-sm text-muted-foreground">
                  You're all caught up!
                </p>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="gap-2 px-1 hover:bg-primary/10 transition-colors"
              >
                <div className="relative">
                  <Avatar className="h-8 w-8 ring-2 ring-background border border-primary/20">
                    <AvatarImage
                      src={profile?.photoURL || "/placeholder.svg"}
                      alt={profile?.displayName || "User"}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {profile?.displayName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
                </div>
                <div className="hidden md:flex flex-col items-start text-xs">
                  <span className="font-semibold">
                    {profile?.displayName || "User"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Standard Plan
                  </span>
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
              {profile?.role === "admin" && (
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
