"use client";

import { EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnonymousToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
}

export function AnonymousToggle({ checked, onChange }: AnonymousToggleProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-slate-50 p-4">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-150",
          checked ? "bg-[var(--color-primary)]" : "bg-slate-300"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-150",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
      <div>
        <p className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-primary)]">
          <EyeOff className="h-4 w-4 text-[var(--color-primary)]" />
          Submit anonymously
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-text-secondary)]">
          Your identity will not be shared with admin. Save your tracking code — it&apos;s the
          only way to check your complaint status later.
        </p>
      </div>
    </div>
  );
}
