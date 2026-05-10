import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Module from "@/models/Module";
import UserModuleProgress from "@/models/UserModuleProgress";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { seedModules } from "@/lib/seed-modules";

const MODULE_CATEGORY_META: Record<string, { color: string; emoji: string }> = {
  anxiety: { color: "from-rose-500/20 to-orange-500/10", emoji: "🫁" },
  growth: { color: "from-violet-500/20 to-blue-500/10", emoji: "🧠" },
  sleep: { color: "from-indigo-500/20 to-slate-500/10", emoji: "🌙" },
  depression: { color: "from-cyan-500/20 to-teal-500/10", emoji: "💧" },
  regulation: { color: "from-amber-500/20 to-yellow-500/10", emoji: "⚡" },
};

// Expected slugs from our curriculum
const REQUIRED_SLUGS = [
  "anxiety-management",
  "cbt-fundamentals",
  "mindfulness-presence",
  "sleep-optimization",
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Check if all required modules exist with stages
    const existing = await Module.find(
      { slug: { $in: REQUIRED_SLUGS } },
      { slug: 1, "stages.id": 1 }
    ).lean() as any[];

    const needsSeed =
      existing.length < REQUIRED_SLUGS.length ||
      existing.some((m: any) => !m.stages || m.stages.length === 0);

    if (needsSeed) {
      console.log("[Modules API] Seeding missing/incomplete modules...");
      await seedModules();
    }

    const modules = await Module.find().sort({ createdAt: 1 }).lean() as any[];
    const userId = (session.user as any).id;
    const progressRecords = await UserModuleProgress.find({ userId }).lean() as any[];

    const data = modules.map((m: any) => {
      const p = progressRecords.find(
        (pr: any) => pr.moduleId?.toString() === m._id?.toString()
      );
      const meta = MODULE_CATEGORY_META[m.category] || {
        color: "from-primary/20 to-primary/5",
        emoji: "✦",
      };

      return {
        _id: m._id,
        slug: m.slug,
        title: m.title,
        description: m.description,
        category: m.category,
        durationWeeks: m.durationWeeks,
        totalStages: m.totalStages,
        clinicalBasis: m.clinicalBasis,
        stages: m.stages || [],
        meta,
        userProgress: {
          status: p?.status || "not_started",
          progressPercentage: p?.progressPercentage || 0,
          completedStages: p?.completedStages || [],
          currentStageId: p?.currentStageId || m.stages?.[0]?.id || null,
          streak: p?.streak || 0,
        },
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[Modules API Error]", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
