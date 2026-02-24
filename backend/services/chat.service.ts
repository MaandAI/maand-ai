import { adminDb } from "../config/firebase-admin";
import { encryptData, decryptData } from "@/utils/encryption";
import { detectCrisis } from "../utils/crisis-detector";
import { ChatSession, ChatMessage } from "../validators/chat.schema";
import { FieldValue } from "firebase-admin/firestore";

export class ChatService {
  static async createSession(userId: string, persona: any): Promise<string> {
    const sessionRef = await adminDb
      .collection("users")
      .doc(userId)
      .collection("chat_sessions")
      .add({
        userId,
        persona,
        durationMs: 0,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

    return sessionRef.id;
  }

  static async getSessions(userId: string): Promise<ChatSession[]> {
    const snapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("chat_sessions")
      .orderBy("updatedAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChatSession[];
  }

  static async saveMessage(userId: string, data: any) {
    const { sessionId, content, sender, emotion } = data;

    // 1. Integration Point: Crisis Detection Logic (Server Side)
    const isCrisis = sender === "user" ? detectCrisis(content) : false;

    // 2. Encrypt sensitive data
    const safeContent = encryptData(content);

    const messageData = {
      sessionId,
      content: safeContent, // Secure string
      sender,
      emotion: emotion || null,
      isCrisis,
      timestamp: FieldValue.serverTimestamp(), // Guaranteed chronological scale
    };

    // 3. Save to highly normalized Subcollection
    const msgRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("chat_sessions")
      .doc(sessionId)
      .collection("messages")
      .doc();

    await msgRef.set(messageData);

    // Update session Last Activity TS
    await adminDb
      .collection("users")
      .doc(userId)
      .collection("chat_sessions")
      .doc(sessionId)
      .update({
        updatedAt: FieldValue.serverTimestamp(),
      });

    // 4. Aggregations (e.g. tracking crisis hits for analytics)
    if (isCrisis) {
      await adminDb
        .collection("analytics")
        .doc("crisis_alerts")
        .collection(new Date().toISOString().split("T")[0])
        .add({
          userId,
          sessionId,
          messageId: msgRef.id,
          timestamp: FieldValue.serverTimestamp(),
        });
    }

    // Return unencrypted strictly for local client response
    return { id: msgRef.id, ...messageData, content, timestamp: new Date() };
  }

  static async getSessionHistory(
    userId: string,
    sessionId: string,
  ): Promise<ChatMessage[]> {
    const snapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("chat_sessions")
      .doc(sessionId)
      .collection("messages")
      .orderBy("timestamp", "asc")
      .limit(50) // Prevent memory over-reading on large histories
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        content: data.content ? decryptData(data.content) : "", // Decrypt on read
      };
    }) as ChatMessage[];
  }
}
