import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/backend/middlewares/auth.middleware";
import { ChatMessageSchema } from "@/backend/validators/chat.schema";
import { ChatService } from "@/backend/services/chat.service";

export async function POST(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    try {
      const body = await req.json();

      // 1. Validate Input Strictness (Zod)
      // Omit fields that should only be set server-side
      const validatedData = ChatMessageSchema.omit({
        id: true,
        timestamp: true,
        isCrisis: true,
      }).parse(body);

      // 2. Delegate to Service Layer
      const message = await ChatService.saveMessage(user.id, validatedData);

      return NextResponse.json(
        { success: true, data: message },
        { status: 201 },
      );
    } catch (error: any) {
      if (error.name === "ZodError") {
        return NextResponse.json(
          { error: "Validation failed", details: error.errors },
          { status: 400 },
        );
      }
      console.error("Chat API Error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  });
}

export async function GET(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const sessionId = searchParams.get("sessionId");

      if (!sessionId) {
        return NextResponse.json(
          { error: "sessionId is required" },
          { status: 400 },
        );
      }

      const history = await ChatService.getSessionHistory(user.id, sessionId);

      return NextResponse.json({ success: true, data: history });
    } catch (error: any) {
      console.error("Chat API Error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  });
}
