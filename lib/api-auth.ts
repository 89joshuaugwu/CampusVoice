import type { NextRequest } from "next/server";
import { getAdminAuth } from "./firebase-admin";

/** Returns the verified uid from an Authorization: Bearer <idToken> header, or null if absent/invalid. */
export async function getAuthedUid(req: NextRequest): Promise<string | null> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length);
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}
