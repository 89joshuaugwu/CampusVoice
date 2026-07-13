"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, LogIn, FilePlus2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/submit", label: "Submit", icon: FilePlus2 },
  { href: "/track", label: "Track", icon: Search },
];

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 sm:flex">
            <Link
              href="/track"
              className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
            >
              Track a Complaint
            </Link>
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 pb-20 sm:pb-0">{children}</main>

      <footer className="hidden border-t border-[var(--color-border)] bg-white py-8 sm:block">
        <div className="mx-auto max-w-6xl px-6 text-sm text-[var(--color-text-secondary)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Logo />
            <p>© {new Date().getFullYear()} CampusVoice. Built for ESUT students.</p>
          </div>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-[var(--color-border)] bg-white/95 backdrop-blur sm:hidden">
        {NAV_ITEMS.map((item) => {
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
        <Link
          href={user ? "/dashboard" : "/auth/login"}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
            pathname.startsWith("/dashboard") || pathname.startsWith("/auth")
              ? "text-[var(--color-primary)]"
              : "text-[var(--color-text-secondary)]"
          )}
        >
          <LogIn className="h-5 w-5" />
          {user ? "Dashboard" : "Login"}
        </Link>
      </nav>
    </div>
  );
}
