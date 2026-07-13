import type { Metadata } from "next";
import { ComplaintSubmissionFlow } from "@/components/organisms/ComplaintSubmissionFlow";

export const metadata: Metadata = {
  title: "Submit a Complaint",
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-6 text-center sm:mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl">
          Submit a Complaint
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)] sm:text-base">
          Works whether you&apos;re logged in or not — no account required.
        </p>
      </div>
      <ComplaintSubmissionFlow />
    </div>
  );
}
