import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
// import type { TherapyModule, TherapySession, MoodEntry } from "@/types/therapy";

export const getTherapyModules = async (): Promise<any[]> => {
  try {
    const modulesRef = collection(db, "therapy_modules");
    const snapshot = await getDocs(modulesRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching therapy modules:", error);
    return [];
  }
};

export const getRecentModules = async (
  limitCount: number = 3,
): Promise<any[]> => {
  try {
    const modulesRef = collection(db, "therapy_modules");
    const q = query(
      modulesRef,
      orderBy("updatedAt", "desc"),
      limit(limitCount),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching recent modules:", error);
    return [];
  }
};

export const getUserMoodHistory = async (userId: string): Promise<any[]> => {
  try {
    const moodRef = collection(db, "users", userId, "mood_history");
    const q = query(moodRef, orderBy("timestamp", "desc"), limit(30));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching mood history:", error);
    return [];
  }
};
