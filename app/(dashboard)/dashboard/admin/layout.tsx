"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/auth-context";
import { Spinner } from "@/components/ui/Card";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && role !== "admin") {
      toast.error("Admin access only.");
      router.replace("/dashboard");
    }
  }, [loading, role, router]);

  if (loading || role !== "admin") {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
