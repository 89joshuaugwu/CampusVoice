"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CategoryTag } from "@/components/ui/CategoryTag";
import { Select } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Card";
import { cn, formatDate } from "@/lib/utils";
import { authedJson } from "@/lib/api-client";
import { SENSITIVE_CATEGORIES } from "@/types/category";
import type { Complaint, ComplaintStatus } from "@/types/complaint";

const TABS: { label: string; value: ComplaintStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "In Review", value: "in_review" },
  { label: "Resolved", value: "resolved" },
  { label: "Rejected", value: "rejected" },
];

export function AdminQueueTable() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ComplaintStatus | "all">("all");
  const [category, setCategory] = useState("all");
  const [sortDesc, setSortDesc] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (tab !== "all") params.set("status", tab);
    if (category !== "all") params.set("category", category);

    authedJson<Complaint[]>(`/api/complaints?${params.toString()}`)
      .then(setComplaints)
      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not load queue."))
      .finally(() => setLoading(false));
  }, [tab, category]);

  const categories = useMemo(() => {
    const set = new Set(complaints.map((c) => c.category));
    return Array.from(set).sort();
  }, [complaints]);

  const sorted = useMemo(() => {
    return [...complaints].sort((a, b) =>
      sortDesc
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [complaints, sortDesc]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 overflow-x-auto no-scrollbar rounded-xl bg-slate-100 p-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                tab === t.value
                  ? "bg-white text-[var(--color-primary)] shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-auto min-h-0 py-1.5 text-sm"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <button
          onClick={() => setSortDesc((s) => !s)}
          className="ml-auto text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
        >
          Date {sortDesc ? "↓ Newest" : "↑ Oldest"}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] py-12 text-center text-sm text-[var(--color-text-secondary)]">
          Queue is empty — nothing pending review.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-[var(--color-border)] sm:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-[var(--color-text-secondary)]">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c) => (
                  <QueueRow key={c.id} complaint={c} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 sm:hidden">
            {sorted.map((c) => (
              <QueueCard key={c.id} complaint={c} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function QueueRow({ complaint }: { complaint: Complaint }) {
  const sensitive = SENSITIVE_CATEGORIES.includes(complaint.category);
  return (
    <tr
      className={cn(
        "border-t border-[var(--color-border)] hover:bg-slate-50",
        sensitive && "border-l-4 border-l-[var(--color-error)]"
      )}
    >
      <td className="px-4 py-3">
        <Link href={`/dashboard/admin/queue/${complaint.id}`} className="font-mono text-xs text-[var(--color-primary)] hover:underline">
          {complaint.trackingCode}
        </Link>
      </td>
      <td className="max-w-xs truncate px-4 py-3 font-medium text-[var(--color-text-primary)]">
        <Link href={`/dashboard/admin/queue/${complaint.id}`} className="flex items-center gap-1.5">
          {complaint.isAnonymous && <EyeOff className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
          <span className="truncate">{complaint.title}</span>
        </Link>
      </td>
      <td className="px-4 py-3">
        <CategoryTag category={complaint.category} />
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={complaint.status} />
      </td>
      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{formatDate(complaint.createdAt)}</td>
    </tr>
  );
}

function QueueCard({ complaint }: { complaint: Complaint }) {
  const sensitive = SENSITIVE_CATEGORIES.includes(complaint.category);
  return (
    <Link
      href={`/dashboard/admin/queue/${complaint.id}`}
      className={cn(
        "block rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm",
        sensitive && "border-l-4 border-l-[var(--color-error)]"
      )}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <p className="font-mono text-xs text-[var(--color-text-secondary)]">{complaint.trackingCode}</p>
        <StatusBadge status={complaint.status} />
      </div>
      <p className="mb-2 flex items-center gap-1.5 font-medium text-[var(--color-text-primary)]">
        {complaint.isAnonymous && <EyeOff className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
        {complaint.title}
      </p>
      <div className="flex items-center justify-between">
        <CategoryTag category={complaint.category} />
        <span className="text-xs text-[var(--color-text-secondary)]">{formatDate(complaint.createdAt)}</span>
      </div>
    </Link>
  );
}
