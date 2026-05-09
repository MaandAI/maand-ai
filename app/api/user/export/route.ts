import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import ChatSession from "@/models/ChatSession";
import Report from "@/models/Report";
import Notification from "@/models/Notification";

function toCSV(rows: Record<string, any>[], headers: string[]): string {
  const escape = (v: any) => {
    const str = v === null || v === undefined ? "" : String(v);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csvRows = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ];
  return csvRows.join("\n");
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json";
    const section = searchParams.get("section"); // optional: profile|sessions|reports|notifications

    await dbConnect();
    const userId = (session.user as any).id;

    const user = await User.findById(userId).lean() as any;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If CSV, only support single-section exports
    if (format === "csv" && !section) {
      return NextResponse.json(
        { error: "Please specify a ?section= when exporting as CSV (profile, sessions, reports, or notifications)" },
        { status: 400 }
      );
    }

    const exportData: Record<string, any> = {};

    // Profile
    if (!section || section === "profile") {
      exportData.profile = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        bio: user.bio ?? null,
        location: user.location ?? null,
        phoneNumber: user.phoneNumber ?? null,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        disclaimerAccepted: user.disclaimerAccepted,
        disclaimerAcceptedAt: user.disclaimerAcceptedAt ?? null,
        settings: user.settings,
        createdAt: user.createdAt,
      };
    }

    // Sessions
    if (!section || section === "sessions") {
      const sessions = await ChatSession.find({ userId }).sort({ createdAt: -1 }).lean();
      exportData.sessions = sessions.map((s: any) => ({
        id: s._id.toString(),
        title: s.title,
        persona: s.persona,
        status: s.status,
        durationMs: s.durationMs,
        isFavorite: s.isFavorite,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      }));
    }

    // Reports
    if (!section || section === "reports") {
      const reports = await Report.find({ userId }).sort({ createdAt: -1 }).lean();
      exportData.reports = reports.map((r: any) => ({
        id: r._id.toString(),
        title: r.title,
        summary: r.summary,
        emotionalTrends: r.emotionalTrends,
        keyTopics: r.keyTopics,
        recommendations: r.recommendations,
        riskAssessment: r.riskAssessment,
        contentUrl: r.contentUrl,
        pdfUrl: r.pdfUrl ?? null,
        isFavorite: r.isFavorite,
        status: r.status,
        createdAt: r.createdAt,
      }));
    }

    // Notifications
    if (!section || section === "notifications") {
      const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).lean();
      exportData.notifications = notifications.map((n: any) => ({
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        createdAt: n.createdAt,
      }));
    }

    // Return CSV
    if (format === "csv" && section) {
      const rows = exportData[section];
      if (!Array.isArray(rows)) {
        // Profile is an object — wrap in array
        const profileArr = [exportData.profile];
        const headers = Object.keys(profileArr[0] || {}).filter(
          (k) => typeof profileArr[0][k] !== "object"
        );
        const csv = toCSV(profileArr, headers);
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="maand_${section}_export.csv"`,
          },
        });
      }
      const headers = rows.length > 0 ? Object.keys(rows[0]).filter((k) => !Array.isArray(rows[0][k]) && typeof rows[0][k] !== "object") : [];
      const csv = toCSV(rows, headers);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="maand_${section}_export.csv"`,
        },
      });
    }

    // Return JSON
    const payload = {
      exportedAt: new Date().toISOString(),
      userId,
      ...exportData,
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="maand_data_export_${Date.now()}.json"`,
      },
    });
  } catch (error: any) {
    console.error("[Data Export]", error?.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
