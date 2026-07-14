"use client";

import { useState } from "react";
import { FileText, Paperclip } from "lucide-react";
import { AttachmentLightbox } from "@/components/ui/AttachmentLightbox";
import { getAttachmentKind, getAttachmentLabel } from "@/lib/attachments";

export function AttachmentGrid({ attachments }: { attachments: string[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (attachments.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {attachments.map((url, i) => {
          const kind = getAttachmentKind(url);
          const label = getAttachmentLabel(url, i);

          if (kind === "image") {
            return (
              <button
                key={url}
                onClick={() => setOpenIndex(i)}
                className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[var(--color-border)]"
                aria-label={`View ${label}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={label}
                  className="h-full w-full object-cover transition-transform duration-150 group-hover:scale-105"
                />
              </button>
            );
          }

          return (
            <button
              key={url}
              onClick={() => setOpenIndex(i)}
              className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-[var(--color-border)] bg-slate-50 text-[var(--color-primary)] hover:bg-blue-50"
              aria-label={`View ${label}`}
            >
              {kind === "pdf" ? <FileText className="h-6 w-6" /> : <Paperclip className="h-6 w-6" />}
              <span className="text-[10px] font-medium text-[var(--color-text-secondary)]">{label}</span>
            </button>
          );
        })}
      </div>

      <AttachmentLightbox
        attachments={attachments}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
      />
    </>
  );
}
