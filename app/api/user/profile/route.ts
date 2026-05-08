import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById((session.user as any).id).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error("[Profile GET]", error?.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, bio, phoneNumber, location, image, settings } = body;

    await dbConnect();

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (location !== undefined) updateData.location = location;
    if (image !== undefined) updateData.image = image;

    // Handle settings — merge individual keys using dot notation to avoid
    // wiping sub-fields that aren't being updated this request
    if (settings && typeof settings === "object") {
      // Top-level settings fields
      const ALLOWED_SETTINGS = [
        "theme",
        "language",
        "timezone",
        "highContrast",
      ];
      for (const key of ALLOWED_SETTINGS) {
        if (settings[key] !== undefined) {
          updateData[`settings.${key}`] = settings[key];
        }
      }

      // Nested: notifications
      if (settings.notifications && typeof settings.notifications === "object") {
        for (const key of Object.keys(settings.notifications)) {
          updateData[`settings.notifications.${key}`] = settings.notifications[key];
        }
      }

      // Nested: aiPreferences
      if (settings.aiPreferences && typeof settings.aiPreferences === "object") {
        for (const key of Object.keys(settings.aiPreferences)) {
          updateData[`settings.aiPreferences.${key}`] = settings.aiPreferences[key];
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      (session.user as any).id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error("[Profile PATCH]", error?.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
