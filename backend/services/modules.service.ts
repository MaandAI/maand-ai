import dbConnect from "@/lib/mongodb";
import Module from "@/models/Module";
import UserModuleProgress from "@/models/UserModuleProgress";
import {
  TherapyModule,
  UserModuleProgress as IUserModuleProgress,
  TherapyModuleWithProgress,
} from "../validators/modules.schema";

export class ModulesService {
  static async getGlobalModules(): Promise<TherapyModule[]> {
    await dbConnect();
    const modules = await Module.find();
    return modules.map(
      (doc) => ({ 
        id: doc._id.toString(),
        name: doc.name,
        description: doc.description,
        icon: doc.icon,
        totalSessions: doc.totalSessions,
      } as TherapyModule),
    );
  }

  static async getUserModulesWithProgress(
    userId: string,
  ): Promise<TherapyModuleWithProgress[]> {
    await dbConnect();
    // 1. Fetch Global Modules
    const globalModules = await this.getGlobalModules();

    // 2. Fetch User specific progress
    const progressList = await UserModuleProgress.find({ userId });

    const progressMap = new Map<string, IUserModuleProgress>();
    progressList.forEach((doc) => {
      progressMap.set(doc.moduleId, { 
        id: doc._id.toString(),
        userId: doc.userId,
        moduleId: doc.moduleId,
        status: doc.status,
        progress: doc.progress,
        sessionsCompleted: doc.sessionsCompleted,
      });
    });

    // 3. Merge
    return globalModules.map((module) => {
      const userProgress = progressMap.get(module.id);
      return {
        ...module,
        status: userProgress?.status || "active", // default active if not started
        progress: userProgress?.progress || 0,
        sessionsCompleted: userProgress?.sessionsCompleted || 0,
      };
    });
  }

  static async updateUserModuleProgress(
    userId: string,
    data: Partial<IUserModuleProgress> & { moduleId: string },
  ) {
    await dbConnect();
    const { moduleId, ...progressData } = data;

    const updated = await UserModuleProgress.findOneAndUpdate(
      { userId, moduleId },
      { ...progressData, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    return { 
      id: updated._id.toString(), 
      moduleId: updated.moduleId, 
      ...progressData 
    };
  }
}
