import dbConnect from "@/lib/mongodb";
import ChatSession from "@/models/ChatSession";
import Message from "@/models/Message";
import { encryptData, decryptData } from "@/utils/encryption";
import { detectCrisis } from "../utils/crisis-detector";
import {
  ChatSession as IChatSession,
  ChatMessage,
} from "../validators/chat.schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cloudinary from "@/lib/cloudinary";

export class ChatService {
  static async createSession(
    userId: string,
    persona: any,
    title?: string,
  ): Promise<string> {
    await dbConnect();
    const session = await ChatSession.create({
      userId,
      persona,
      title: title || `Therapy Session ${new Date().toLocaleDateString()}`,
      durationMs: 0,
      status: "active",
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
      status: doc.status,
      reportUrl: doc.reportUrl,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      isFavorite: (doc as any).isFavorite,
    })) as any[];
  }

  static async saveMessage(userId: string, data: any) {
    await dbConnect();
    const { sessionId, content, sender, emotion } = data;

    const isCrisis = sender === "user" ? detectCrisis(content) : false;
    const safeContent = encryptData(content);

    console.log(
      `Creating message in DB for session ${sessionId}, sender ${sender}...`,
    );
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
      timestamp: (message as any).createdAt,
    };
  }

  static async getSessionHistory(
    userId: string,
    sessionId: string,
  ): Promise<ChatMessage[]> {
    await dbConnect();
    console.log(`Fetching history for session: ${sessionId}`);
    const messages = await Message.find({ sessionId })
      .sort({ createdAt: 1 })
      .limit(50);
    console.log(`Found ${messages.length} messages for session ${sessionId}`);

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

  static async completeSession(
    userId: string,
    sessionId: string,
  ): Promise<any> {
    await dbConnect();

    // 1. Fetch session and messages
    const session = await ChatSession.findOne({ _id: sessionId, userId });
    console.log(session);
    if (!session) throw new Error("Session not found");
    if (session.status === "completed") return session;

    const messages = await Message.find({ sessionId }).sort({ createdAt: 1 });
    const decryptedMessages = messages.map((m) => ({
      sender: m.sender,
      content: decryptData(m.content),
    }));

    // 2. Generate Structured Report using Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const prompt = `
      Analyze the following therapy session transcript and generate a structured clinical report.
      
      Transcript:
      ${decryptedMessages.map((m) => `${m.sender.toUpperCase()}: ${m.content}`).join("\n")}
      
      Format the response as a JSON object with the following fields:
      - summary: A brief overview of the session.
      - emotional_trends: Identified emotional patterns.
      - key_topics: Main subjects discussed.
      - recommendations: Suggested next steps or exercises.
      - risk_assessment: Any noted concerns (keep it professional).
      
      Return ONLY the JSON.
    `;

    let reportContent = "";
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      reportContent = result.response
        .text()
        .replace(/```json|```/g, "")
        .trim();
    } catch (e) {
      console.warn(
        "Gemini 1.5 Flash failed for report, falling back to Gemini 1.5 Pro",
        e,
      );
      const fallbackModel = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
      });
      const result = await fallbackModel.generateContent(
        `${prompt}\n\nReturn ONLY the JSON.`,
      );
      reportContent = result.response
        .text()
        .replace(/```json|```/g, "")
        .trim();
    }

    // 3. Upload Report to Cloudinary as a raw JSON file
    const uploadRes = (await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        `data:application/json;base64,${Buffer.from(reportContent).toString("base64")}`,
        {
          resource_type: "raw",
          folder: "therapy_reports",
          public_id: `report_${sessionId}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
    })) as any;

    // 4. Update Session in DB
    session.status = "completed";
    session.reportUrl = uploadRes.secure_url;
    session.reportId = uploadRes.public_id;
    await session.save();

    return session;
  }

  static async updateSession(
    userId: string,
    sessionId: string,
    data: { title?: string; isFavorite?: boolean },
  ): Promise<IChatSession | null> {
    await dbConnect();
    const session = await ChatSession.findOneAndUpdate(
      { _id: sessionId, userId },
      data,
      { new: true },
    );
    if (!session) return null;
    return {
      id: session._id.toString(),
      userId: session.userId,
      title: (session as any).title,
      persona: session.persona,
      durationMs: session.durationMs,
      status: session.status,
      reportUrl: session.reportUrl,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      isFavorite: (session as any).isFavorite,
    } as any;
  }

  static async deleteSession(
    userId: string,
    sessionId: string,
  ): Promise<boolean> {
    await dbConnect();
    const result = await ChatSession.deleteOne({ _id: sessionId, userId });
    return result.deletedCount > 0;
  }
}
