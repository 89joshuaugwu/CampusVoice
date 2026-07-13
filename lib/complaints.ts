import { Timestamp, type Query, type DocumentData } from "firebase-admin/firestore";
import { getAdminDb } from "./firebase-admin";
import { createUniqueTrackingCode } from "./tracking-code";
import type {
  Complaint,
  ComplaintResponse,
  ComplaintStatus,
  ComplaintWithResponses,
  SubmitComplaintInput,
  SubmitComplaintResult,
} from "@/types/complaint";

function tsToIso(v: unknown): string {
  if (v instanceof Timestamp) return v.toDate().toISOString();
  if (typeof v === "string") return v;
  return new Date().toISOString();
}

function mapComplaint(id: string, data: DocumentData): Complaint {
  return {
    id,
    trackingCode: data.trackingCode,
    studentId: data.studentId ?? null,
    isAnonymous: !!data.isAnonymous,
    title: data.title,
    category: data.category,
    description: data.description,
    attachments: data.attachments ?? [],
    status: data.status,
    assignedTo: data.assignedTo ?? null,
    internalNotes: data.internalNotes ?? "",
    createdAt: tsToIso(data.createdAt),
    updatedAt: tsToIso(data.updatedAt),
  };
}

function mapResponse(id: string, data: DocumentData): ComplaintResponse {
  return {
    id,
    authorRole: data.authorRole,
    authorId: data.authorId ?? null,
    message: data.message,
    createdAt: tsToIso(data.createdAt),
  };
}

/** Per CONTEXT.md Section 4. Respects the anonymous toggle completely —
 *  studentId is null on the record whenever isAnonymous is true, regardless
 *  of whether the submitter was logged in. */
