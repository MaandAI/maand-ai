import { adminDb } from "../backend/config/firebase-admin";

export async function seedInitialData() {
  console.log("Starting DB seed...");
  const batch = adminDb.batch();

  // 1. Seed Therapy Modules
  const modules = [
    {
      id: "module-1",
      name: "AI-Assisted Therapy",
      description: "CBT-based conversations with empathetic AI",
      icon: "Brain",
      totalSessions: 20,
    },
    {
      id: "module-2",
      name: "Immersive Therapy Environments",
      description: "VR exposure therapy for anxiety disorders",
      icon: "Glasses",
      totalSessions: 20,
    },
    {
      id: "module-3",
      name: "Progress Tracking",
      description: "Comprehensive analytics and monitoring",
      icon: "TrendingUp",
      totalSessions: 12,
    },
  ];

  modules.forEach((mod) => {
    const ref = adminDb.collection("therapy_modules").doc(mod.id);
    batch.set(ref, {
      ...mod,
      status: "active",
      progress: 0,
      sessionsCompleted: 0,
    });
  });

  // 2. Seed Mock Admin User & Seed Notifications referencing it
  const adminId = "admin_seed_id";
  const userRef = adminDb.collection("users").doc(adminId);
  batch.set(userRef, {
    uid: adminId,
    email: "admin@maand.tech",
    displayName: "Admin User",
    role: "admin",
    status: "active",
    subscription: "enterprise",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Notifications
  const notifRef1 = adminDb
    .collection("users")
    .doc(adminId)
    .collection("notifications")
    .doc();
  const notifRef2 = adminDb
    .collection("users")
    .doc(adminId)
    .collection("notifications")
    .doc();
  const notifRef3 = adminDb
    .collection("users")
    .doc(adminId)
    .collection("notifications")
    .doc();
  batch.set(notifRef1, {
    title: "Welcome to Maand",
    message: "Your account has been created.",
    type: "success",
    read: false,
    createdAt: new Date(Date.now() - 100000),
  });
  batch.set(notifRef2, {
    title: "New Module Available",
    message: "Check out Immersive VR!",
    type: "info",
    read: false,
    createdAt: new Date(Date.now() - 50000),
  });
  batch.set(notifRef3, {
    title: "Session Reminder",
    message: "You have a scheduled session in 1 hour",
    type: "warning",
    read: true,
    createdAt: new Date(Date.now() - 200000),
  });

  // 3. Seed Dashboard Analytics Stats
  const overviewRef = adminDb.collection("analytics").doc("dashboard_overview");
  batch.set(overviewRef, {
    totalUsers: 12847,
    activeUsers: 9234,
    totalRevenue: 487250,
    subscriptions: 8456,
    userGrowth: 12.5,
    revenueGrowth: 23.8,
    updatedAt: new Date(),
  });

  const activityRef1 = adminDb
    .collection("analytics")
    .doc("dashboard_overview")
    .collection("user_activity")
    .doc();
  const activityRef2 = adminDb
    .collection("analytics")
    .doc("dashboard_overview")
    .collection("user_activity")
    .doc();
  batch.set(activityRef1, { date: "2024-04", users: 7800, sessions: 15600 });
  batch.set(activityRef2, { date: "2024-05", users: 9234, sessions: 18468 });

  const revenueRef1 = adminDb
    .collection("analytics")
    .doc("dashboard_overview")
    .collection("revenue_data")
    .doc();
  const revenueRef2 = adminDb
    .collection("analytics")
    .doc("dashboard_overview")
    .collection("revenue_data")
    .doc();
  batch.set(revenueRef1, {
    month: "Apr",
    revenue: 425000,
    subscriptions: 7600,
  });
  batch.set(revenueRef2, {
    month: "May",
    revenue: 487250,
    subscriptions: 8456,
  });

  // 4. Seed Waitlist
  const waitlistRef1 = adminDb.collection("waitlist").doc();
  const waitlistRef2 = adminDb.collection("waitlist").doc();
  batch.set(waitlistRef1, {
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    interest: "Individual",
    priority: "high",
    status: "contacted",
    joinedAt: new Date(),
  });
  batch.set(waitlistRef2, {
    name: "Dr. Chen",
    email: "dr.chen@clinic.com",
    interest: "Clinical",
    priority: "high",
    status: "pending",
    joinedAt: new Date(),
  });

  try {
    await batch.commit();
    console.log(
      "Seeding complete! You successfully bootstrapped the database.",
    );
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Allow running this script directly using e.g., ts-node
if (require.main === module) {
  seedInitialData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
