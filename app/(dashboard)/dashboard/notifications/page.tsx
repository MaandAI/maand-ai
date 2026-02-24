"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotificationsAPI } from "@/hooks/api/useNotifications";
import { Skeleton } from "@/components/ui/skeleton";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { getTimeAgo } from "@/lib/utils/date";
import { Bell, CheckCheck } from "lucide-react";

function NotificationsContent() {
  const { notifications, loading, markAsRead } = useNotificationsAPI();

  const handleMarkAllRead = () => {
    notifications
      .filter((n) => !n.read)
      .forEach((n) => {
        markAsRead(n.id!);
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your latest activities
          </p>
        </div>
        <Button variant="outline" onClick={handleMarkAllRead}>
          <CheckCheck className="mr-2 h-4 w-4" />
          Mark All Read
        </Button>
      </div>

      <div className="space-y-4">
        {loading
          ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)
          : notifications.map((notification) => (
              <Card
                key={notification.id}
                className={notification.read ? "opacity-60" : ""}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          notification.type === "success"
                            ? "bg-green-100 dark:bg-green-900"
                            : notification.type === "warning"
                              ? "bg-yellow-100 dark:bg-yellow-900"
                              : notification.type === "error"
                                ? "bg-red-100 dark:bg-red-900"
                                : "bg-blue-100 dark:bg-blue-900"
                        }`}
                      >
                        <Bell className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          {notification.title}
                        </CardTitle>
                        <CardDescription>
                          {notification.message}
                        </CardDescription>
                        <p className="text-xs text-muted-foreground">
                          {getTimeAgo(
                            notification.createdAt
                              ? new Date(notification.createdAt)
                              : new Date(),
                          )}
                        </p>
                      </div>
                    </div>
                    {!notification.read && <Badge variant="default">New</Badge>}
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id!)}
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
      </div>

      {!loading && notifications.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No notifications yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsContent />
    </ProtectedRoute>
  );
}
