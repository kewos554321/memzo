"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Layers, Mail, Lock, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-7">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-primary shadow-[0_6px_20px_#0D948850]">
            <Layers className="h-[34px] w-[34px] text-white" />
          </div>
          <span className="font-heading text-[32px] font-bold text-foreground">Memzo</span>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="font-heading text-[26px] font-bold text-foreground">Welcome back</h1>
          <p className="font-body text-[15px] text-muted-foreground">Sign in to continue learning</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-[13px] font-bold text-foreground">Email</label>
            <div className="flex h-[50px] items-center gap-2.5 rounded-[14px] border-2 border-border bg-card px-4">
              <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-[13px] font-bold text-foreground">Password</label>
            <div className="flex h-[50px] items-center gap-2.5 rounded-[14px] border-2 border-border bg-card px-4">
              <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="flex-1 bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="font-body text-[13px] text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-[54px] items-center justify-center gap-2 rounded-2xl bg-primary font-body text-base font-bold text-white shadow-[0_4px_16px_#0D948840] cursor-pointer disabled:opacity-60"
          >
            <LogIn className="h-[18px] w-[18px]" />
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 h-px bg-border" />

        <p className="text-center font-body text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-primary">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
