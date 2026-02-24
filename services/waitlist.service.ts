import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface WaitlistEntry {
  email: string;
  name?: string;
  status: "pending" | "contacted" | "converted";
  createdAt: string;
}

export const joinWaitlist = async (data: Partial<WaitlistEntry>) => {
  try {
    const waitlistRef = collection(db, "waitlist");
    await addDoc(waitlistRef, {
      ...data,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("Error joining waitlist:", error);
    return false;
  }
};

export const getWaitlistEntries = async () => {
  try {
    const waitlistRef = collection(db, "waitlist");
    const q = query(waitlistRef, orderBy("createdAt", "desc"), limit(100));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching waitlist:", error);
    return [];
  }
};
