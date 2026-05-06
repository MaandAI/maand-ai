import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import TherapistRequest from "@/models/TherapistRequest";
import { z } from "zod";

const requestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  specialization: z.string().min(2, "Specialization is required"),
  licenseNumber: z.string().min(2, "License number is required"),
  experience: z.number().min(0, "Experience must be a positive number"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
});

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Validate input
    const validatedData = requestSchema.parse(body);
    
    // Check if request already exists
    const existingRequest = await TherapistRequest.findOne({ email: validatedData.email });
    if (existingRequest) {
      return NextResponse.json(
        { error: "A request with this email already exists." },
        { status: 400 }
      );
    }
    
    const therapistRequest = await TherapistRequest.create(validatedData);
    
    return NextResponse.json({
      success: true,
      message: "Request submitted successfully! Our team will review it and contact you via email.",
      data: { id: therapistRequest._id }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Therapist Request Error:", error);
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}
