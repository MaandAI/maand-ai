import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile, Role } from "@/types";

export const getUserProfile = async (
  uid: string,
): Promise<UserProfile | null> => {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (!userDoc.exists()) return null;
  return userDoc.data() as UserProfile;
};

export const createUserProfile = async (
  uid: string,
  data: Partial<UserProfile>,
): Promise<void> => {
  const timestamp = new Date().toISOString();
  const profile: UserProfile = {
    uid,
    email: data.email || null,
    displayName: data.displayName || null,
    photoURL: data.photoURL || null,
    role: data.role || "user",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await setDoc(doc(db, "users", uid), profile);
};

export const updateUserRole = async (
  uid: string,
  role: Role,
): Promise<void> => {
  await updateDoc(doc(db, "users", uid), {
    role,
    updatedAt: new Date().toISOString(),
  });
};
