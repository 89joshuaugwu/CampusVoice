"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, MessageSquare, RefreshCw } from "lucide-react";
import { collection, doc, limit, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { cn, formatDateTime } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: "status_change" | "new_response";
  message: string;
  complaintId: string;
  read: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const { user, role } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notifications", user.uid, "items"),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const unsub = onSnapshot(q, (snap) => {
      setItems(
        snap.docs.map((d) => {
          const data = d.data();
          const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString();
          return {
            id: d.id,
            type: data.type,
            message: data.message,
            complaintId: data.complaintId,
            read: !!data.read,
            createdAt,
          };
        })
      );
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (!user) return null;

  const unreadCount = items.filter((i) => !i.read).length;
  const detailBase = role === "admin" ? "/dashboard/admin/queue" : "/dashboard/my-complaints";

  async function markRead(id: string) {
    if (!user) return;
    await updateDoc(doc(db, "notifications", user.uid, "items", id), { read: true }).catch(() => {});
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--color-error)] px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 max-w-[90vw] animate-[fade-in_0.15s_ease-out] rounded-2xl border border-[var(--color-border)] bg-white shadow-lg">
          <div className="border-b border-[var(--color-border)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Notifications</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <RefreshCw className="h-5 w-5 text-slate-300" />
                <p className="text-sm text-[var(--color-text-secondary)]">No notifications yet</p>
              </div>
            ) : (
              items.map((item) => (
                <Link
                  key={item.id}
                  href={`${detailBase}/${item.complaintId}`}
                  onClick={() => {
                    markRead(item.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex gap-3 border-b border-[var(--color-border)] px-4 py-3 last:border-0 hover:bg-slate-50",
                    !item.read && "bg-blue-50/50"
                  )}
                >
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" />
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--color-text-primary)]">{item.message}</p>
                    <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                      {formatDateTime(item.createdAt)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
