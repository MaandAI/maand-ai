import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Module from "@/models/Module";
import UserModuleProgress from "@/models/UserModuleProgress";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await context.params;
    const userId = (session.user as any).id;

    await dbConnect();

    let moduleData = (await Module.findOne({ slug }).lean()) as any;

    // If not found or has 0 stages, reseed and retry
    if (!moduleData || !moduleData.stages || moduleData.stages.length === 0) {
      console.warn(`[Module API] "${slug}" missing or empty. Reseeding...`);
      const { seedModules } = await import("@/lib/seed-modules");
      await Module.deleteMany({});
      await seedModules();
      moduleData = (await Module.findOne({ slug }).lean()) as any;
    }

    if (!moduleData) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    let progress = (await UserModuleProgress.findOne({
      userId,
      moduleId: moduleData._id,
    }).lean()) as any;

    if (!progress) {
      const firstStageId = moduleData.stages?.[0]?.id || null;
      const created = await UserModuleProgress.create({
        userId,
        moduleId: moduleData._id,
        currentStageId: firstStageId,
        status: "not_started",
        progressPercentage: 0,
        completedStages: [],
        streak: 0,
      });
      progress = created.toObject();
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: moduleData._id,
        slug: moduleData.slug,
        title: moduleData.title,
        description: moduleData.description,
        category: moduleData.category,
        durationWeeks: moduleData.durationWeeks,
        totalStages: moduleData.totalStages,
        clinicalBasis: moduleData.clinicalBasis,
        stages: moduleData.stages || [],
        userProgress: {
          status: progress.status || "not_started",
          progressPercentage: progress.progressPercentage || 0,
          completedStages: progress.completedStages || [],
          currentStageId:
            progress.currentStageId || moduleData.stages?.[0]?.id || null,
          streak: progress.streak || 0,
        },
      },
    });
  } catch (error: any) {
    console.error("[Module Detail API Error]", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
