import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { image } = await req.json(); // Expect base64 data URL
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Validate it's an image
    if (!image.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image format. Use JPEG, PNG, or GIF." }, { status: 400 });
    }

    // Upload to Cloudinary
    const uploadRes = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload(
        image,
        {
          resource_type: "image",
          folder: "maand/avatars",
          public_id: `avatar_${userId}`,
          overwrite: true,
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    const imageUrl = uploadRes.secure_url;

    // Update user in DB
    await dbConnect();
    await User.findByIdAndUpdate(userId, { $set: { image: imageUrl } });

    return NextResponse.json({
      success: true,
      data: { imageUrl },
      message: "Avatar updated successfully",
    });
  } catch (error: any) {
    console.error("[Avatar Upload]", error?.message);
    return NextResponse.json({ error: "Failed to upload avatar" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Remove from Cloudinary
    try {
      await cloudinary.uploader.destroy(`maand/avatars/avatar_${userId}`);
    } catch {
      // Ignore if doesn't exist
    }

    // Clear from DB
    await dbConnect();
    await User.findByIdAndUpdate(userId, { $unset: { image: "" } });

    return NextResponse.json({ success: true, message: "Avatar removed" });
  } catch (error: any) {
    console.error("[Avatar Delete]", error?.message);
    return NextResponse.json({ error: "Failed to remove avatar" }, { status: 500 });
  }
}
