import type { Metadata } from "next";
import { TrackingLookup } from "@/components/organisms/TrackingLookup";

export const metadata: Metadata = {
  title: "Track a Complaint",
};

export default function TrackPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <TrackingLookup />
    </div>
  );
}
