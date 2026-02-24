import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/backend/middlewares/auth.middleware";
import { WaitlistService } from "@/backend/services/waitlist.service";
import { WaitlistEntrySchema } from "@/backend/validators/waitlist.schema";

export async function GET(req: NextRequest) {
  return withAuth(
    req,
    async (req, user) => {
      try {
        const entries = await WaitlistService.getEntries();
        return NextResponse.json({ success: true, data: entries });
      } catch (error: any) {
        console.error("Waitlist API Error:", error);
        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 },
        );
      }
    },
    true,
  ); // Requires Admin
}

export async function POST(req: NextRequest) {
  // Public route - no withAuth wrapper needed for joining the waitlist
  try {
    const body = await req.json();

    // Strict schema parse ensures people can't inject "status: converted" etc
    const validatedData = WaitlistEntrySchema.omit({
      id: true,
      joinedAt: true,
      status: true,
    }).parse(body);

    const id = await WaitlistService.addEntry({
      ...validatedData,
      status: "pending",
    });

    return NextResponse.json({ success: true, data: { id } }, { status: 201 });
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
}

export async function PATCH(req: NextRequest) {
  return withAuth(
    req,
    async (req, user) => {
      try {
        const body = await req.json();
        const { entryId, status } = body;

        if (!entryId || !status) {
          return NextResponse.json(
            { error: "entryId and status are required" },
            { status: 400 },
          );
        }

        await WaitlistService.updateStatus(entryId, status);
        return NextResponse.json({ success: true });
      } catch (error: any) {
        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 },
        );
      }
    },
    true,
  ); // Requires Admin
}
