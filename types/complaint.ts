export type ComplaintStatus = "pending" | "in_review" | "resolved" | "rejected";

export interface Complaint {
  id: string;
  trackingCode: string;
  studentId: string | null;
  isAnonymous: boolean;
  title: string;
  category: string;
  description: string;
  attachments: string[];
  status: ComplaintStatus;
  assignedTo: string | null;
  internalNotes?: string; // never present on public/student-facing responses
  createdAt: string; // ISO string over the wire
  updatedAt: string;
}

export interface ComplaintResponse {
  id: string;
  authorRole: "admin" | "complainant";
  authorId: string | null;
  message: string;
  createdAt: string;
}

export interface ComplaintWithResponses extends Complaint {
  responses: ComplaintResponse[];
}

export type AuthContext = "public" | "student" | "admin";

export interface SubmitComplaintInput {
  title: string;
  category: string;
  description: string;
  attachments: string[];
  isAnonymous: boolean;
  studentId: string | null;
}

export interface SubmitComplaintResult {
  complaintId: string;
  trackingCode: string;
}
