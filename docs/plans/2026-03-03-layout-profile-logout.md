# Layout Unification + Profile + Logout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Unify page content width to `max-w-[640px] mx-auto`, add real user data + logout to sidebar/mobile nav, and add a dedicated `/profile` page accessible by clicking the sidebar avatar.

**Architecture:** Pure client-side UI changes for layout + sidebar; two new API routes (`PATCH /api/auth/me`, `POST /api/auth/change-password`) for profile mutations; new `/profile` page at `src/app/(app)/profile/page.tsx` accessible by clicking the avatar button in the sidebar/mobile nav. Settings page is NOT modified for profile (language + extension only).

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS 4, Prisma 7 (`db` from `@/lib/db`), bcryptjs, JWT auth via `@/lib/auth`, `useUser` hook (`src/hooks/use-user.ts`).

---

## Reference: Existing Patterns

- **DB client:** `import { db } from "@/lib/db"` — Prisma
- **Auth helpers:** `import { getSession, createToken, buildSessionCookie } from "@/lib/auth"` — getSession reads JWT from httpOnly cookie; createToken signs a new JWT
- **Password:** `import { compare, hash } from "bcryptjs"` — compare(plain, hashed), hash(plain, 10)
- **useUser hook:** `src/hooks/use-user.ts` — fetches `GET /api/auth/me`, returns `{ user, loading }`
- **Layout width standard (vocabulary):** `mx-auto w-full max-w-[640px] px-4 py-8` on inner container
- **Settings inner container:** `flex flex-col gap-6 px-5 pb-6 pt-6 md:mx-auto md:w-full md:max-w-lg md:pt-10`

---

### Task 1: Unify layout width — Home page

**Files:**
- Modify: `src/app/(app)/page.tsx:92`

**Step 1: Update inner container className**

At line 92, change:
```tsx
<div className="flex flex-col gap-5 px-5 pb-6 pt-6 max-w-2xl">
```
to:
```tsx
<div className="mx-auto flex w-full max-w-[640px] flex-col gap-5 px-4 pb-6 pt-6">
```

**Step 2: Verify in browser**
Navigate to `/` — content should be centered with consistent max width on desktop.

**Step 3: Commit**
```bash
git add src/app/\(app\)/page.tsx
git commit -m "fix: center home page content to max-w-[640px]"
```

---

### Task 2: Unify layout width — Decks page

**Files:**
- Modify: `src/app/(app)/decks/page.tsx:22`

**Step 1: Update inner container className**

At line 22, change:
```tsx
<div className="flex flex-col gap-5 px-5 pb-6 pt-6">
```
to:
```tsx
<div className="mx-auto flex w-full max-w-[640px] flex-col gap-5 px-4 pb-6 pt-6">
```

**Step 2: Verify in browser**
Navigate to `/decks` — content should be centered.

**Step 3: Commit**
```bash
git add src/app/\(app\)/decks/page.tsx
git commit -m "fix: center decks page content to max-w-[640px]"
```

---

### Task 3: Unify layout width — Study page

**Files:**
- Modify: `src/app/(app)/study/page.tsx:23`

**Step 1: Update inner container className**

At line 23, change:
```tsx
<div className="flex flex-col gap-5 px-5 pb-6 pt-6">
```
to:
```tsx
<div className="mx-auto flex w-full max-w-[640px] flex-col gap-5 px-4 pb-6 pt-6">
```

**Step 2: Verify in browser**
Navigate to `/study` — content should be centered.

**Step 3: Commit**
```bash
git add src/app/\(app\)/study/page.tsx
git commit -m "fix: center study page content to max-w-[640px]"
```

---

### Task 4: Unify layout width — Settings page

**Files:**
- Modify: `src/app/(app)/settings/page.tsx:13`

**Step 1: Update inner container className**

At line 13, change:
```tsx
<div className="flex flex-col gap-6 px-5 pb-6 pt-6 md:mx-auto md:w-full md:max-w-lg md:pt-10">
```
to:
```tsx
<div className="mx-auto flex w-full max-w-[640px] flex-col gap-6 px-4 pb-6 pt-6">
```

