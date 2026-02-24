import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/backend/middlewares/auth.middleware";
import { DashboardService } from "@/backend/services/dashboard.service";

export async function GET(req: NextRequest) {
  // Requires Admin access
  return withAuth(
    req,
    async (req, user) => {
      try {
        const url = new URL(req.url);
        const type = url.searchParams.get("type") || "overview";

        let data;
        if (type === "overview") {
          data = await DashboardService.getOverviewStats();
        } else if (type === "activity") {
          data = await DashboardService.getUserActivity();
        } else if (type === "revenue") {
          data = await DashboardService.getRevenueData();
        } else {
          return NextResponse.json(
            { error: "Invalid type parameter" },
            { status: 400 },
          );
        }

        return NextResponse.json({ success: true, data });
      } catch (error: any) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 },
        );
      }
    },
    true,
  ); // The true parameter enforces requireAdmin in withAuth
}
