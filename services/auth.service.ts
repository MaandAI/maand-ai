import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  getIdToken,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserProfile, getUserProfile } from "./user.service";

const setSessionCookie = async (user: User) => {
  const token = await getIdToken(user, true);
  await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
};

const clearSessionCookie = async () => {
  await fetch("/api/auth/logout", { method: "POST" });
};

export const loginWithEmail = async (
  email: string,
  password: string,
): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );
  await setSessionCookie(userCredential.user);
  return userCredential.user;
};

export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string = "",
): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = userCredential.user;

  await createUserProfile(user.uid, {
    email: user.email,
    displayName: displayName || user.displayName,
    photoURL: user.photoURL,
    role: "user",
  });

  await setSessionCookie(user);
  return user;
};

export const loginWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;

  const profile = await getUserProfile(user.uid);
  if (!profile) {
    await createUserProfile(user.uid, {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: "user",
    });
  }

  await setSessionCookie(user);
  return user;
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
  await clearSessionCookie();
};
