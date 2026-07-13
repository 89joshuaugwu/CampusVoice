import { getAdminDb } from "./firebase-admin";
import type { Category } from "@/types/category";

export async function listCategories(): Promise<Category[]> {
  const db = getAdminDb();
  const snap = await db.collection("categories").orderBy("name", "asc").get();
  return snap.docs.map((d) => ({
    id: d.id,
    name: d.data().name,
    complaintCount: d.data().complaintCount ?? 0,
  }));
}

async function assertAdmin(uid: string | null): Promise<void> {
  if (!uid) throw new Error("Not authenticated.");
  const db = getAdminDb();
  const doc = await db.collection("users").doc(uid).get();
  if (doc.data()?.role !== "admin") throw new Error("Admin access required.");
}

export async function createCategory(uid: string | null, name: string): Promise<Category> {
  await assertAdmin(uid);
  const db = getAdminDb();
  const ref = await db.collection("categories").add({ name, complaintCount: 0 });
  return { id: ref.id, name, complaintCount: 0 };
}

export async function updateCategory(uid: string | null, id: string, name: string): Promise<void> {
  await assertAdmin(uid);
  const db = getAdminDb();
  await db.collection("categories").doc(id).update({ name });
}

export async function deleteCategory(uid: string | null, id: string): Promise<void> {
  await assertAdmin(uid);
  const db = getAdminDb();
  const doc = await db.collection("categories").doc(id).get();
  if (!doc.exists) throw new Error("Category not found.");
  const count = (doc.data()?.complaintCount as number) ?? 0;
  if (count > 0) {
    throw new Error(
      `Cannot delete "${doc.data()?.name}" — ${count} complaint(s) still reference it.`
    );
  }
  await doc.ref.delete();
}
