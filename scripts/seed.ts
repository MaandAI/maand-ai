require("dotenv").config({ path: ".env.local" });

import dbConnect from "../lib/mongodb";
import User from "../models/User";
import Module from "../models/Module";
import Notification from "../models/Notification";
import Analytics from "../models/Analytics";
import Waitlist from "../models/Waitlist";
import ChatSession from "../models/ChatSession";
import Message from "../models/Message";
import LegacyProfile from "../models/LegacyProfile";
import UserModuleProgress from "../models/UserModuleProgress";
import bcrypt from "bcryptjs";

export async function seedInitialData() {
  console.log("Starting Comprehensive MongoDB seed...");
  await dbConnect();
  console.log("ENV:", process.env.MONGODB_URI);
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Seed Users (Admin, Therapist, Regular User)
  const usersToSeed = [
    { email: "admin@maand.tech", name: "Admin User", role: "admin" },
    {
      email: "therapist@maand.tech",
      name: "Dr. Sarah Miller",
      role: "therapist",
    },
    { email: "user@maand.tech", name: "John Doe", role: "user" },
  ];

  const seededUsers = [];
  for (const userData of usersToSeed) {
    const user = await User.findOneAndUpdate(
      { email: userData.email },
      {
        name: userData.name,
        password: hashedPassword,
        role: userData.role,
        status: "active",
      },
      { upsert: true, new: true },
    );
    seededUsers.push(user);
  }

  const [admin, therapist, regularUser] = seededUsers;
  const adminId = admin._id.toString();
  const therapistId = therapist._id.toString();
  const userId = regularUser._id.toString();

  // 2. Seed Therapy Modules
  const modulesToSeed = [
    {
      name: "CBT Fundamentals",
      description: "Learn the core principles of Cognitive Behavioral Therapy.",
      icon: "Brain",
      totalSessions: 10,
    },
    {
      name: "Mindfulness & Presence",
      description: "Techniques for staying present and reducing stress.",
      icon: "Wind",
      totalSessions: 8,
    },
    {
      name: "Anxiety Management",
      description: "Tools and strategies to cope with acute anxiety.",
      icon: "Shield",
      totalSessions: 12,
    },
    {
      name: "Sleep Optimization",
      description: "Improve your sleep hygiene and restful nights.",
      icon: "Moon",
      totalSessions: 5,
    },
    {
      name: "Grief & Loss Support",
      description: "Navigating the difficult journey of losing a loved one.",
      icon: "Heart",
      totalSessions: 15,
    },
    {
      name: "Trauma Recovery",
      description: "Evidence-based approaches to healing from past trauma.",
      icon: "Zap",
      totalSessions: 20,
    },
  ];

  const seededModules = [];
  for (const mod of modulesToSeed) {
    const m = await Module.findOneAndUpdate(
      { name: mod.name },
      { ...mod, status: "active" },
      { upsert: true, new: true },
    );
    seededModules.push(m);
  }

  // 3. Seed User Progress
  const progressToSeed = [
    {
      userId,
      moduleId: seededModules[0]._id.toString(),
      progress: 60,
      sessionsCompleted: 6,
    },
    {
      userId,
      moduleId: seededModules[1]._id.toString(),
      progress: 25,
      sessionsCompleted: 2,
    },
  ];

  await UserModuleProgress.deleteMany({ userId: { $in: [adminId, userId] } });
  for (const prog of progressToSeed) {
    await UserModuleProgress.create(prog);
  }

  // 4. Seed Notifications
  await Notification.deleteMany({});
  await Notification.create([
    {
      userId: adminId,
      title: "System Update",
      message: "Maand v2.1.0 is now live.",
      type: "info",
      read: true,
    },
    {
      userId: adminId,
      title: "New Therapist Application",
      message: "A new professional has applied to join.",
      type: "warning",
      read: false,
    },
    {
      userId: userId,
      title: "Module Completed!",
      message: "You've finished your first session in Mindfulness.",
      type: "success",
      read: false,
    },
    {
      userId: userId,
      title: "Session Reminder",
      message: "Your AI therapy session is in 30 minutes.",
      type: "info",
      read: false,
    },
  ]);

  // 5. Seed Chat Sessions & Messages
  await ChatSession.deleteMany({});
  await Message.deleteMany({});

  // Session 1: Admin
  const adminSession1 = await ChatSession.create({
    userId: adminId,
    title: "System Performance Discussion",
    persona: { description: "Technical Assistant" },
    durationMs: 1800000,
  });

  await Message.create([
    {
      sessionId: adminSession1._id.toString(),
      content: "How is the system load today?",
      sender: "user",
    },
    {
      sessionId: adminSession1._id.toString(),
      content:
        "The current system load is stable at 15%. All services are operational.",
      sender: "ai",
    },
  ]);

  // Session 2: Regular User (Stress related)
  const userSession1 = await ChatSession.create({
    userId: userId,
    title: "Work Stress Management",
    persona: { description: "Empathetic Listener" },
    durationMs: 2400000,
  });

  await Message.create([
    {
      sessionId: userSession1._id.toString(),
      content: "I'm feeling very stressed about my upcoming deadline.",
      sender: "user",
      emotion: "anxious",
    },
    {
      sessionId: userSession1._id.toString(),
      content:
        "I'm sorry to hear that. Deadlines can be incredibly taxing. What part of the work is feeling most overwhelming right now?",
      sender: "ai",
      emotion: "calm",
    },
    {
      sessionId: userSession1._id.toString(),
      content:
        "It's the technical documentation. I feel like I'm falling behind.",
      sender: "user",
      emotion: "stressed",
    },
    {
      sessionId: userSession1._id.toString(),
      content:
        "That makes sense. Technical writing requires a lot of focus. Have you tried breaking the documentation into smaller, 20-minute tasks?",
      sender: "ai",
      emotion: "supportive",
    },
  ]);

  // Session 3: Regular User (Sleep related)
  const userSession2 = await ChatSession.create({
    userId: userId,
    title: "Insomnia Support",
    persona: { description: "Sleep Specialist" },
    durationMs: 1500000,
  });

  await Message.create([
    {
      sessionId: userSession2._id.toString(),
      content: "I haven't slept well in three nights.",
      sender: "user",
      emotion: "tired",
    },
    {
      sessionId: userSession2._id.toString(),
      content:
        "Three nights of poor sleep is very difficult. Are you finding it hard to fall asleep, or are you waking up during the night?",
      sender: "ai",
      emotion: "neutral",
    },
  ]);

  // 6. Seed Legacy Profiles
  await LegacyProfile.deleteMany({});
  await LegacyProfile.create([
    {
      userId,
      name: "Grandpa Joseph",
      relationship: "Grandfather",
      personalityTraits: ["Wise", "Kind", "Storyteller"],
      allowedTopics: ["Family History", "Gardening", "Life Advice"],
      consentGiven: true,
      status: "active",
    },
    {
      userId,
      name: "Old Friend Alex",
      relationship: "Best Friend",
      personalityTraits: ["Funny", "Loyal", "Blunt"],
      allowedTopics: ["College Memories", "Music", "Jokes"],
      consentGiven: true,
      status: "active",
    },
  ]);

  // 7. Seed Dashboard Analytics
  await Analytics.findOneAndUpdate(
    { type: "dashboard_overview" },
    {
      data: {
        totalUsers: 15420,
        activeUsers: 11205,
        totalRevenue: 624800,
        subscriptions: 9840,
        userGrowth: 15.2,
        revenueGrowth: 28.4,
      },
      userActivity: [
        { date: "2024-01", users: 5200, sessions: 10400 },
        { date: "2024-02", users: 6500, sessions: 13000 },
        { date: "2024-03", users: 7800, sessions: 15600 },
        { date: "2024-04", users: 9234, sessions: 18468 },
        { date: "2024-05", users: 11205, sessions: 22410 },
      ],
      revenueData: [
        { month: "Jan", revenue: 310000, subscriptions: 5100 },
        { month: "Feb", revenue: 380000, subscriptions: 6200 },
        { month: "Mar", revenue: 425000, subscriptions: 7600 },
        { month: "Apr", revenue: 510000, subscriptions: 8456 },
        { month: "May", revenue: 624800, subscriptions: 9840 },
      ],
    },
    { upsert: true },
  );

  // 8. Seed Waitlist
  await Waitlist.deleteMany({});
  await Waitlist.create([
    {
      name: "Michael Corleone",
      email: "michael@godfather.com",
      interest: "Executive",
      priority: "high",
      status: "pending",
    },
    {
      name: "Bruce Wayne",
      email: "bruce@waynecorp.com",
      interest: "Corporate",
      priority: "medium",
      status: "contacted",
    },
    {
      name: "Diana Prince",
      email: "diana@themyscira.gov",
      interest: "Non-profit",
      priority: "high",
      status: "converted",
    },
    {
      name: "Tony Stark",
      email: "tony@stark.industries",
      interest: "Technology",
      priority: "high",
      status: "pending",
    },
    {
      name: "Peter Parker",
      email: "peter@dailybugle.com",
      interest: "Individual",
      priority: "low",
      status: "pending",
    },
  ]);

  console.log("Comprehensive seeding complete! MongoDB is fully populated.");
}

if (process.env.RUN_SEED === "true") {
  seedInitialData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
