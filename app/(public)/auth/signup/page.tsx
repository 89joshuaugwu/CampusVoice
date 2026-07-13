"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { UserPlus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { signUpStudent, loginWithGoogle, authErrorMessage } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signUpStudent({ email, password, displayName, regNumber });
      toast.success("Account created!");
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
      toast.success("Welcome!");
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
          <UserPlus className="mx-auto mb-3 h-8 w-8 text-[var(--color-primary)]" />
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Create your account</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Optional — track complaints in one place. You can still submit and track without one.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full name"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Ejike Kingsley"
          />
          <Input
            label="Reg number"
            value={regNumber}
            onChange={(e) => setRegNumber(e.target.value)}
            placeholder="2022030212345"
          />
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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint="At least 6 characters"
          />
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Create account
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
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-[var(--color-primary)]">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
