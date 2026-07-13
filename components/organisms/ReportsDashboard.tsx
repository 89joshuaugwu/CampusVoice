"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, Printer } from "lucide-react";
import toast from "react-hot-toast";
import { Card, Spinner } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { authedJson } from "@/lib/api-client";
import type { ReportsData } from "@/lib/complaints";

const STATUS_COLORS: Record<string, string> = {
  pending: "#64748B",
  in_review: "#D97706",
  resolved: "#0D9488",
  rejected: "#DC2626",
};

export function ReportsDashboard() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authedJson<ReportsData>("/api/reports")
      .then(setData)
      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not load reports."))
      .finally(() => setLoading(false));
  }, []);

  function exportCsv() {
    if (!data) return;
    const rows = [
      ["Metric", "Value"],
      ["Total complaints", String(data.totalComplaints)],
      ["Resolved this month", String(data.resolvedThisMonth)],
      ["Avg resolution (days)", data.avgResolutionDays !== null ? String(data.avgResolutionDays) : "N/A"],
      [],
      ["Category", "Count"],
      ...data.byCategory.map((c) => [c.category, String(c.count)]),
      [],
      ["Status", "Count"],
      ...data.byStatus.map((s) => [s.status, String(s.count)]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campusvoice-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-end gap-2 print:hidden">
        <Button variant="secondary" size="sm" onClick={exportCsv}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
        <Button variant="secondary" size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
            Total complaints
          </p>
          <p className="mt-1 text-3xl font-bold text-[var(--color-text-primary)]">{data.totalComplaints}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
            Resolved this month
          </p>
          <p className="mt-1 text-3xl font-bold text-[var(--color-accent)]">{data.resolvedThisMonth}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
            Avg resolution time
          </p>
          <p className="mt-1 text-3xl font-bold text-[var(--color-text-primary)]">
            {data.avgResolutionDays !== null ? `${data.avgResolutionDays}d` : "—"}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">Complaints by category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.byCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#1E40AF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">Status distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data.byStatus}
                dataKey="count"
                nameKey="status"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {data.byStatus.map((s) => (
                  <Cell key={s.status} fill={STATUS_COLORS[s.status] ?? "#64748B"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {data.byStatus.map((s) => (
              <span key={s.status} className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: STATUS_COLORS[s.status] ?? "#64748B" }}
                />
                {s.status.replace("_", " ")} ({s.count})
              </span>
            ))}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">Volume trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.volumeTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#0D9488" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
