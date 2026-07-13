"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function TrackingCodeDisplay({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — user can still select/screenshot the text
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-[var(--color-primary)]/30 bg-blue-50/50 p-6 sm:p-8",
        className
      )}
    >
      <p className="font-mono text-3xl font-bold tracking-wider text-[var(--color-primary-dark)] sm:text-4xl">
        {code}
      </p>
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-[var(--color-primary)] border border-[var(--color-primary)]/30 hover:bg-blue-50 transition-colors min-h-[44px]"
      >
        {copied ? <Check className="h-4 w-4 text-[var(--color-accent)]" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied!" : "Copy code"}
      </button>
    </div>
  );
}
