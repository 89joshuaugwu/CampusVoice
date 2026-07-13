import { Clock, Search, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComplaintStatus } from "@/types/complaint";

const config: Record<ComplaintStatus, { label: string; classes: string; icon: typeof Clock }> = {
  pending: {
    label: "Pending",
    classes: "bg-slate-100 text-slate-600 border-slate-200",
    icon: Clock,
  },
  in_review: {
    label: "In Review",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Search,
  },
  resolved: {
    label: "Resolved",
    classes: "bg-teal-50 text-teal-700 border-teal-200",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    classes: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
};

export function StatusBadge({ status, className }: { status: ComplaintStatus; className?: string }) {
  const c = config[status];
  const Icon = c.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        c.classes,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {c.label}
    </span>
  );
}
