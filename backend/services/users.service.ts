import { adminDb } from "../config/firebase-admin";

export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  name: string;
  displayName?: string;
  avatar?: string;
  role: "user" | "admin" | "therapist";
  status: "active" | "inactive" | "suspended";
  subscription: "free" | "basic" | "pro" | "enterprise";
  lastActive?: Date;
  createdAt: Date;
}

export class UsersService {
  static async getAllUsers(): Promise<UserProfile[]> {
    const snapshot = await adminDb
      .collection("users")
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        name: data.displayName || data.name || "Unknown User",
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate()
          : new Date(),
        lastActive: data.lastActive?.toDate
          ? data.lastActive.toDate()
          : new Date(),
      } as UserProfile;
    });
  }
}
