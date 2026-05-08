import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/backend/middlewares/auth.middleware";
import dbConnect from "@/lib/mongodb";
import Report from "@/models/Report";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(req, async (req, user) => {
    try {
      await dbConnect();
      const reportId = params.id;

      const report = await Report.findOne({ 
        _id: reportId, 
        userId: user.id 
      });

      if (!report) {
        return NextResponse.json(
          { error: "Report not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ success: true, data: report });
    } catch (error: any) {
      console.error("Report API Error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  });
}
