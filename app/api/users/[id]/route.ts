import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/backend/middlewares/auth.middleware";
import { UsersService } from "@/backend/services/users.service";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(req, async (req, user) => {
    try {
      const { id } = params;
      const profile = await UsersService.getUserProfile(id);
      
      if (!profile) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: profile });
    } catch (error: any) {
      console.error("User Profile API Error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  });
}
