import { cn } from "@/lib/utils";
import { SENSITIVE_CATEGORIES } from "@/types/category";

export function CategoryTag({ category, className }: { category: string; className?: string }) {
  const isSensitive = SENSITIVE_CATEGORIES.includes(category);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        isSensitive
          ? "border-red-300 bg-red-50 text-red-700"
          : "border-slate-200 bg-slate-50 text-slate-600",
        className
      )}
    >
      {category}
    </span>
  );
}
