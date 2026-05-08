import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, name, disclaimerAccepted } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (!disclaimerAccepted) {
      return NextResponse.json({ error: "You must accept the AI disclaimer to proceed" }, { status: 400 });
    }

    await dbConnect();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: "user",
      disclaimerAccepted: true,
      disclaimerAcceptedAt: new Date(),
      disclaimerVersion: "1.0",
      status: "active",
    });

    return NextResponse.json({ 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name 
      } 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
