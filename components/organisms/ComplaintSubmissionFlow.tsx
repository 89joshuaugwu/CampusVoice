"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { ComplaintForm, type ComplaintFormValues } from "@/components/molecules/ComplaintForm";
import { TrackingCodeDisplay } from "@/components/ui/TrackingCodeDisplay";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { authedJson } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

export function ComplaintSubmissionFlow() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ trackingCode: string } | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  async function handleSubmit(values: ComplaintFormValues) {
    setSubmitting(true);
    try {
      const data = await authedJson<{ complaintId: string; trackingCode: string }>(
        "/api/complaints/submit",
        { method: "POST", body: JSON.stringify(values) }
      );
      setResult(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit complaint.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="space-y-5 p-6 text-center sm:p-8">
          <CheckCircle2 className="mx-auto h-12 w-12 text-[var(--color-accent)]" />
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Complaint submitted</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            This is the only place your tracking code is shown. Save it now.
          </p>
          <TrackingCodeDisplay code={result.trackingCode} />
          <label className="flex items-start gap-2.5 text-left text-sm text-[var(--color-text-primary)]">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)]"
            />
            I&apos;ve saved my tracking code somewhere safe.
          </label>
          <Button
            size="lg"
            className="w-full"
            disabled={!confirmed}
            onClick={() => router.push(user ? "/dashboard/my-complaints" : "/")}
          >
            I&apos;ve saved my code — Continue
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="p-5 sm:p-8">
      {!loading && !user && (
        <div className="mb-5 rounded-xl bg-blue-50 px-4 py-3 text-sm text-[var(--color-primary-dark)]">
          Submitting anonymously? Toggle it on below. Or{" "}
          <a href="/auth/login" className="font-semibold underline">
            log in
          </a>{" "}
          to track complaints automatically in your dashboard.
        </div>
      )}
      <ComplaintForm isLoggedIn={!!user} submitting={submitting} onSubmit={handleSubmit} />
    </Card>
  );
}
