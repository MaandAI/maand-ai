import dbConnect from "@/lib/mongodb";
import ChatSession from "@/models/ChatSession";
import Message from "@/models/Message";
import { encryptData, decryptData } from "@/utils/encryption";
import { detectCrisis } from "../utils/crisis-detector";
import { ChatSession as IChatSession, ChatMessage } from "../validators/chat.schema";

export class ChatService {
  static async createSession(userId: string, persona: any, title?: string): Promise<string> {
    await dbConnect();
    const session = await ChatSession.create({
      userId,
      persona,
      title: title || `Therapy Session ${new Date().toLocaleDateString()}`,
      durationMs: 0,
    });

    return session._id.toString();
  }

  static async getSessions(userId: string): Promise<IChatSession[]> {
    await dbConnect();
    const sessions = await ChatSession.find({ userId }).sort({ updatedAt: -1 });

    return sessions.map((doc) => ({
      id: doc._id.toString(),
      userId: doc.userId,
      title: (doc as any).title,
      persona: doc.persona,
      durationMs: doc.durationMs,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    })) as any[];
  }

  static async saveMessage(userId: string, data: any) {
    await dbConnect();
    const { sessionId, content, sender, emotion } = data;

    const isCrisis = sender === "user" ? detectCrisis(content) : false;
    const safeContent = encryptData(content);

    console.log(`Creating message in DB for session ${sessionId}, sender ${sender}...`);
    const message = await Message.create({
      sessionId,
      content: safeContent,
      sender,
      emotion: emotion || null,
    });
    console.log(`Message created with ID: ${message._id}`);

    await ChatSession.findByIdAndUpdate(sessionId, {
      updatedAt: new Date(),
    });

    // Return unencrypted strictly for local client response
    return { 
      id: message._id.toString(), 
      sessionId,
      content, 
      sender,
      emotion: emotion || null,
      isCrisis,
      timestamp: (message as any).createdAt 
    };
  }

  static async getSessionHistory(
    userId: string,
    sessionId: string,
  ): Promise<ChatMessage[]> {
    await dbConnect();
    console.log(`Fetching history for session: ${sessionId}`);
    const messages = await Message.find({ sessionId }).sort({ createdAt: 1 }).limit(50);
    console.log(`Found ${messages.length} messages for session ${sessionId}`);
    messages.forEach(m => console.log(` - [${m.sender}] ${m.content.substring(0, 20)}...`));

    return messages.map((doc) => {
      return {
        id: doc._id.toString(),
        sessionId: doc.sessionId,
        sender: doc.sender,
        emotion: doc.emotion,
        timestamp: (doc as any).createdAt,
        content: doc.content ? decryptData(doc.content) : "",
      };
    }) as any[];
  }
}