**Step 2: Verify in browser**
Navigate to `/settings` — width should match vocabulary page.

**Step 3: Commit**
```bash
git add src/app/\(app\)/settings/page.tsx
git commit -m "fix: widen settings page to max-w-[640px] matching vocabulary"
```

---

### Task 5: Sidebar — real user data + logout button

**Files:**
- Modify: `src/components/sidebar.tsx`

**Step 1: Replace hardcoded user block with dynamic data + logout**

Replace the entire file content with:

```tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, BookOpen, Layers, BookMarked, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/decks", icon: Layers, label: "Decks" },
  { href: "/study", icon: BookOpen, label: "Study" },
  { href: "/vocabulary", icon: BookMarked, label: "Vocabulary" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-full w-60 flex-col justify-between border-r border-border bg-card px-4 py-7 md:flex">
      {/* Top: Brand + Nav */}
      <div className="flex flex-col gap-8">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary shadow-[0_4px_12px_#0D948840]">
            <Layers className="h-[18px] w-[18px] text-white" />
          </div>
          <span className="font-heading text-[22px] font-bold text-foreground">Memzo</span>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-[15px] transition-colors",
                  isActive
                    ? "bg-muted font-bold text-primary"
                    : "font-semibold text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Avatar (→ /profile) + name/email + logout */}
      <div className="flex items-center gap-2.5 rounded-xl bg-muted px-3 py-3.5">
        <Link
          href="/profile"
          className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-primary transition-opacity hover:opacity-80"
          aria-label="Go to profile"
        >
          <span className="font-heading text-[13px] font-bold text-white">{initials}</span>
        </Link>
        <div className="min-w-0 flex-1">
          <p className="font-body text-[13px] font-bold text-foreground truncate">{user?.name ?? "—"}</p>
          <p className="truncate font-body text-[11px] text-muted-foreground">{user?.email ?? ""}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          aria-label="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
```

**Step 2: Verify in browser**
- User name/email should load from session
- Clicking the logout icon should clear the session and redirect to `/login`

**Step 3: Commit**
```bash
git add src/components/sidebar.tsx
git commit -m "feat: show real user data and add logout button to sidebar"
```

---

### Task 6: MobileNav — add logout button

**Files:**
- Modify: `src/components/mobile-nav.tsx`

**Step 1: Add logout to mobile drawer**

