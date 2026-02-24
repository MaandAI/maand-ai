import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/backend/middlewares/auth.middleware";
import { UsersService } from "@/backend/services/users.service";

export async function GET(req: NextRequest) {
  return withAuth(
    req,
    async (req, user) => {
      try {
        const users = await UsersService.getAllUsers();
        return NextResponse.json({ success: true, data: users });
      } catch (error: any) {
        console.error("Users API Error:", error);
        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 },
        );
      }
    },
    true,
  ); // Requires Admin
}
