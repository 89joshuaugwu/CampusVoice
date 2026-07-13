import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={cn("h-8 w-8", className)} aria-hidden="true">
      <path
        d="M60 15 C30 15 10 35 10 60 C10 75 18 88 30 95 L25 110 L42 103 C48 104.5 54 105 60 105 C90 105 110 85 110 60 C110 35 90 15 60 15 Z"
        fill="#1E40AF"
      />
      <rect x="42" y="45" width="8" height="30" rx="4" fill="#F8FAFC" />
      <rect x="56" y="35" width="8" height="50" rx="4" fill="#0D9488" />
      <rect x="70" y="45" width="8" height="30" rx="4" fill="#F8FAFC" />
    </svg>
  );
}

export function Logo({ className, wordmarkClassName }: { className?: string; wordmarkClassName?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark />
      <span className={cn("text-lg font-bold tracking-tight text-[var(--color-text-primary)]", wordmarkClassName)}>
        Campus<span className="text-[var(--color-primary)]">Voice</span>
      </span>
    </span>
  );
}
