import dbConnect from "@/lib/mongodb";
import Notification from "@/models/Notification";

export class NotificationService {
  static async create({
    userId,
    type,
    title,
    message,
    link,
    metadata
  }: {
    userId: string;
    type: "info" | "success" | "warning" | "error" | "session" | "report" | "security";
    title: string;
    message: string;
    link?: string;
    metadata?: any;
  }) {
    try {
      await dbConnect();
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        link,
        metadata
      });
      return notification;
    } catch (error) {
      console.error("Failed to create notification:", error);
      return null;
    }
  }

  static async notifySessionCompleted(userId: string, sessionId: string) {
    return this.create({
      userId,
      type: "session",
      title: "Session Completed",
      message: "Your therapy session has ended. A clinical report is being generated.",
      link: `/dashboard/therapy/chat?id=${sessionId}`,
    });
  }

  static async notifyReportGenerated(userId: string, reportId: string) {
    return this.create({
      userId,
      type: "report",
      title: "New Report Available",
      message: "Your clinical session report has been generated and is ready for review.",
      link: `/dashboard/reports?id=${reportId}`,
    });
  }

  static async notifySecurityAlert(userId: string, action: string) {
    return this.create({
      userId,
      type: "security",
      title: "Security Alert",
      message: `Your account security settings were updated: ${action}.`,
      link: "/dashboard/settings?tab=security",
    });
  }
}
