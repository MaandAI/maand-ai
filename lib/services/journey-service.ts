import dbConnect from "@/lib/mongodb";
import UserModuleProgress from "@/models/UserModuleProgress";
import Module from "@/models/Module";

export class JourneyService {
  /**
   * Analyzes a user's reflection and updates their journey state.
   * In a real implementation, this would call Gemini/OpenAI.
   */
  static async analyzeReflection(userId: string, moduleId: string, reflection: string) {
    await dbConnect();

    const progress = await UserModuleProgress.findOne({ userId, moduleId });
    if (!progress) return null;

    // Simulate AI analysis logic
    const insights = [];
    const triggers = [];
    
    if (reflection.toLowerCase().includes("work") || reflection.toLowerCase().includes("deadline")) {
      triggers.push("Workplace Pressure");
      insights.push("You show heightened anxiety related to professional deadlines.");
    }

    if (reflection.toLowerCase().includes("breath") || reflection.toLowerCase().includes("calm")) {
      insights.push("Breathing exercises are showing a positive impact on your physical stabilization.");
    }

    // Update progress with new insights
    progress.aiObservations = [...new Set([...progress.aiObservations, ...insights])];
    progress.detectedTriggers = [...new Set([...progress.detectedTriggers, ...triggers])];
    
    await progress.save();
    return progress;
  }

  /**
   * Generates a personalized recommendation based on user history.
   */
  static async getRecommendations(userId: string) {
    await dbConnect();
    const progressRecords = await UserModuleProgress.find({ userId });
    
    // Simple logic: if they have many anxiety triggers, recommend Mindfulness
    const allTriggers = progressRecords.flatMap(p => p.detectedTriggers);
    
    if (allTriggers.length > 3) {
      return {
        title: "Mindfulness & Presence",
        reason: "Based on your recurring stress triggers, a grounding-focused path is recommended.",
        slug: "mindfulness-presence"
      };
    }

    return null;
  }
}
