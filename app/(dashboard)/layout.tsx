import type React from "react";
// Dashboard layout with sidebar navigation
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { SessionWatcher } from "@/components/auth/session-watcher";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <SessionWatcher />
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
