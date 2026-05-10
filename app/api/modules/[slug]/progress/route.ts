import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Module from "@/models/Module";
import UserModuleProgress from "@/models/UserModuleProgress";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { JourneyService } from "@/lib/services/journey-service";

/**
 * POST /api/modules/[slug]/progress
 * Updates user progress, marks stages complete, and moves to next stage.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params; // Next.js 15+: params is a Promise
    const { completedStageId, reflection } = await req.json();
    const userId = (session.user as any).id;

    await dbConnect();

    const moduleData = await Module.findOne({ slug });
    if (!moduleData) return NextResponse.json({ error: "Module not found" }, { status: 404 });

    const progress = await UserModuleProgress.findOne({ userId, moduleId: moduleData._id });
    if (!progress) return NextResponse.json({ error: "Progress record not found" }, { status: 404 });

    // Mark stage as completed
    if (!progress.completedStages.includes(completedStageId)) {
      progress.completedStages.push(completedStageId);
    }

    // Find next stage
    const currentIdx = moduleData.stages.findIndex((s: any) => s.id === completedStageId);
    const nextStage = moduleData.stages[currentIdx + 1];

    if (nextStage) {
      progress.currentStageId = nextStage.id;
      progress.status = "in_progress";
    } else {
      progress.status = "completed";
      progress.progressPercentage = 100;
    }

    // Update percentage if not completed
    if (progress.status !== "completed") {
      progress.progressPercentage = Math.round((progress.completedStages.length / moduleData.totalStages) * 100);
    }

    // Use JourneyService for AI analysis if reflection provided
    if (reflection) {
      await JourneyService.analyzeReflection(userId, moduleData._id.toString(), reflection);
    }

    progress.lastActivityAt = new Date();
    await progress.save();

    return NextResponse.json({ success: true, data: progress });
  } catch (error: any) {
    console.error("[Progress Update API Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
