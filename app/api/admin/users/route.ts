import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { sendWelcomeEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["admin", "therapist", "user"]).default("user"),
});

const batchSchema = z.array(userSchema);

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    // Check if it's a batch request
    if (Array.isArray(body)) {
      const validatedData = batchSchema.parse(body);
      const results = [];

      for (const userData of validatedData) {
        const result = await createUserAndNotify(userData);
        results.push(result);
      }

      return NextResponse.json({
        success: true,
        data: results,
        message: `Successfully processed ${results.length} users.`,
      });
    } else {
      // Single user creation
      const validatedData = userSchema.parse(body);
      const result = await createUserAndNotify(validatedData);
      
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        data: result.user,
        message: "User created and notification sent.",
      });
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("User Creation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function createUserAndNotify(userData: any) {
  try {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return { email: userData.email, error: "User already exists" };
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await User.create({
      ...userData,
      password: hashedPassword,
      status: "active",
    });

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name, tempPassword);

    return { email: user.email, success: true, user: { id: user._id, email: user.email, role: user.role } };
  } catch (error: any) {
    return { email: userData.email, error: error.message };
  }
}
