"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function TrackingLookup() {
  const [code, setCode] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    router.push(`/track/${encodeURIComponent(trimmed)}`);
  }

  return (
    <Card className="mx-auto max-w-md p-6 sm:p-8">
      <h2 className="mb-1 text-xl font-bold text-[var(--color-text-primary)]">Check complaint status</h2>
      <p className="mb-5 text-sm text-[var(--color-text-secondary)]">
        Enter the tracking code you saved when you submitted your complaint.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="CMP-2026-0043"
          className="font-mono uppercase"
          aria-label="Tracking code"
        />
        <Button type="submit" size="md" className="sm:shrink-0">
          <Search className="h-4 w-4" />
          Track
        </Button>
      </form>
    </Card>
  );
}
