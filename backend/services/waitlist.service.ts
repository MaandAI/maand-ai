import { adminDb } from "../config/firebase-admin";
import { WaitlistEntry } from "../validators/waitlist.schema";

export class WaitlistService {
  static async addEntry(
    data: Omit<WaitlistEntry, "id" | "joinedAt">,
  ): Promise<string> {
    const ref = await adminDb.collection("waitlist").add({
      ...data,
      joinedAt: new Date(),
    });
    return ref.id;
  }

  static async getEntries(): Promise<WaitlistEntry[]> {
    const snapshot = await adminDb
      .collection("waitlist")
      .orderBy("joinedAt", "desc")
      .get();

    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as WaitlistEntry,
    );
  }

  static async updateStatus(
    entryId: string,
    status: "pending" | "contacted" | "converted",
  ) {
    await adminDb.collection("waitlist").doc(entryId).update({ status });
  }
}
