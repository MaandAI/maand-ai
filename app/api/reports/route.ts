import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/backend/middlewares/auth.middleware";
import dbConnect from "@/lib/mongodb";
import Report from "@/models/Report";

export async function GET(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    try {
      await dbConnect();
      const { searchParams } = new URL(req.url);
      const sessionId = searchParams.get("sessionId");

      const query: any = { userId: user.id };
      if (sessionId) {
        query.sessionId = sessionId;
      }

      const reports = await Report.find(query).sort({ createdAt: -1 });
      
      return NextResponse.json({ success: true, data: reports });
    } catch (error: any) {
      console.error("Reports API Error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  });
}
