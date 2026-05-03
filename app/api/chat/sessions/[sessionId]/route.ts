import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/backend/middlewares/auth.middleware";
// import { ChatService } from "@/backend/services/chat.service";
import ChatSession from "@/models/ChatSession";
import dbConnect from "@/lib/mongodb";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  return withAuth(req, async (req, user) => {
    try {
      const body = await req.json();
      const updateData: any = {};

      if (body.title !== undefined) updateData.title = body.title;
      if (body.isFavorite !== undefined)
        updateData.isFavorite = body.isFavorite;

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
          { error: "No update data provided" },
          { status: 400 },
        );
      }

      await dbConnect();
      const session = await ChatSession.findOneAndUpdate(
        { _id: params.sessionId, userId: user.id },
        updateData,
        { new: true },
      );

      if (!session) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({ success: true, data: session });
    } catch (error: any) {
      console.error("Rename Session API Error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  return withAuth(req, async (req, user) => {
    try {
      await dbConnect();
      const session = await ChatSession.findOneAndDelete({
        _id: params.sessionId,
        userId: user.id,
      });

      if (!session) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({ success: true, message: "Session deleted" });
    } catch (error: any) {
      console.error("Delete Session API Error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  });
}
