"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FilePlus2, Inbox, ListChecks, BarChart3, Tags } from "lucide-react";
import { Card, Spinner } from "@/components/ui/Card";
import { ComplaintCard } from "@/components/molecules/ComplaintCard";
import { useAuth } from "@/lib/auth-context";
import { authedJson } from "@/lib/api-client";
import type { Complaint } from "@/types/complaint";
import type { ReportsData } from "@/lib/complaints";

export default function DashboardHomePage() {
  const { role, displayName } = useAuth();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Welcome{displayName ? `, ${displayName.split(" ")[0]}` : ""}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {role === "admin" ? "Here's what needs your attention." : "Here's a quick look at your complaints."}
        </p>
      </div>

      {role === "admin" ? <AdminHome /> : <StudentHome />}
    </div>
  );
}

function StudentHome() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authedJson<Complaint[]>("/api/complaints?mine=1")
      .then(setComplaints)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link href="/submit">
          <Card className="flex items-center gap-3 p-5 transition-shadow hover:shadow-md">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
              <FilePlus2 className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="font-semibold text-[var(--color-text-primary)]">Submit a complaint</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Anonymous or logged in</p>
            </div>
          </Card>
        </Link>
        <Link href="/dashboard/my-complaints">
          <Card className="flex items-center gap-3 p-5 transition-shadow hover:shadow-md">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50">
              <ListChecks className="h-5 w-5 text-[var(--color-accent)]" />
            </div>
            <div>
              <p className="font-semibold text-[var(--color-text-primary)]">My complaints</p>
              <p className="text-xs text-[var(--color-text-secondary)]">{complaints.length} filed</p>
            </div>
          </Card>
        </Link>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
          Recent
        </h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : complaints.length === 0 ? (
          <Card className="p-8 text-center text-sm text-[var(--color-text-secondary)]">
            You haven&apos;t submitted any complaints while logged in yet.
          </Card>
        ) : (
          <div className="space-y-2.5">
            {complaints.slice(0, 3).map((c) => (
              <ComplaintCard key={c.id} complaint={c} href={`/dashboard/my-complaints/${c.id}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminHome() {
  const [stats, setStats] = useState<ReportsData | null>(null);

  useEffect(() => {
    authedJson<ReportsData>("/api/reports").then(setStats).catch(() => {});
  }, []);

  const pending = stats?.byStatus.find((s) => s.status === "pending")?.count ?? 0;
  const inReview = stats?.byStatus.find((s) => s.status === "in_review")?.count ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-[var(--color-text-secondary)]">Total</p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats?.totalComplaints ?? "—"}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-[var(--color-text-secondary)]">Pending</p>
          <p className="text-2xl font-bold text-[var(--color-neutral)]">{pending}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-[var(--color-text-secondary)]">In Review</p>
          <p className="text-2xl font-bold text-[var(--color-warning)]">{inReview}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-[var(--color-text-secondary)]">Resolved (mo.)</p>
          <p className="text-2xl font-bold text-[var(--color-accent)]">{stats?.resolvedThisMonth ?? "—"}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link href="/dashboard/admin/queue">
          <Card className="flex items-center gap-3 p-5 transition-shadow hover:shadow-md">
            <Inbox className="h-5 w-5 text-[var(--color-primary)]" />
            <p className="font-semibold text-[var(--color-text-primary)]">Queue</p>
          </Card>
        </Link>
        <Link href="/dashboard/admin/categories">
          <Card className="flex items-center gap-3 p-5 transition-shadow hover:shadow-md">
            <Tags className="h-5 w-5 text-[var(--color-primary)]" />
            <p className="font-semibold text-[var(--color-text-primary)]">Categories</p>
          </Card>
        </Link>
        <Link href="/dashboard/admin/reports">
          <Card className="flex items-center gap-3 p-5 transition-shadow hover:shadow-md">
            <BarChart3 className="h-5 w-5 text-[var(--color-primary)]" />
            <p className="font-semibold text-[var(--color-text-primary)]">Reports</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
