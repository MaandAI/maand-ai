import dbConnect from "@/lib/mongodb";
import Module from "@/models/Module";

const FULL_CURRICULUM = [
  {
    slug: "anxiety-management",
    title: "Anxiety Management",
    description:
      "Master evidence-based grounding techniques, cognitive reframing, and emotional regulation to reclaim control during high-stress moments and build lasting resilience.",
    category: "anxiety",
    durationWeeks: 4,
    totalStages: 8,
    clinicalBasis: "CBT & Mindfulness-Based Stress Reduction (MBSR)",
    stages: [
      {
        id: "am_1",
        order: 1,
        title: "Understanding Anxiety",
        description:
          "Explore the neuroscience of anxiety — why your brain triggers the fear response, what happens in your body, and why understanding this is the first step to healing.",
        type: "ai_session",
        duration: 15,
      },
      {
        id: "am_2",
        order: 2,
        title: "Identifying Your Triggers",
        description:
          "Map the specific situations, thoughts, and environments that activate your anxiety. Through AI-guided reflection, build your personal trigger inventory.",
        type: "reflection",
        duration: 12,
      },
      {
        id: "am_3",
        order: 3,
        title: "Physical Symptoms & Awareness",
        description:
          "Learn to recognize the physical signature of anxiety in your body — racing heart, shallow breath, muscle tension — and what they're trying to tell you.",
        type: "ai_session",
        duration: 15,
      },
      {
        id: "am_4",
        order: 4,
        title: "Grounding & Breathing",
        description:
          "Practice box breathing and the 5-4-3-2-1 grounding technique to physiologically calm your nervous system during acute anxiety moments.",
        type: "exercise",
        duration: 10,
        content: { exerciseType: "box_breathing" },
      },
      {
        id: "am_5",
        order: 5,
        title: "Managing Overthinking",
        description:
          "Break the cycle of rumination and worry loops using structured interruption techniques and cognitive defusion strategies from ACT therapy.",
        type: "ai_session",
        duration: 20,
      },
      {
        id: "am_6",
        order: 6,
        title: "Exposure Exercises",
        description:
          "Build your personalized fear hierarchy and begin gradual exposure — the most evidence-based method for reducing avoidance and long-term anxiety.",
        type: "reflection",
        duration: 15,
      },
      {
        id: "am_7",
        order: 7,
        title: "Emotional Regulation",
        description:
          "Develop skills to observe, label, and modulate your emotional states without suppression or overwhelm. Learn the TIPP and PLEASE skills from DBT.",
        type: "voice_session",
        duration: 12,
      },
      {
        id: "am_8",
        order: 8,
        title: "Anxiety Recovery Maintenance",
        description:
          "Consolidate everything you have learned. Build a personal relapse-prevention plan and commit to your ongoing wellness practice with AI support.",
        type: "assessment",
        duration: 15,
      },
    ],
  },
  {
    slug: "cbt-fundamentals",
    title: "CBT Fundamentals",
    description:
      "Learn the core principles of Cognitive Behavioral Therapy to identify distorted thinking patterns and replace them with balanced, evidence-based perspectives.",
    category: "growth",
    durationWeeks: 6,
    totalStages: 7,
    clinicalBasis: "Standard Clinical CBT Protocols",
    stages: [
      {
        id: "cbt_1",
        order: 1,
        title: "Introduction to CBT",
        description:
          "Discover how thoughts, emotions, and behaviors are interconnected in the cognitive triangle — and why changing one always shifts the others.",
        type: "ai_session",
        duration: 20,
      },
      {
        id: "cbt_2",
        order: 2,
        title: "Identifying Negative Thoughts",
        description:
          "Learn to catch automatic negative thoughts as they arise. Practice thought logging to build moment-to-moment awareness of your inner narrative.",
        type: "reflection",
        duration: 15,
      },
      {
        id: "cbt_3",
        order: 3,
        title: "Cognitive Distortions",
        description:
          "Identify the 10 most common distortions — catastrophizing, black-and-white thinking, mind-reading, overgeneralization — and spot them in your own patterns.",
        type: "ai_session",
        duration: 18,
      },
      {
        id: "cbt_4",
        order: 4,
        title: "Challenging Your Thoughts",
        description:
          "Apply the Socratic method to examine evidence for and against automatic thoughts. Replace distorted thinking with balanced, realistic alternatives.",
        type: "exercise",
        duration: 20,
        content: { exerciseType: "thought_record" },
      },
      {
        id: "cbt_5",
        order: 5,
        title: "Behavioral Patterns",
        description:
          "Map the avoidance behaviors and negative reinforcement loops that sustain depression and anxiety. Plan meaningful behavioral activation strategies.",
        type: "reflection",
        duration: 15,
      },
      {
        id: "cbt_6",
        order: 6,
        title: "Rebuilding Healthy Thinking",
        description:
          "Practice positive cognitive restructuring and balanced thinking patterns. Build confidence through small behavioral experiments that challenge fear.",
        type: "ai_session",
        duration: 20,
      },
      {
        id: "cbt_7",
        order: 7,
        title: "CBT Maintenance Plan",
        description:
          "Consolidate your CBT toolkit. Create a personalized maintenance plan and receive an AI-generated emotional progress summary based on your journey.",
        type: "assessment",
        duration: 15,
      },
    ],
  },
  {
    slug: "mindfulness-presence",
    title: "Mindfulness & Presence",
    description:
      "Cultivate deep moment-to-moment awareness, reduce rumination, and find stillness through guided AI meditation and evidence-based mindfulness practices.",
    category: "growth",
    durationWeeks: 4,
    totalStages: 6,
    clinicalBasis: "Mindfulness-Based Cognitive Therapy (MBCT)",
    stages: [
      {
        id: "mind_1",
        order: 1,
        title: "Understanding Mindfulness",
        description:
          "Explore what mindfulness really means clinically — not relaxation, but intentional, non-judgmental awareness of the present moment as it unfolds.",
        type: "ai_session",
        duration: 15,
      },
      {
        id: "mind_2",
        order: 2,
        title: "Breath Awareness",
        description:
          "Use diaphragmatic breathing as a real-time anchor to the present. Practice box breathing to calm the nervous system and quiet the restless mind.",
        type: "exercise",
        duration: 10,
        content: { exerciseType: "box_breathing" },
      },
      {
        id: "mind_3",
        order: 3,
        title: "Grounding Techniques",
        description:
          "Practice the 5-4-3-2-1 sensory grounding method and progressive muscle relaxation to return to the present during anxiety, dissociation, or overwhelm.",
        type: "exercise",
        duration: 12,
        content: { exerciseType: "grounding_54321" },
      },
      {
        id: "mind_4",
        order: 4,
        title: "Body Awareness",
        description:
          "Reconnect with physical sensations through a guided body scan meditation — the foundational somatic practice for nervous system regulation.",
        type: "ai_session",
        duration: 15,
      },
      {
        id: "mind_5",
        order: 5,
        title: "Present Moment Practice",
        description:
          "Learn to observe thoughts arising and passing without becoming entangled. You are not your thoughts — this session proves it through direct experience.",
        type: "voice_session",
        duration: 20,
      },
      {
        id: "mind_6",
        order: 6,
        title: "Daily Mindfulness Integration",
        description:
          "Build a sustainable daily mindfulness practice. Assess what worked, design your personal ritual, and commit to ongoing presence with AI accountability.",
        type: "assessment",
        duration: 12,
      },
    ],
  },
  {
    slug: "sleep-optimization",
    title: "Sleep Optimization",
    description:
      "Rebuild your circadian rhythm, silence nighttime anxiety, and master evidence-based sleep hygiene to restore deep, restorative rest using CBT-I protocols.",
    category: "sleep",
    durationWeeks: 3,
    totalStages: 6,
    clinicalBasis: "CBT for Insomnia (CBT-I)",
    stages: [
      {
        id: "sleep_1",
        order: 1,
        title: "Understanding Sleep Health",
        description:
          "Learn the architecture of healthy sleep — REM cycles, deep sleep stages, circadian rhythm — and why disruptions have such a profound impact on mental health.",
        type: "ai_session",
        duration: 15,
      },
      {
        id: "sleep_2",
        order: 2,
        title: "Nighttime Anxiety",
        description:
          "Identify and interrupt the anxious thought spirals that emerge at night. Learn cognitive quieting techniques specifically designed for bedtime rumination.",
        type: "reflection",
        duration: 12,
      },
      {
        id: "sleep_3",
        order: 3,
        title: "Sleep Hygiene Mastery",
        description:
          "Apply the two core CBT-I techniques — stimulus control and sleep restriction — which have the strongest evidence base for treating chronic insomnia.",
        type: "ai_session",
        duration: 18,
      },
      {
        id: "sleep_4",
        order: 4,
        title: "Relaxation Techniques",
        description:
          "Practice progressive muscle relaxation and diaphragmatic breathing as a pre-sleep ritual to transition your nervous system from alert to rest mode.",
        type: "exercise",
        duration: 12,
        content: { exerciseType: "box_breathing" },
      },
      {
        id: "sleep_5",
        order: 5,
        title: "Bedtime Routine Building",
        description:
          "Design your personalized pre-sleep protocol: wind-down sequences, sensory cues, screen hygiene, and environmental factors that signal safety to your brain.",
        type: "reflection",
        duration: 15,
      },
      {
        id: "sleep_6",
        order: 6,
        title: "Long-Term Sleep Recovery",
        description:
          "Review your progress, analyze your sleep patterns with AI support, and build a maintenance strategy to protect your sleep health long-term.",
        type: "assessment",
        duration: 12,
      },
    ],
  },
];

export async function seedModules() {
  try {
    await dbConnect();
    console.log(`[Seed] Syncing ${FULL_CURRICULUM.length} modules...`);

    for (const moduleData of FULL_CURRICULUM) {
      // Delete existing document first, then insert fresh — avoids all upsert strict-mode issues
      await Module.deleteOne({ slug: moduleData.slug });
      await Module.create(moduleData);
      console.log(`[Seed] ✓ ${moduleData.title} (${moduleData.stages.length} stages)`);
    }

    console.log("[Seed] All modules synced successfully.");
  } catch (error) {
    console.error("[Seed] Error:", error);
    throw error;
  }
}
