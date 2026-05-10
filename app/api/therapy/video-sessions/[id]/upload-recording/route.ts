import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import VideoSession from "@/models/VideoSession";
import dbConnect from "@/lib/mongodb";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const sessionUser = await getServerSession(authOptions);
    if (!sessionUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    const formData = await req.formData();
    const file = formData.get("video") as Blob;

    if (!file) {
      return NextResponse.json(
        { error: "No video file provided" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Cloudinary
    const uploadRes = (await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: "maand/sessions/recordings",
          public_id: `recording_${id}`,
          overwrite: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      uploadStream.end(buffer);
    })) as any;

    // Update VideoSession with recording URL
    await dbConnect();
    await VideoSession.findByIdAndUpdate(id, {
      recordingUrl: uploadRes.secure_url,
    });

    return NextResponse.json({
      success: true,
      url: uploadRes.secure_url,
    });
  } catch (error: any) {
    console.error("[UPLOAD_RECORDING_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
