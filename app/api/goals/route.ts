import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/backend/middlewares/auth.middleware";
import dbConnect from "@/lib/mongodb";
import Goal from "@/models/Goal";

export async function GET(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    try {
      await dbConnect();
      const goals = await Goal.find({ userId: user.id }).sort({ createdAt: -1 });
      return NextResponse.json({ success: true, data: goals });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  });
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    try {
      const body = await req.json();
      await dbConnect();
      const goal = await Goal.create({
        userId: user.id,
        text: body.text,
        sessionId: body.sessionId,
        category: body.category || "personal",
      });
      return NextResponse.json({ success: true, data: goal }, { status: 201 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  });
}

export async function PATCH(req: NextRequest) {
    return withAuth(req, async (req, user) => {
      try {
        const body = await req.json();
        const { id, completed } = body;
        await dbConnect();
        const goal = await Goal.findOneAndUpdate(
          { _id: id, userId: user.id },
          { completed },
          { new: true }
        );
        return NextResponse.json({ success: true, data: goal });
      } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    });
  }
