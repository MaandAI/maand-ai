import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/backend/middlewares/auth.middleware";
import { UsersService } from "@/backend/services/users.service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(
    req,
    async (req) => {
      try {
        const { id } = await params;
        const data = await req.json();
        const updatedUser = await UsersService.updateUser(id, data);
        
        if (!updatedUser) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, data: updatedUser });
      } catch (error: any) {
        console.error("Update User API Error:", error);
        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 },
        );
      }
    },
    true // Requires Admin
  );
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(
    req,
    async () => {
      try {
        const { id } = await params;
        const success = await UsersService.deleteUser(id);
        
        if (!success) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        
        return NextResponse.json({ success: true });
      } catch (error: any) {
        console.error("Delete User API Error:", error);
        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 },
        );
      }
    },
    true // Requires Admin
  );
}
