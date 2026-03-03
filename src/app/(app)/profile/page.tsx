"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, KeyRound, Check, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/use-user";

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const [profileName, setProfileName] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  const [changingPw, setChangingPw] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);

  useEffect(() => {
    if (user?.name) setProfileName(user.name);
  }, [user]);

  const initials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  async function saveName() {
    if (!profileName.trim() || profileName === user?.name) return;
    setNameSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileName.trim() }),
      });
      if (res.ok) {
        setNameSaved(true);
        setTimeout(() => setNameSaved(false), 2000);
        router.refresh();
      }
    } finally {
      setNameSaving(false);
    }
  }

  async function changePassword() {
    setPwError("");
    if (pwForm.next !== pwForm.confirm) { setPwError("Passwords don't match"); return; }
    if (pwForm.next.length < 8) { setPwError("New password must be at least 8 characters"); return; }
    setPwSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error ?? "Failed to change password");
      } else {
        setPwSaved(true);
        setChangingPw(false);
        setPwForm({ current: "", next: "", confirm: "" });
        setTimeout(() => setPwSaved(false), 3000);
      }
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background pb-24 md:pb-10">
      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-6 px-4 pb-6 pt-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="font-heading text-[32px] font-bold text-foreground">Profile</h1>
        </div>

        {/* Avatar + email card */}
        <div className="flex flex-col gap-4 rounded-3xl border-2 border-border bg-card px-5 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary">
              <span className="font-heading text-[22px] font-bold text-white">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="font-body text-[16px] font-bold text-foreground truncate">
                {userLoading ? "—" : user?.name}
              </p>
              <p className="font-body text-[13px] text-muted-foreground truncate">
                {userLoading ? "" : user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Edit name card */}
        <div className="flex flex-col gap-3 rounded-3xl border-2 border-border bg-card px-5 py-4">
          <span className="font-body text-[13px] font-bold uppercase tracking-wide text-muted-foreground">Display Name</span>
          <div className="flex gap-2">
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveName()}
              disabled={userLoading}
              className="flex-1 rounded-xl border-2 border-border bg-background px-3 py-2.5 font-body text-[14px] font-semibold text-foreground outline-none focus:border-primary disabled:opacity-50"
            />
            <button
              onClick={saveName}
              disabled={nameSaving || !profileName.trim() || profileName === user?.name}
              className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl border-2 border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
            >
              {nameSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className={nameSaved ? "h-4 w-4 text-primary" : "h-4 w-4"} />
              )}
            </button>
          </div>
        </div>

        {/* Change password card */}
        <div className="flex flex-col gap-3 rounded-3xl border-2 border-border bg-card px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="font-body text-[13px] font-bold uppercase tracking-wide text-muted-foreground">Password</span>
            {pwSaved && <span className="font-body text-[13px] font-semibold text-primary">Saved!</span>}
          </div>

          {!changingPw ? (
            <button
              onClick={() => setChangingPw(true)}
              className="flex items-center gap-2 rounded-xl border-2 border-border bg-background px-3 py-2.5 font-body text-[14px] font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <KeyRound className="h-4 w-4" />
              Change Password
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Current password"
                  value={pwForm.current}
                  onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
                  className="w-full rounded-xl border-2 border-border bg-background px-3 py-2.5 pr-10 font-body text-[14px] font-semibold text-foreground outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <input
                type={showPw ? "text" : "password"}
                placeholder="New password (min 8 chars)"
                value={pwForm.next}
                onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))}
                className="w-full rounded-xl border-2 border-border bg-background px-3 py-2.5 font-body text-[14px] font-semibold text-foreground outline-none focus:border-primary"
              />
              <input
                type={showPw ? "text" : "password"}
                placeholder="Confirm new password"
                value={pwForm.confirm}
                onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
                className="w-full rounded-xl border-2 border-border bg-background px-3 py-2.5 font-body text-[14px] font-semibold text-foreground outline-none focus:border-primary"
              />
              {pwError && <p className="font-body text-[13px] text-red-500">{pwError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={changePassword}
                  disabled={pwSaving || !pwForm.current || !pwForm.next || !pwForm.confirm}
                  className="flex-1 rounded-xl border-2 border-primary bg-primary py-2.5 font-body text-[14px] font-bold text-white transition-opacity disabled:opacity-50"
                >
                  {pwSaving ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Save Password"}
                </button>
                <button
                  onClick={() => { setChangingPw(false); setPwForm({ current: "", next: "", confirm: "" }); setPwError(""); }}
                  className="rounded-xl border-2 border-border bg-background px-4 py-2.5 font-body text-[14px] font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
