import { adminDb } from "../config/firebase-admin";
import {
  TherapyModule,
  UserModuleProgress,
  TherapyModuleWithProgress,
} from "../validators/modules.schema";

export class ModulesService {
  static async getGlobalModules(): Promise<TherapyModule[]> {
    const snapshot = await adminDb.collection("therapy_modules").get();
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as TherapyModule,
    );
  }

  static async getUserModulesWithProgress(
    userId: string,
  ): Promise<TherapyModuleWithProgress[]> {
    // 1. Fetch Global Modules
    const globalModules = await this.getGlobalModules();

    // 2. Fetch User specific progress
    const progressSnapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("user_modules")
      .get();

    const progressMap = new Map<string, UserModuleProgress>();
    progressSnapshot.docs.forEach((doc) => {
      const data = doc.data() as UserModuleProgress;
      progressMap.set(data.moduleId, { ...data, id: doc.id });
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
    data: Partial<UserModuleProgress> & { moduleId: string },
  ) {
    const { moduleId, ...progressData } = data;

    // Check if progress doc already exists
    const progressRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("user_modules")
      .where("moduleId", "==", moduleId)
      .limit(1);

    const snapshot = await progressRef.get();

    if (snapshot.empty) {
      // Create new progress record
      const docRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("user_modules")
        .doc();
      await docRef.set({
        userId,
        moduleId,
        ...progressData,
        updatedAt: new Date(),
      });
      return { id: docRef.id, moduleId, ...progressData };
    } else {
      // Update existing
      const docId = snapshot.docs[0].id;
      await adminDb
        .collection("users")
        .doc(userId)
        .collection("user_modules")
        .doc(docId)
        .update({
          ...progressData,
          updatedAt: new Date(),
        });
      return { id: docId, moduleId, ...progressData };
    }
  }
}
