import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Module from "@/models/Module";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const modules = await Module.find({ status: "active" }).select("-__v");
    return NextResponse.json({ success: true, data: modules });
  } catch (error: any) {
    console.error("Public Modules API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
