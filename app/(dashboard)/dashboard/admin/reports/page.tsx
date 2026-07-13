import type { Metadata } from "next";
import { ReportsDashboard } from "@/components/organisms/ReportsDashboard";

export const metadata: Metadata = {
  title: "Reports",
};

export default function AdminReportsPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Reports</h1>
      <ReportsDashboard />
    </div>
  );
}
