"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { EyeOff, Paperclip, StickyNote } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CategoryTag } from "@/components/ui/CategoryTag";
import { Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ThreadMessage } from "@/components/molecules/ThreadMessage";
import { ThreadReplyBox } from "@/components/molecules/ThreadReplyBox";
import { formatDate } from "@/lib/utils";
import { authedJson } from "@/lib/api-client";
import type { AuthContext, ComplaintStatus, ComplaintWithResponses } from "@/types/complaint";

interface ComplaintThreadViewProps {
  complaint: ComplaintWithResponses;
  authContext: AuthContext;
  trackingCode?: string; // required for public reply auth
  onReplySent?: () => void;
  onStatusChanged?: (status: ComplaintStatus) => void;
}

const STATUS_OPTIONS: ComplaintStatus[] = ["pending", "in_review", "resolved", "rejected"];

export function ComplaintThreadView({
  complaint,
  authContext,
  trackingCode,
  onReplySent,
  onStatusChanged,
}: ComplaintThreadViewProps) {
  const [status, setStatus] = useState<ComplaintStatus>(complaint.status);
  const [notes, setNotes] = useState(complaint.internalNotes ?? "");
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  const isAdmin = authContext === "admin";

  async function handleReply(message: string) {
    try {
      if (authContext === "public") {
        const res = await fetch("/api/complaints/respond", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ complaintId: complaint.id, trackingCode, message }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not send reply.");
      } else {
        await authedJson("/api/complaints/respond", {
          method: "POST",
          body: JSON.stringify({ complaintId: complaint.id, message }),
        });
      }
      toast.success("Reply sent.");
      onReplySent?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send reply.");
    }
  }

  async function handleStatusChange(newStatus: ComplaintStatus) {
    setSavingStatus(true);
    try {
      await authedJson(`/api/complaints/${complaint.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setStatus(newStatus);
      toast.success("Status updated.");
      onStatusChanged?.(newStatus);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update status.");
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    try {
      await authedJson(`/api/complaints/${complaint.id}/notes`, {
        method: "PATCH",
        body: JSON.stringify({ internalNotes: notes }),
      });
      toast.success("Notes saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save notes.");
    } finally {
      setSavingNotes(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-[var(--color-border)] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-xs text-[var(--color-text-secondary)]">{complaint.trackingCode}</p>
          {isAdmin ? (
            <Select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as ComplaintStatus)}
              disabled={savingStatus}
              className="w-auto min-h-0 py-1.5 text-xs"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </Select>
          ) : (
            <StatusBadge status={status} />
          )}
        </div>

        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{complaint.title}</h2>

        <div className="flex flex-wrap items-center gap-2">
          <CategoryTag category={complaint.category} />
          <span className="text-xs text-[var(--color-text-secondary)]">
            Submitted {formatDate(complaint.createdAt)}
          </span>
        </div>

        {complaint.isAnonymous && (
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
            <EyeOff className="h-3.5 w-3.5" />
            Anonymous submission — identity not recorded
          </div>
        )}

        <p className="text-sm leading-relaxed text-[var(--color-text-primary)]">{complaint.description}</p>

        {complaint.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {complaint.attachments.map((url, i) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-2.5 py-1.5 text-xs text-[var(--color-primary)] hover:bg-blue-50"
              >
                <Paperclip className="h-3.5 w-3.5" />
                Attachment {i + 1}
              </a>
            ))}
          </div>
        )}

        {isAdmin && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-amber-800">
              <StickyNote className="h-3.5 w-3.5" />
              Internal notes (admin only — never shown to complainant)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              placeholder="Notes visible only to admins…"
            />
            <Button size="sm" variant="secondary" className="mt-2" loading={savingNotes} onClick={handleSaveNotes}>
              Save notes
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
        {complaint.responses.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
            No replies yet — the conversation will appear here.
          </p>
        ) : (
          complaint.responses.map((r) => <ThreadMessage key={r.id} response={r} />)
        )}
      </div>

      <ThreadReplyBox onSend={handleReply} />
    </div>
  );
}
