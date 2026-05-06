import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import TherapistRequest from "@/models/TherapistRequest";
import User from "@/models/User";
import { sendEmail, sendWelcomeEmail, sendTherapistApprovalEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { action, adminNotes } = await req.json();

    await dbConnect();
    const therapistRequest = await TherapistRequest.findById(id);

    if (!therapistRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (therapistRequest.status !== "pending") {
      return NextResponse.json({ error: "Request already processed" }, { status: 400 });
    }

    if (action === "approve") {
      // 1. Check if user already exists
      const existingUser = await User.findOne({ email: therapistRequest.email });
      if (existingUser) {
        return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
      }

      // 2. Create Therapist Account
      const tempPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      await User.create({
        name: therapistRequest.name,
        email: therapistRequest.email,
        password: hashedPassword,
        role: "therapist",
        status: "active",
      });

      // 3. Update Request Status
      therapistRequest.status = "approved";
      therapistRequest.adminNotes = adminNotes;
      await therapistRequest.save();

      // 4. Send Approval & Welcome Emails
      await sendTherapistApprovalEmail(therapistRequest.email, therapistRequest.name);
      await sendWelcomeEmail(therapistRequest.email, therapistRequest.name, tempPassword);

      return NextResponse.json({ success: true, message: "Request approved and therapist account created." });
    } else if (action === "reject") {
      therapistRequest.status = "rejected";
      therapistRequest.adminNotes = adminNotes;
      await therapistRequest.save();

      // Send rejection email
      await sendEmail({
        to: therapistRequest.email,
        subject: "Update on your Therapist Request - Maand",
        html: `
          <h1>Hello, ${therapistRequest.name}</h1>
          <p>Thank you for your interest in joining Maand.</p>
          <p>Unfortunately, your request has been rejected at this time.</p>
          ${adminNotes ? `<p><strong>Note from Admin:</strong> ${adminNotes}</p>` : ""}
          <p>If you have any questions, please contact our support team.</p>
        `,
      });

      return NextResponse.json({ success: true, message: "Request rejected." });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Therapist Request Action Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
