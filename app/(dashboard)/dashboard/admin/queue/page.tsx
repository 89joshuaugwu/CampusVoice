import type { Metadata } from "next";
import { AdminQueueTable } from "@/components/organisms/AdminQueueTable";

export const metadata: Metadata = {
  title: "Admin Queue",
};

export default function AdminQueuePage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Complaint Queue</h1>
      <AdminQueueTable />
    </div>
  );
}
