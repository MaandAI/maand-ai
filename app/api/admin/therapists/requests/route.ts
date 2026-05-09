import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import TherapistRequest from "@/models/TherapistRequest";
import User from "@/models/User";
import { sendWelcomeEmail, sendTherapistApprovalEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/admin/therapists/requests - List all requests
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const requests = await TherapistRequest.find().sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: requests });
  } catch (error: any) {
    console.error("Fetch Therapist Requests Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH /api/admin/therapists/requests/[id] - Approve or Reject
// Handled in a dynamic route file... wait I'll put it here if I can use the ID from URL or just create the dynamic file.
// I'll create the dynamic file for clarity.
