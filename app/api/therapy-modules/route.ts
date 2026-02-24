import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/backend/middlewares/auth.middleware";
import { ModulesService } from "@/backend/services/modules.service";
import { UserModuleProgressSchema } from "@/backend/validators/modules.schema";

export async function GET(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    try {
      const modules = await ModulesService.getUserModulesWithProgress(user.uid);
      return NextResponse.json({ success: true, data: modules });
    } catch (error: any) {
      console.error("Modules API Error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    try {
      const body = await req.json();

      const validatedData = UserModuleProgressSchema.omit({
        id: true,
        userId: true,
        updatedAt: true,
      }).parse(body);

      const progress = await ModulesService.updateUserModuleProgress(user.uid, {
        moduleId: validatedData.moduleId,
        status: validatedData.status,
        progress: validatedData.progress,
        sessionsCompleted: validatedData.sessionsCompleted,
      });

      return NextResponse.json({ success: true, data: progress });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return NextResponse.json(
          { error: "Validation failed", details: error.errors },
          { status: 400 },
        );
      }
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  });
}
