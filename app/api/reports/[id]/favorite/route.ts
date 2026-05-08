import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/backend/middlewares/auth.middleware";
import dbConnect from "@/lib/mongodb";
import Report from "@/models/Report";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async (req, user) => {
    try {
      await dbConnect();
      const { id } = await params;
      const { isFavorite } = await req.json();

      const report = await Report.findOneAndUpdate(
        { _id: id, userId: user.id },
        { isFavorite },
        { new: true }
      );

      if (!report) {
        return NextResponse.json(
          { error: "Report not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: report });
    } catch (error: any) {
      console.error("Report Favorite API Error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  });
}
