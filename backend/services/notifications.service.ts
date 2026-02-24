import { adminDb } from "../config/firebase-admin";
import { Notification } from "../validators/notifications.schema";

export class NotificationsService {
  static async getUserNotifications(userId: string): Promise<Notification[]> {
    const snapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("notifications")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Notification,
    );
  }

  static async markAsRead(userId: string, notificationId: string) {
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("notifications")
      .doc(notificationId)
      .update({ read: true });
  }

  static async createNotification(
    userId: string,
    data: Omit<Notification, "id" | "userId" | "createdAt">,
  ) {
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("notifications")
      .add({
        ...data,
        userId,
        createdAt: new Date(),
        read: false,
      });
  }
}
