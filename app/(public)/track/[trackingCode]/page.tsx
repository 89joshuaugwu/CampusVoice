"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Card, Spinner } from "@/components/ui/Card";
import { ComplaintThreadView } from "@/components/organisms/ComplaintThreadView";
import type { ComplaintWithResponses } from "@/types/complaint";

export default function TrackDetailPage() {
  const params = useParams<{ trackingCode: string }>();
  const trackingCode = decodeURIComponent(params.trackingCode ?? "").toUpperCase();

  const [complaint, setComplaint] = useState<ComplaintWithResponses | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/complaints/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No complaint found for this code.");
      setComplaint(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No complaint found for this code.");
    } finally {
      setLoading(false);
    }
  }, [trackingCode]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-[var(--color-error)]" />
        <h1 className="mb-2 text-lg font-semibold text-[var(--color-text-primary)]">
          No complaint found for this code
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Check for typos in <span className="font-mono">{trackingCode}</span> and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <Card className="min-h-[60vh]">
        <ComplaintThreadView
          complaint={complaint}
          authContext="public"
          trackingCode={trackingCode}
          onReplySent={load}
        />
      </Card>
    </div>
  );
}
