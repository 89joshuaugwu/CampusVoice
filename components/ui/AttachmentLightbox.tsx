"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { getAttachmentKind, getAttachmentLabel } from "@/lib/attachments";

interface AttachmentLightboxProps {
  attachments: string[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function AttachmentLightbox({ attachments, index, onClose, onNavigate }: AttachmentLightboxProps) {
  const open = index !== null;
  const current = open ? attachments[index] : null;

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && index !== null && index < attachments.length - 1) {
        onNavigate(index + 1);
      }
      if (e.key === "ArrowLeft" && index !== null && index > 0) {
        onNavigate(index - 1);
      }
    }

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, index, attachments.length, onClose, onNavigate]);

  if (!current || index === null) return null;

  const kind = getAttachmentKind(current);
  const label = getAttachmentLabel(current, index);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] flex flex-col bg-slate-900/95 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Top bar */}
          <div
            className="flex shrink-0 items-center justify-between px-4 py-3 sm:px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-medium text-white/90">
              {label}
              {attachments.length > 1 && (
                <span className="ml-2 text-white/50">
                  {index + 1} / {attachments.length}
                </span>
              )}
            </p>
            <div className="flex items-center gap-1">
              <a
                href={current}
                download
                onClick={(e) => e.stopPropagation()}
                className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
                aria-label="Download"
              >
                <Download className="h-5 w-5" />
              </a>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-2 pb-4 sm:px-6">
            {index > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(index - 1);
                }}
                className="absolute left-2 z-10 rounded-full bg-black/30 p-2 text-white hover:bg-black/50 sm:left-4"
                aria-label="Previous attachment"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="flex h-full w-full max-w-4xl items-center justify-center"
            >
              {kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={current}
                  alt={label}
                  className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
                />
              ) : kind === "pdf" ? (
                <iframe
                  src={current}
                  title={label}
                  className="h-full w-full rounded-lg bg-white shadow-2xl"
                />
              ) : (
                <div className="rounded-2xl bg-white p-8 text-center">
                  <p className="mb-3 text-sm text-[var(--color-text-secondary)]">
                    This file type can&apos;t be previewed here.
                  </p>
                  <a
                    href={current}
                    download
                    className="text-sm font-medium text-[var(--color-primary)] underline"
                  >
                    Download instead
                  </a>
                </div>
              )}
            </motion.div>

            {index < attachments.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(index + 1);
                }}
                className="absolute right-2 z-10 rounded-full bg-black/30 p-2 text-white hover:bg-black/50 sm:right-4"
                aria-label="Next attachment"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
