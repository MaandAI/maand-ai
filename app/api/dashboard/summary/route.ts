import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/backend/middlewares/auth.middleware";
import { DashboardService } from "@/backend/services/dashboard.service";

export async function GET(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    try {
      const summary = await DashboardService.getUserSummary(user.id);
      return NextResponse.json({ success: true, data: summary });
    } catch (error: any) {
      console.error("Dashboard Summary Error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  });
}
