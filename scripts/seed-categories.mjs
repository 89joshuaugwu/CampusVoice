/**
 * Run once, after your first deploy, to pre-populate the default complaint
 * categories so they show up in both the Submit form and the admin
 * Categories manager immediately (instead of appearing only after someone
 * submits the very first complaint of that type).
 *
 * Usage:
 *   1. Place your Firebase Admin service account JSON at ./serviceAccountKey.json
 *      (Project Settings > Service Accounts > Generate new private key)
 *      — DO NOT commit this file, it's already covered by .gitignore.
 *   2. node scripts/seed-categories.mjs
 */
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(readFileSync(new URL("../campusvoice-admin-sdk.json", import.meta.url)));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const DEFAULT_CATEGORIES = [
  "Academic",
  "Hostel/Accommodation",
  "ICT/Portal",
  "Harassment",
  "Financial",
  "Facilities",
  "Other",
];

async function seed() {
  const existing = await db.collection("categories").get();
  const existingNames = new Set(existing.docs.map((d) => d.data().name));

  for (const name of DEFAULT_CATEGORIES) {
    if (existingNames.has(name)) {
      console.log(`skip (exists): ${name}`);
      continue;
    }
    await db.collection("categories").add({ name, complaintCount: 0 });
    console.log(`created: ${name}`);
  }

  console.log("Done.");
}

seed().then(() => process.exit(0));
