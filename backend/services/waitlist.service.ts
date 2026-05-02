import dbConnect from "@/lib/mongodb";
import WaitlistModel from "@/models/Waitlist";
import { WaitlistEntry as IWaitlistEntry } from "../validators/waitlist.schema";

export class WaitlistService {
  static async addEntry(
    data: Omit<IWaitlistEntry, "id" | "joinedAt">,
  ): Promise<string> {
    await dbConnect();
    const entry = await WaitlistModel.create({
      ...data,
    });
    return entry._id.toString();
  }

  static async getEntries(): Promise<IWaitlistEntry[]> {
    await dbConnect();
    const entries = await WaitlistModel.find().sort({ createdAt: -1 });

    return entries.map(
      (doc) => ({ 
        id: doc._id.toString(),
        email: doc.email,
        name: doc.name,
        status: doc.status,
        joinedAt: doc.createdAt,
      } as IWaitlistEntry),
    );
  }

  static async updateStatus(
    entryId: string,
    status: "pending" | "contacted" | "converted",
  ) {
    await dbConnect();
    await WaitlistModel.findByIdAndUpdate(entryId, { status });
  }
}