export async function submitComplaint(input: SubmitComplaintInput): Promise<SubmitComplaintResult> {
  const db = getAdminDb();
  const trackingCode = await createUniqueTrackingCode();

  const docRef = await db.collection("complaints").add({
    trackingCode,
    studentId: input.isAnonymous ? null : input.studentId,
    isAnonymous: input.isAnonymous,
    title: input.title,
    category: input.category,
    description: input.description,
    attachments: input.attachments,
    status: "pending" satisfies ComplaintStatus,
    assignedTo: null,
    internalNotes: "",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  await bumpCategoryCount(input.category, 1);

  return { complaintId: docRef.id, trackingCode };
}

/** Per CONTEXT.md Section 5. Server-only — NEVER exposes internalNotes. */
export async function getComplaintByTrackingCode(
  trackingCode: string
): Promise<ComplaintWithResponses> {
  const db = getAdminDb();
  const snap = await db.collection("complaints").where("trackingCode", "==", trackingCode).limit(1).get();
  if (snap.empty) throw new Error("No complaint found for this code.");

  const doc = snap.docs[0];
  if (!doc) throw new Error("No complaint found for this code.");
  const complaint = mapComplaint(doc.id, doc.data());
  const responses = await getResponses(doc.id);

  // internalNotes NEVER returned via the public tracking route
  const { internalNotes: _internalNotes, ...safe } = complaint;
  void _internalNotes;

  return { ...safe, responses };
}

/** Used by student dashboard + admin queue — id-based, still strips notes unless includeInternal is set. */
export async function getComplaintById(
  id: string,
  includeInternal = false
): Promise<ComplaintWithResponses> {
  const db = getAdminDb();
  const doc = await db.collection("complaints").doc(id).get();
  if (!doc.exists) throw new Error("Complaint not found.");

  const complaint = mapComplaint(doc.id, doc.data() as DocumentData);
  const responses = await getResponses(id);

  if (!includeInternal) {
    const { internalNotes: _internalNotes, ...safe } = complaint;
    void _internalNotes;
    return { ...safe, responses };
  }
  return { ...complaint, responses };
}

async function getResponses(complaintId: string): Promise<ComplaintResponse[]> {
  const db = getAdminDb();
  const snap = await db
    .collection("complaints")
    .doc(complaintId)
    .collection("responses")
    .orderBy("createdAt", "asc")
    .get();
  return snap.docs.map((d) => mapResponse(d.id, d.data()));
}

async function getUserRole(uid: string): Promise<"student" | "admin" | null> {
  const db = getAdminDb();
  const doc = await db.collection("users").doc(uid).get();
  if (!doc.exists) return null;
  return (doc.data()?.role as "student" | "admin") ?? null;
}

/** Per CONTEXT.md Section 6. Authorization: admin OR owning student OR valid tracking code. */
export async function addResponse(
  complaintId: string,
  trackingCode: string | null,
  authenticatedUid: string | null,
  message: string
): Promise<ComplaintResponse> {
  const db = getAdminDb();
  const complaintRef = db.collection("complaints").doc(complaintId);
  const complaintSnap = await complaintRef.get();
  if (!complaintSnap.exists) throw new Error("Complaint not found.");
  const data = complaintSnap.data() as DocumentData;

  const role = authenticatedUid ? await getUserRole(authenticatedUid) : null;
  const isAdmin = role === "admin";
  const isOwningStudent = !!authenticatedUid && data.studentId === authenticatedUid;
  const isValidTrackingCode = !!trackingCode && data.trackingCode === trackingCode;

  if (!isAdmin && !isOwningStudent && !isValidTrackingCode) {
    throw new Error("Not authorized to reply to this complaint.");
  }

  const responseData = {
    authorRole: isAdmin ? "admin" : "complainant",
    // complainant identity is never recorded, even if they're logged in and replying via tracking code
    authorId: isAdmin ? authenticatedUid : null,
    message,
    createdAt: Timestamp.now(),
  };

  const responseRef = await complaintRef.collection("responses").add(responseData);
  await complaintRef.update({ updatedAt: Timestamp.now() });

  if (isAdmin && data.studentId) {
    await notifyStudent(data.studentId, complaintId, "new_response", "New response on your complaint");
  }

  return mapResponse(responseRef.id, responseData);
}

export async function updateStatus(
  complaintId: string,
  authenticatedUid: string | null,
  status: ComplaintStatus
): Promise<void> {
  const role = authenticatedUid ? await getUserRole(authenticatedUid) : null;
  if (role !== "admin") throw new Error("Only admins can change complaint status.");

  const db = getAdminDb();
  const complaintRef = db.collection("complaints").doc(complaintId);
  const snap = await complaintRef.get();
  if (!snap.exists) throw new Error("Complaint not found.");
  const data = snap.data() as DocumentData;

  const wasResolved = data.status === "resolved";
  await complaintRef.update({
    status,
    assignedTo: authenticatedUid,
    updatedAt: Timestamp.now(),
    ...(status === "resolved" && !wasResolved ? { resolvedAt: Timestamp.now() } : {}),
  });

  if (data.studentId) {
    const label = status.replace("_", " ");
    await notifyStudent(
      data.studentId,
      complaintId,
      "status_change",
      `Your complaint ${data.trackingCode} status changed to ${label}`
    );
  }
}

export async function updateInternalNotes(
  complaintId: string,
  authenticatedUid: string | null,
  internalNotes: string
): Promise<void> {
  const role = authenticatedUid ? await getUserRole(authenticatedUid) : null;
  if (role !== "admin") throw new Error("Only admins can edit internal notes.");

  const db = getAdminDb();
  await db.collection("complaints").doc(complaintId).update({
    internalNotes,
    updatedAt: Timestamp.now(),
  });
}

async function notifyStudent(
  uid: string,
  complaintId: string,
  type: "status_change" | "new_response",
  message: string
): Promise<void> {
  const db = getAdminDb();
  await db.collection("notifications").doc(uid).collection("items").add({
    type,
    message,
    complaintId,
    read: false,
    createdAt: Timestamp.now(),
  });
}

async function bumpCategoryCount(categoryName: string, delta: number): Promise<void> {
  const db = getAdminDb();
  const snap = await db.collection("categories").where("name", "==", categoryName).limit(1).get();
  if (snap.empty) return;
  const first = snap.docs[0];
  if (!first) return;
  const ref = first.ref;
  await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const current = (doc.data()?.complaintCount as number) ?? 0;
    tx.update(ref, { complaintCount: Math.max(0, current + delta) });
  });
}

