import dbConnect from "@/lib/mongodb";
import NotificationModel from "@/models/Notification";
import { Notification as INotification } from "../validators/notifications.schema";

export class NotificationsService {
  static async getUserNotifications(userId: string): Promise<INotification[]> {
    await dbConnect();
    const notifications = await NotificationModel.find({ userId }).sort({ createdAt: -1 }).limit(50);

    return notifications.map(
      (doc) => ({ 
        id: doc._id.toString(),
        userId: doc.userId,
        title: doc.title,
        message: doc.message,
        type: doc.type,
        read: doc.read,
        createdAt: doc.createdAt,
      } as INotification),
    );
  }

  static async markAsRead(userId: string, notificationId: string) {
    await dbConnect();
    await NotificationModel.findByIdAndUpdate(notificationId, { read: true });
  }

  static async createNotification(
    userId: string,
    data: Omit<INotification, "id" | "userId" | "createdAt">,
  ) {
    await dbConnect();
    await NotificationModel.create({
      ...data,
      userId,
      read: false,
    });
  }
}