Add `useUser`, `useRouter`, `LogOut` icon, and a logout button at the bottom of the drawer. Replace the file:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Home, BookOpen, Layers, BookMarked, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/decks", icon: Layers, label: "Decks" },
  { href: "/study", icon: BookOpen, label: "Study" },
  { href: "/vocabulary", icon: BookMarked, label: "Vocabulary" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  async function handleLogout() {
    setOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed left-5 top-5 z-50 flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary shadow-[0_4px_12px_#0D948840] md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-[18px] w-[18px] text-white" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-[260px] flex-col justify-between border-r border-border bg-card px-4 py-7 transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col gap-8">
          {/* Brand */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary shadow-[0_4px_12px_#0D948840]">
              <Layers className="h-[18px] w-[18px] text-white" />
            </div>
            <span className="font-heading text-[22px] font-bold text-foreground">Memzo</span>
          </div>

          {/* Nav items */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-[15px] transition-colors",
                    isActive
                      ? "bg-muted font-bold text-primary"
                      : "font-semibold text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn("h-[18px] w-[18px]", isActive ? "text-primary" : "text-muted-foreground")}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Avatar (→ /profile) + name/email + logout */}
        <div className="flex items-center gap-2.5 rounded-xl bg-muted px-3 py-3.5">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-primary transition-opacity hover:opacity-80"
            aria-label="Go to profile"
          >
            <span className="font-heading text-[13px] font-bold text-white">{initials}</span>
          </Link>
          <div className="min-w-0 flex-1">
            <p className="font-body text-[13px] font-bold text-foreground truncate">{user?.name ?? "—"}</p>
            <p className="truncate font-body text-[11px] text-muted-foreground">{user?.email ?? ""}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}
```

**Step 2: Verify in browser (mobile viewport)**
- Open drawer → user name/email visible → logout button works

**Step 3: Commit**
```bash
git add src/components/mobile-nav.tsx
git commit -m "feat: show real user data and add logout to mobile nav"
```

---

### Task 7: API — PATCH /api/auth/me (update name)

**Files:**
- Modify: `src/app/api/auth/me/route.ts`

**Step 1: Add PATCH handler to existing route file**

The file currently only has GET. Add PATCH below it:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getSession, createToken, buildSessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(user);
}

export async function PATCH(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await request.json();
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data: { name: name.trim() },
    select: { id: true, name: true, email: true },
  });

  // Re-issue JWT with updated name
  const token = await createToken(updated);
  const response = NextResponse.json(updated);
  response.cookies.set(buildSessionCookie(token));
  return response;
}
```

**Step 2: Test manually**
```bash
# While logged in, run in browser console:
fetch("/api/auth/me", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "New Name" })
}).then(r => r.json()).then(console.log)
# Expected: { id: "...", name: "New Name", email: "..." }
```

**Step 3: Commit**
```bash
git add src/app/api/auth/me/route.ts
git commit -m "feat: add PATCH /api/auth/me to update display name"
```

---

### Task 8: API — POST /api/auth/change-password

**Files:**
- Create: `src/app/api/auth/change-password/route.ts`

**Step 1: Create the route file**

```ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { compare, hash } from "bcryptjs";

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json();
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Both passwords are required" }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  }

  const dbUser = await db.user.findUnique({ where: { id: user.id } });
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const valid = await compare(currentPassword, dbUser.password);
  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  const hashed = await hash(newPassword, 10);
  await db.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  return NextResponse.json({ success: true });
}
```

**Step 2: Test manually**
```bash
# In browser console while logged in:
fetch("/api/auth/change-password", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ currentPassword: "yourpw", newPassword: "newpw123" })
}).then(r => r.json()).then(console.log)
# Expected: { success: true }
# With wrong current password: { error: "Current password is incorrect" }
```

**Step 3: Commit**
```bash
git add src/app/api/auth/change-password/route.ts
git commit -m "feat: add POST /api/auth/change-password"
```

---

### Task 9: Create /profile page

**Files:**
- Create: `src/app/(app)/profile/page.tsx`

Profile is accessed by clicking the avatar button in the sidebar/mobile nav (→ `/profile`). Settings page remains unchanged (language + extension only).

**Step 1: Create the profile page**

```tsx
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
```

**Step 2: Verify in browser**
- Click avatar in sidebar → navigates to `/profile`
- Avatar with initials + name + email shown at top
- Edit name → checkmark saves + sidebar updates after refresh
- "Change Password" expands form → saves → "Saved!" confirmation
- Wrong current password → error message

**Step 3: Commit**
```bash
git add src/app/\(app\)/profile/page.tsx
git commit -m "feat: add /profile page accessible from sidebar avatar"
```

---

## Summary

| Task | Files | Type |
|------|-------|------|
| 1 | `src/app/(app)/page.tsx` | CSS fix |
| 2 | `src/app/(app)/decks/page.tsx` | CSS fix |
| 3 | `src/app/(app)/study/page.tsx` | CSS fix |
| 4 | `src/app/(app)/settings/page.tsx` | CSS fix |
| 5 | `src/components/sidebar.tsx` | Feature (real user + logout + avatar → /profile) |
| 6 | `src/components/mobile-nav.tsx` | Feature (real user + logout + avatar → /profile) |
| 7 | `src/app/api/auth/me/route.ts` | API (add PATCH) |
| 8 | `src/app/api/auth/change-password/route.ts` | API (new file) |
| 9 | `src/app/(app)/profile/page.tsx` | Feature (new page) |
