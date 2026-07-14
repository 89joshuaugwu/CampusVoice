import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CategoryTag } from "@/components/ui/CategoryTag";
import { formatDate } from "@/lib/utils";
import type { Complaint } from "@/types/complaint";

export function ComplaintCard({ complaint, href }: { complaint: Complaint; href: string }) {
  return (
    <Link href={href} className="block w-full min-w-0">
      <Card className="flex min-w-0 items-center justify-between gap-3 p-4 transition-shadow hover:shadow-md">
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="truncate font-mono text-xs text-[var(--color-text-secondary)]">
            {complaint.trackingCode}
          </p>
          <p className="line-clamp-2 break-words font-semibold text-[var(--color-text-primary)]">
            {complaint.title}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <CategoryTag category={complaint.category} />
            <StatusBadge status={complaint.status} />
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">{formatDate(complaint.createdAt)}</p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
      </Card>
    </Link>
  );
}
