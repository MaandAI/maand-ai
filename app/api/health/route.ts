import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Module from "@/models/Module";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const status: any = {
    database: "pending",
    session: "pending",
    models: {
      Module: "pending",
      User: "pending"
    },
    env: {
      hasMongoUri: !!process.env.MONGODB_URI,
      nodeEnv: process.env.NODE_ENV
    }
  };

  try {
    const session = await getServerSession(authOptions);
    status.session = session ? "active" : "none";
    
    await dbConnect();
    status.database = "connected";

    status.models.Module = !!Module ? "registered" : "missing";
    status.models.User = !!User ? "registered" : "missing";

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      status, 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
