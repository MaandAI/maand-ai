import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/backend/middlewares/auth.middleware";
import { NotificationsService } from "@/backend/services/notifications.service";

export async function GET(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    try {
      const notifications = await NotificationsService.getUserNotifications(
        user.uid,
      );
      return NextResponse.json({ success: true, data: notifications });
    } catch (error: any) {
      console.error("Notifications API Error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  });
}

export async function PATCH(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    try {
      const body = await req.json();
      const { notificationId } = body;

      if (!notificationId) {
        return NextResponse.json(
          { error: "notificationId is required" },
          { status: 400 },
        );
      }

      await NotificationsService.markAsRead(user.uid, notificationId);
      return NextResponse.json({ success: true });
    } catch (error: any) {
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  });
}
