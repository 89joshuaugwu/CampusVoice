export type UserRole = "student" | "admin";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  regNumber?: string;
  role: UserRole;
  createdAt: string;
}
