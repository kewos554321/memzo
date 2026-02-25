"use client";

import { useRouter } from "next/navigation";
import { User, Bell, LogOut, ChevronRight, Loader2 } from "lucide-react";
import { useDecks } from "@/hooks/use-decks";
import { useUser } from "@/hooks/use-user";
import { useAsyncFn } from "@/hooks/use-async-fn";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ProfilePage() {
  const router = useRouter();
  const { decks } = useDecks();
  const { user, loading } = useUser();
  const totalCards = decks.reduce((sum, c) => sum + c.cards.length, 0);

  const [handleSignOut, signingOut] = useAsyncFn(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  });

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background pb-24 md:pb-10">
      <div className="flex flex-col gap-6 px-5 pb-6 pt-6 md:mx-auto md:w-full md:max-w-lg md:pt-10">
        <h1 className="font-heading text-[32px] font-bold text-foreground">Profile</h1>

        {/* Avatar card */}
        <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-border bg-card px-5 py-7 shadow-[0_4px_16px_#0D948818]">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-[0_4px_14px_#0D948850]">
            <span className="font-heading text-[28px] font-bold text-white">
              {loading ? "…" : user ? getInitials(user.name) : "?"}
            </span>
          </div>
          <div className="text-center">
            <p className="font-heading text-[22px] font-bold text-foreground">
              {loading ? "Loading…" : user?.name ?? "—"}
            </p>
            <p className="font-body text-sm text-muted-foreground">
              {loading ? "" : user?.email ?? "—"}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-2.5">
          <div className="flex flex-1 flex-col items-center gap-1 rounded-[18px] border-2 border-border bg-card py-4">
            <span className="font-heading text-[26px] font-bold text-primary">{decks.length}</span>
            <span className="font-body text-xs text-muted-foreground">Decks</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 rounded-[18px] border-2 border-border bg-card py-4">
            <span className="font-heading text-[26px] font-bold text-primary">{totalCards}</span>
            <span className="font-body text-xs text-muted-foreground">Cards</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 rounded-[18px] border-2 border-border bg-card py-4">
            <span className="font-heading text-[26px] font-bold text-[#EA580C]">7🔥</span>
            <span className="font-body text-xs text-muted-foreground">Day Streak</span>
          </div>
        </div>

        {/* Settings */}
        <div className="flex flex-col gap-2">
          <button className="flex h-14 w-full items-center justify-between rounded-2xl border-2 border-border bg-card px-4 cursor-pointer">
            <div className="flex items-center gap-3">
              <User className="h-[18px] w-[18px] text-primary" />
              <span className="font-body text-[15px] font-semibold text-foreground">Edit Profile</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button className="flex h-14 w-full items-center justify-between rounded-2xl border-2 border-border bg-card px-4 cursor-pointer">
            <div className="flex items-center gap-3">
              <Bell className="h-[18px] w-[18px] text-primary" />
              <span className="font-body text-[15px] font-semibold text-foreground">Notifications</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-red-200 bg-red-50 px-4 cursor-pointer disabled:opacity-60"
          >
            {signingOut ? (
              <Loader2 className="h-[18px] w-[18px] animate-spin text-red-600" />
            ) : (
              <LogOut className="h-[18px] w-[18px] text-red-600" />
            )}
            <span className="font-body text-[15px] font-bold text-red-600">
              {signingOut ? "Signing out..." : "Sign Out"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
