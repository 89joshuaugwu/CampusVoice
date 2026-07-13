"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ThreadReplyBox({
  onSend,
  disabled,
}: {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
}) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      await onSend(message.trim());
      setMessage("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="sticky bottom-0 flex items-end gap-2 border-t border-[var(--color-border)] bg-white/95 p-3 backdrop-blur">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Type a reply…"
        rows={1}
        disabled={disabled}
        className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-[var(--color-border)] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 disabled:bg-slate-50"
      />
      <Button onClick={handleSend} loading={sending} disabled={disabled || !message.trim()} className="shrink-0">
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
