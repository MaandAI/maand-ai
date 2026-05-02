import dbConnect from "@/lib/mongodb";
import LegacyProfileModel from "@/models/LegacyProfile";
import { logAuditAction } from "@/services/audit.service";
import { encryptData, decryptData } from "@/utils/encryption";

export interface LegacyProfileInput {
  name: string;
  relationship: string;
  personalityTraits: string[];
  allowedTopics: string[];
  consentGiven: boolean;
  expiresAt: string; // ISO date string
}

export interface LegacyProfile extends LegacyProfileInput {
  id: string;
  createdAt: string;
  status: "active" | "inactive";
}

export async function createLegacyProfile(
  userId: string,
  data: LegacyProfileInput,
): Promise<string> {
  if (!data.consentGiven) {
    throw new Error("Explicit consent is required to create a legacy profile.");
  }

  await dbConnect();

  const profile = await LegacyProfileModel.create({
    userId,
    ...data,
    name: encryptData(data.name),
    personalityTraits: data.personalityTraits.map(encryptData),
    status: "active",
  });

  await logAuditAction(userId, "CREATE_LEGACY_PROFILE", {
    profileId: profile._id.toString(),
    name: data.name,
  });

  return profile._id.toString();
}

export async function getLegacyProfile(
  userId: string,
  profileId: string,
): Promise<LegacyProfile | null> {
  await dbConnect();
  const profile = await LegacyProfileModel.findOne({ _id: profileId, userId });
  
  if (!profile) return null;

  // Decrypt sensitive fields
  return {
    id: profile._id.toString(),
    name: decryptData(profile.name),
    relationship: profile.relationship,
    personalityTraits: profile.personalityTraits
      ? profile.personalityTraits.map((t: string) => decryptData(t))
      : [],
    allowedTopics: profile.allowedTopics,
    consentGiven: profile.consentGiven,
    expiresAt: profile.expiresAt?.toISOString() || "",
    status: profile.status,
    createdAt: profile.createdAt?.toISOString() || "",
  };
}

export async function deleteLegacyProfile(
  userId: string,
  profileId: string,
): Promise<void> {
  await dbConnect();
  await LegacyProfileModel.findOneAndUpdate(
    { _id: profileId, userId },
    { status: "inactive" }
  );

  await logAuditAction(userId, "DELETE_LEGACY_PROFILE", { profileId });
}
