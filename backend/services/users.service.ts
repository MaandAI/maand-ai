import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  name: string;
  displayName?: string;
  avatar?: string;
  role: "user" | "admin" | "therapist";
  status: "active" | "inactive" | "suspended";
  subscription: "free" | "basic" | "pro" | "enterprise";
  lastActive?: Date;
  createdAt: Date;
}

export class UsersService {
  static async getAllUsers(): Promise<UserProfile[]> {
    await dbConnect();
    const users = await User.find().sort({ createdAt: -1 });
    
    return users.map((user) => {
      return {
        id: user._id.toString(),
        uid: user._id.toString(),
        email: user.email,
        name: user.name,
        displayName: user.name,
        role: user.role,
        status: user.status,
        subscription: (user as any).subscription || "free",
        createdAt: user.createdAt,
        lastActive: (user as any).updatedAt || user.createdAt,
      } as UserProfile;
    });
  }
  static async getUserProfile(id: string): Promise<UserProfile | null> {
    await dbConnect();
    const user = await User.findById(id);
    if (!user) return null;
    return {
      id: user._id.toString(),
      uid: user._id.toString(),
      email: user.email,
      name: user.name,
      displayName: user.name,
      role: user.role,
      status: user.status,
      subscription: (user as any).subscription || "free",
      createdAt: user.createdAt,
      lastActive: (user as any).updatedAt || user.createdAt,
    } as UserProfile;
  }

  static async updateUser(id: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
    await dbConnect();
    const user = await User.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!user) return null;
    return {
      id: user._id.toString(),
      uid: user._id.toString(),
      email: user.email,
      name: user.name,
      displayName: user.name,
      role: user.role,
      status: user.status,
      subscription: (user as any).subscription || "free",
      createdAt: user.createdAt,
      lastActive: (user as any).updatedAt || user.createdAt,
    } as UserProfile;
  }

  static async deleteUser(id: string): Promise<boolean> {
    await dbConnect();
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }
}
