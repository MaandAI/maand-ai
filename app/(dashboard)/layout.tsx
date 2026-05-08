import type React from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { SessionWatcher } from "@/components/auth/session-watcher";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /*
      Layout strategy to eliminate CLS:
      - Sidebar has a fixed width declared at each breakpoint
      - Content area uses overflow-y-auto so only the content scrolls
      - The outer flex never changes width
    */
    <div className="flex h-screen overflow-hidden bg-background">
      <SessionWatcher />

      {/* Sidebar — rigid, never reflows */}
      <div className="hidden md:flex md:flex-col md:w-64 shrink-0 border-r border-border/50">
        <DashboardSidebar />
      </div>

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardHeader />

        {/* Scrollable content — isolated from sidebar */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 lg:p-10 max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
