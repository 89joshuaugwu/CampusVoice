export interface Category {
  id: string;
  name: string;
  complaintCount: number;
}

export const DEFAULT_CATEGORIES = [
  "Academic",
  "Hostel/Accommodation",
  "ICT/Portal",
  "Harassment",
  "Financial",
  "Facilities",
  "Other",
] as const;

/** Categories that get the red-bordered visual priority treatment. */
export const SENSITIVE_CATEGORIES = ["Harassment"];
