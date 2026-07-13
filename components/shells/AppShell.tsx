"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Home,
  ListChecks,
  FilePlus2,
  Inbox,
  Tags,
  BarChart3,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { NotificationBell } from "@/components/molecules/NotificationBell";
import { useAuth } from "@/lib/auth-context";
import { logout } from "@/lib/auth";
import { cn } from "@/lib/utils";

const STUDENT_NAV = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/my-complaints", label: "My Complaints", icon: ListChecks },
  { href: "/submit", label: "Submit", icon: FilePlus2 },
];

const ADMIN_NAV = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/admin/queue", label: "Queue", icon: Inbox },
  { href: "/dashboard/admin/categories", label: "Categories", icon: Tags },
  { href: "/dashboard/admin/reports", label: "Reports", icon: BarChart3 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, displayName } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = role === "admin" ? ADMIN_NAV : STUDENT_NAV;

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-[var(--color-border)] bg-white lg:flex lg:flex-col">
        <div className="border-b border-[var(--color-border)] p-5">
          <Link href="/dashboard">
            <Logo />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-50 text-[var(--color-primary)]"
                    : "text-[var(--color-text-secondary)] hover:bg-slate-50 hover:text-[var(--color-text-primary)]"
                )}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="m-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--color-error)] hover:bg-red-50"
        >
          <LogOut className="h-4.5 w-4.5" />
          Log out
        </button>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--color-border)] bg-white/90 px-4 py-3 backdrop-blur sm:px-6 lg:justify-end">
          <Link href="/dashboard" className="lg:hidden">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-[var(--color-text-primary)] hover:bg-slate-200"
              >
                <UserIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{displayName || "Account"}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 z-40 mt-2 w-44 rounded-xl border border-[var(--color-border)] bg-white p-1.5 shadow-lg">
                  <p className="px-3 py-1.5 text-xs text-[var(--color-text-secondary)]">
                    {role === "admin" ? "Admin" : "Student"}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--color-error)] hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 pb-24 sm:p-6 lg:pb-6">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-[var(--color-border)] bg-white/95 backdrop-blur lg:hidden">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                active ? "text-[var(--color-primary)]" : "text-[var(--color-text-secondary)]"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
