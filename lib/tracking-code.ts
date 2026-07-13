import { getAdminDb } from "./firebase-admin";

export function generateTrackingCode(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000); // 4-digit
  return `CMP-${year}-${random}`;
}

export async function createUniqueTrackingCode(): Promise<string> {
  const db = getAdminDb();
  let code: string;
  let exists = true;
  do {
    code = generateTrackingCode();
    const snap = await db.collection("complaints").where("trackingCode", "==", code).get();
    exists = !snap.empty;
  } while (exists);
  return code;
}
