import { adminDb } from "@/lib/firebase-admin";
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

  const profileRef = adminDb
    .collection("users")
    .doc(userId)
    .collection("legacy_profiles")
    .doc();
  const profileId = profileRef.id;

  const newProfile: LegacyProfile = {
    id: profileId,
    ...data,
    name: encryptData(data.name),
    personalityTraits: data.personalityTraits.map(encryptData),
    status: "active",
    createdAt: new Date().toISOString(),
  };

  await profileRef.set(newProfile);

  await logAuditAction(userId, "CREATE_LEGACY_PROFILE", {
    profileId,
    name: data.name,
  });

  return profileId;
}

export async function getLegacyProfile(
  userId: string,
  profileId: string,
): Promise<LegacyProfile | null> {
  const doc = await adminDb
    .collection("users")
    .doc(userId)
    .collection("legacy_profiles")
    .doc(profileId)
    .get();
  if (!doc.exists) return null;

  const data = doc.data() as LegacyProfile;

  // Decrypt sensitive fields
  return {
    ...data,
    name: decryptData(data.name),
    personalityTraits: data.personalityTraits
      ? data.personalityTraits.map(decryptData)
      : [],
  };
}

export async function deleteLegacyProfile(
  userId: string,
  profileId: string,
): Promise<void> {
  const profileRef = adminDb
    .collection("users")
    .doc(userId)
    .collection("legacy_profiles")
    .doc(profileId);

  // Soft delete
  await profileRef.update({ status: "inactive" });

  await logAuditAction(userId, "DELETE_LEGACY_PROFILE", { profileId });
}
