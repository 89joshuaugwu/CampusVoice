"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { Card, Spinner } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ComplaintCard } from "@/components/molecules/ComplaintCard";
import { authedJson } from "@/lib/api-client";
import type { Complaint } from "@/types/complaint";

export default function MyComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authedJson<Complaint[]>("/api/complaints?mine=1")
      .then(setComplaints)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">My Complaints</h1>
        <Link href="/submit">
          <Button size="sm">
            <FilePlus2 className="h-4 w-4" />
            New
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : complaints.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
            You haven&apos;t submitted any complaints yet.
          </p>
          <Link href="/submit">
            <Button>Submit one</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {complaints.map((c) => (
            <ComplaintCard key={c.id} complaint={c} href={`/dashboard/my-complaints/${c.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