export interface QueueFilters {
  status?: ComplaintStatus;
  category?: string;
}

/** Admin-only queue listing — role check happens in the calling API route. */
export async function listComplaints(filters: QueueFilters = {}): Promise<Complaint[]> {
  const db = getAdminDb();
  let q: Query<DocumentData> = db.collection("complaints");
  if (filters.status) q = q.where("status", "==", filters.status);
  if (filters.category) q = q.where("category", "==", filters.category);
  q = q.orderBy("createdAt", "desc");
  const snap = await q.get();
  return snap.docs.map((d) => mapComplaint(d.id, d.data()));
}

/** Student's own, non-anonymous complaints only — matches CONTEXT.md's note that
 *  complaints submitted anonymously while logged in are correctly unreachable here. */
export async function listComplaintsForStudent(uid: string): Promise<Complaint[]> {
  const db = getAdminDb();
  const snap = await db
    .collection("complaints")
    .where("studentId", "==", uid)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => mapComplaint(d.id, d.data()));
}

export interface ReportsData {
  totalComplaints: number;
  resolvedThisMonth: number;
  avgResolutionDays: number | null;
  byCategory: { category: string; count: number }[];
  byStatus: { status: ComplaintStatus; count: number }[];
  volumeTrend: { month: string; count: number }[];
}

interface RawComplaintRecord {
  id: string;
  category: string;
  status: ComplaintStatus;
  createdAt: Timestamp | string;
  resolvedAt?: Timestamp | string;
}

export async function getReportsData(): Promise<ReportsData> {
  const db = getAdminDb();
  const snap = await db.collection("complaints").get();
  const all: RawComplaintRecord[] = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      category: data.category,
      status: data.status,
      createdAt: data.createdAt,
      resolvedAt: data.resolvedAt,
    };
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const byCategoryMap = new Map<string, number>();
  const byStatusMap = new Map<string, number>();
  const volumeMap = new Map<string, number>();
  let resolvedThisMonth = 0;
  let resolutionDaysSum = 0;
  let resolutionCount = 0;

  for (const c of all) {
    byCategoryMap.set(c.category, (byCategoryMap.get(c.category) ?? 0) + 1);
    byStatusMap.set(c.status, (byStatusMap.get(c.status) ?? 0) + 1);

    const createdAt = c.createdAt instanceof Timestamp ? c.createdAt.toDate() : new Date(c.createdAt);
    const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
    volumeMap.set(monthKey, (volumeMap.get(monthKey) ?? 0) + 1);

    if (c.status === "resolved" && c.resolvedAt) {
      const resolvedAt = c.resolvedAt instanceof Timestamp ? c.resolvedAt.toDate() : new Date(c.resolvedAt);
      if (resolvedAt >= startOfMonth) resolvedThisMonth++;
      const days = (resolvedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      resolutionDaysSum += days;
      resolutionCount++;
    }
  }

  const volumeTrend = Array.from(volumeMap.entries())
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([month, count]) => ({ month, count }))
    .slice(-6);

  return {
    totalComplaints: all.length,
    resolvedThisMonth,
    avgResolutionDays: resolutionCount ? Number((resolutionDaysSum / resolutionCount).toFixed(1)) : null,
    byCategory: Array.from(byCategoryMap.entries()).map(([category, count]) => ({ category, count })),
    byStatus: Array.from(byStatusMap.entries()).map(([status, count]) => ({
      status: status as ComplaintStatus,
      count,
    })),
    volumeTrend,
  };
}
