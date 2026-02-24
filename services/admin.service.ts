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

export const getDashboardStats = async () => {
  try {
    const statsRef = doc(db, "admin", "dashboard_stats");
    const snapshot = await getDoc(statsRef);
    if (!snapshot.exists()) return null;
    return snapshot.data();
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return null;
  }
};

export const getRevenueData = async () => {
  try {
    const revenueRef = collection(db, "admin", "revenue", "monthly");
    const q = query(revenueRef, orderBy("date", "asc"), limit(12));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return [];
  }
};

export const getUserActivity = async () => {
  try {
    const activityRef = collection(db, "admin", "activity", "daily");
    const q = query(activityRef, orderBy("date", "asc"), limit(30));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching user activity:", error);
    return [];
  }
};
