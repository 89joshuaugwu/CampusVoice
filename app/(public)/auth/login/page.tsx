"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LogIn } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { loginWithEmail, loginWithGoogle, authErrorMessage } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(authErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <Card className="p-6 sm:p-8">
        <div className="mb-6 text-center">
          <LogIn className="mx-auto mb-3 h-8 w-8 text-[var(--color-primary)]" />
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Welcome back</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Students and admin use the same login.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@esut.edu.ng"
          />
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Log in
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--color-border)]" />
          <span className="text-xs text-[var(--color-text-secondary)]">or</span>
          <div className="h-px flex-1 bg-[var(--color-border)]" />
        </div>

        <Button variant="secondary" size="lg" className="w-full" onClick={handleGoogle} loading={googleLoading}>
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-semibold text-[var(--color-primary)]">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
