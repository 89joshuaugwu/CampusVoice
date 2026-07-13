import { motion } from "framer-motion";
import { ShieldCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";
import type { ComplaintResponse } from "@/types/complaint";

export function ThreadMessage({ response }: { response: ComplaintResponse }) {
  const isAdmin = response.authorRole === "admin";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex", isAdmin ? "justify-start" : "justify-end")}
    >
      <div className={cn("max-w-[85%] sm:max-w-[70%]", isAdmin ? "" : "text-right")}>
        <div
          className={cn(
            "mb-1 flex items-center gap-1.5 text-xs font-medium",
            isAdmin ? "text-[var(--color-primary)]" : "justify-end text-[var(--color-text-secondary)]"
          )}
        >
          {isAdmin ? <ShieldCheck className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
          {isAdmin ? "Admin" : "Complainant"}
        </div>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
            isAdmin
              ? "bg-white border border-[var(--color-border)] text-[var(--color-text-primary)]"
              : "bg-[var(--color-primary)] text-white"
          )}
        >
          {response.message}
        </div>
        <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
          {formatDateTime(response.createdAt)}
        </p>
      </div>
    </motion.div>
  );
}
