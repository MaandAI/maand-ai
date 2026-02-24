import * as admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    console.log(
      "firebase admin init",
      process.env.FIREBASE_ADMIN_PROJECT_ID,
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    );
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n",
        ),
      }),
    });
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
