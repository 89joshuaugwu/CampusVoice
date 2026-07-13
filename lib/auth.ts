"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";
import type { UserRole } from "@/types/user";

// The cookie below is a UX convenience only — it lets middleware.ts do a fast
// edge-side redirect away from /dashboard/admin/* for obviously-non-admin
// visitors. It is NOT the security boundary: every admin-only mutation is
// re-checked server-side against the /users/{uid}.role field in Firestore
// (see lib/categories.ts, lib/complaints.ts), because a client-set cookie
// can always be forged.
function setRoleCookie(role: UserRole) {
  document.cookie = `cv_role=${role}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
}
function clearRoleCookie() {
  document.cookie = "cv_role=; path=/; max-age=0";
}

async function ensureUserDoc(uid: string, email: string, displayName: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid,
      email,
      displayName,
      role: "student",
      createdAt: serverTimestamp(),
    });
    setRoleCookie("student");
    return "student" as UserRole;
  }
  const role = (snap.data().role as UserRole) ?? "student";
  setRoleCookie(role);
  return role;
}

export async function signUpStudent(params: {
  email: string;
  password: string;
  displayName: string;
  regNumber?: string;
}) {
  const cred = await createUserWithEmailAndPassword(auth, params.email, params.password);
  await updateProfile(cred.user, { displayName: params.displayName });
  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    email: params.email,
    displayName: params.displayName,
    regNumber: params.regNumber ?? "",
    role: "student",
    createdAt: serverTimestamp(),
  });
  setRoleCookie("student");
  return cred.user;
}

export async function loginWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserDoc(cred.user.uid, cred.user.email ?? "", cred.user.displayName ?? "");
  return cred.user;
}

export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  await ensureUserDoc(cred.user.uid, cred.user.email ?? "", cred.user.displayName ?? "Student");
  return cred.user;
}

export async function logout() {
  await signOut(auth);
  clearRoleCookie();
}

export async function getCurrentUserRole(uid: string): Promise<UserRole | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return (snap.data().role as UserRole) ?? null;
}

/** Friendlier messages for the common Firebase Auth error codes. */
export function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists — try logging in instead.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/too-many-requests":
      return "Too many attempts — wait a moment and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}
