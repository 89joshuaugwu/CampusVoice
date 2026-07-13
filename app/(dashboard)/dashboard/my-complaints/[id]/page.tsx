"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, Spinner } from "@/components/ui/Card";
import { ComplaintThreadView } from "@/components/organisms/ComplaintThreadView";
import { authedJson } from "@/lib/api-client";
import type { ComplaintWithResponses } from "@/types/complaint";

export default function MyComplaintDetailPage() {
  const params = useParams<{ id: string }>();
  const [complaint, setComplaint] = useState<ComplaintWithResponses | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authedJson<ComplaintWithResponses>(`/api/complaints/${params.id}`);
      setComplaint(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load complaint.");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="mx-auto max-w-2xl py-10 text-center text-sm text-[var(--color-error)]">
        {error ?? "Complaint not found."}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="min-h-[65vh]">
        <ComplaintThreadView complaint={complaint} authContext="student" onReplySent={load} />
      </Card>
    </div>
  );
}
