import { cert, getApps, getApp, initializeApp, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// NOTE: On Vercel, FIREBASE_ADMIN_PRIVATE_KEY arrives with literal "\n"
// sequences instead of real newlines. The .replace() below is required —
// without it, cert() throws "Failed to parse private key" in production
// even though it works fine locally with a .env.local file.
function getAdminApp(): App {
  if (getApps().length) return getApp();

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Check FIREBASE_ADMIN_PROJECT_ID, " +
        "FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY env vars."
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

let _adminDb: ReturnType<typeof getFirestore> | null = null;
let _adminAuth: ReturnType<typeof getAuth> | null = null;

/** Lazily initialized so a missing env var only throws when a route actually runs, not at build time. */
export function getAdminDb() {
  if (!_adminDb) _adminDb = getFirestore(getAdminApp());
  return _adminDb;
}

export function getAdminAuth() {
  if (!_adminAuth) _adminAuth = getAuth(getAdminApp());
  return _adminAuth;
}
