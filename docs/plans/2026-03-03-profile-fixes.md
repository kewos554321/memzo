# Profile Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix three code-review issues from the profile feature: (1) silent error in saveName, (2) three parallel GET /api/auth/me fetches on every render, (3) back-navigation from /profile goes to wrong page. Also extract duplicate initials logic into a utility.

**Architecture:** Add a `UserProvider` (React Context) following the existing `DecksProvider` pattern in `src/providers/`. Update `useUser` to read from context instead of fetching independently. Fix `saveName` to surface errors. Replace back-arrow `<Link>` with `router.back()`. Extract `getInitials` to `src/lib/utils.ts`. Update `docs/openapi.yaml` with missing routes.

**Tech Stack:** Next.js 15 App Router, TypeScript, React Context (`createContext`, `useCallback`, `useRef`), `@/lib/auth` (SessionUser type), `@/lib/utils` (cn), existing `DecksProvider` in `src/providers/decks-provider.tsx` as reference pattern.

---

## Reference: Existing Patterns

- **DecksProvider pattern:** `src/providers/decks-provider.tsx` — `createContext`, `useState`, `useCallback`, `useRef(false)` to prevent double-init in React StrictMode, export `DecksContext` + `DecksProvider`.
- **Root layout providers:** `src/app/layout.tsx:47` — `DecksProvider` wraps `{children}` inside `<body>`. `UserProvider` goes alongside it.
- **useUser current:** `src/hooks/use-user.ts` — plain `useState + useEffect` fetch; returns `{ user, loading }`. Will change to read from context and return `{ user, loading, refresh }`.
- **SessionUser type:** `import type { SessionUser } from "@/lib/auth"` — `{ id: string; name: string; email: string }`.
- **Profile page imports:** Currently imports `Link` (only for back arrow) and `useUser`. `Link` will be removed; `getInitials` will be added.
- **openapi.yaml auth section:** `/auth/me` GET is at line 284. New PATCH goes under the same path key. New `/auth/change-password` POST goes after it.

---

### Task 1: Add getInitials utility to lib/utils.ts

**Files:**
- Modify: `src/lib/utils.ts`

**Step 1: Add getInitials after the cn function**

Open `src/lib/utils.ts`. The file currently contains only the `cn` function. Add `getInitials` after it:

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}
```

**Step 2: Verify TypeScript**

```bash
cd /Users/jayson/Documents/practice/memzo-core/memzo-web && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors

**Step 3: Commit**

```bash
git add src/lib/utils.ts
git commit -m "feat: add getInitials utility to lib/utils"
```

---

### Task 2: Create UserProvider

**Files:**
- Create: `src/providers/user-provider.tsx`

**Step 1: Create the file**

```tsx
"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { SessionUser } from "@/lib/auth";

interface UserContextType {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    const data = res.ok ? await res.json() : null;
    setUser(data);
    if (!initialized.current) {
      initialized.current = true;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialized.current) {
      refresh();
    }
  }, [refresh]);

  return (
    <UserContext.Provider value={{ user, loading, refresh }}>
      {children}
    </UserContext.Provider>
  );
}
```

**Step 2: Verify TypeScript**

```bash
cd /Users/jayson/Documents/practice/memzo-core/memzo-web && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors

**Step 3: Commit**

```bash
git add src/providers/user-provider.tsx
git commit -m "feat: add UserProvider context for shared user session"
```

---

### Task 3: Update useUser hook to read from context

**Files:**
- Modify: `src/hooks/use-user.ts`

**Step 1: Replace file content**

The current file fetches independently. Replace it entirely:

```ts
"use client";

import { useContext } from "react";
import { UserContext } from "@/providers/user-provider";

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
```

This returns `{ user, loading, refresh }` — all existing call sites that destructure `{ user }` or `{ user, loading }` continue to work unchanged because they only take what they need.

**Step 2: Verify TypeScript**

```bash
cd /Users/jayson/Documents/practice/memzo-core/memzo-web && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors

**Step 3: Commit**

```bash
git add src/hooks/use-user.ts
git commit -m "refactor: useUser now reads from UserContext instead of fetching directly"
```

---

### Task 4: Add UserProvider to root layout

**Files:**
- Modify: `src/app/layout.tsx`

The root layout at `src/app/layout.tsx:47` already wraps `{children}` in `<DecksProvider>`. Add `<UserProvider>` alongside it.

**Step 1: Add import**

At line 4, after the existing providers import, add:
```tsx
import { UserProvider } from "@/providers/user-provider";
```

**Step 2: Wrap children with UserProvider**

Current at line 47:
```tsx
        <DecksProvider>
          {children}
        </DecksProvider>
```

Change to:
```tsx
        <UserProvider>
          <DecksProvider>
            {children}
          </DecksProvider>
        </UserProvider>
```

**Step 3: Verify TypeScript**

```bash
cd /Users/jayson/Documents/practice/memzo-core/memzo-web && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors

**Step 4: Verify in browser**
- Navigate to any app page — Sidebar should still show user name/email
- No errors in console about UserProvider missing

**Step 5: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: add UserProvider to root layout for shared user session"
```

---

### Task 5: Fix profile page — error handling, back nav, getInitials

**Files:**
- Modify: `src/app/(app)/profile/page.tsx`

Three independent fixes in one task since they're all in the same file.

**Step 1: Update imports**

Current imports at lines 1-7:
```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, KeyRound, Check, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/use-user";
```

Replace with (remove `Link`, add `getInitials`):
```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, KeyRound, Check, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { getInitials } from "@/lib/utils";
```

**Step 2: Destructure refresh from useUser**

Current line 10:
```tsx
  const { user, loading: userLoading } = useUser();
```

Change to:
```tsx
  const { user, loading: userLoading, refresh } = useUser();
```

**Step 3: Add nameError state**

After line 15 (`const [nameSaved, setNameSaved] = useState(false);`), add:
```tsx
  const [nameError, setNameError] = useState("");
```

**Step 4: Fix initials computation**

Current lines 28-30:
```tsx
  const initials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";
```

Replace with:
```tsx
  const initials = user?.name ? getInitials(user.name) : "?";
```

**Step 5: Fix saveName function**

Current lines 32-49:
```tsx
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
```

Replace with:
```tsx
  async function saveName() {
    if (!profileName.trim() || profileName === user?.name) return;
    setNameSaving(true);
    setNameError("");
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileName.trim() }),
      });
      if (res.ok) {
        setNameSaved(true);
        setTimeout(() => setNameSaved(false), 2000);
        await refresh();
      } else {
        const data = await res.json();
        setNameError(data.error ?? "Failed to save name");
      }
    } finally {
      setNameSaving(false);
    }
  }
```

**Step 6: Fix back navigation**

Current lines 82-88 (the back arrow Link):
```tsx
          <Link
            href="/settings"
            className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
```

Replace with:
```tsx
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
```

**Step 7: Add nameError display in the UI**

Find the Display Name card section. After the `<div className="flex gap-2">` block (the input + checkmark button), add an error line:

Current structure ending at line 132:
```tsx
          <div className="flex gap-2">
            <input ... />
            <button ...>...</button>
          </div>
        </div>
```

Add after the `</div>` closing the flex gap-2:
```tsx
          {nameError && <p className="font-body text-[13px] text-red-500">{nameError}</p>}
```

So the section becomes:
```tsx
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
          {nameError && <p className="font-body text-[13px] text-red-500">{nameError}</p>}
```

**Step 8: Verify TypeScript**

```bash
cd /Users/jayson/Documents/practice/memzo-core/memzo-web && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors

**Step 9: Verify in browser**
- Go to `/profile` — back arrow navigates to previous page (not always `/settings`)
- Edit name → submit → if API fails, red error text appears below input
- Edit name → submit → if success, checkmark shows, sidebar name updates (no page reload)

**Step 10: Commit**

```bash
git add src/app/\(app\)/profile/page.tsx
git commit -m "fix: profile page — saveName error handling, router.back(), getInitials"
```

---

### Task 6: Update sidebar to use getInitials

**Files:**
- Modify: `src/components/sidebar.tsx`

**Step 1: Update import line 6**

Current:
```tsx
import { cn } from "@/lib/utils";
```

Change to:
```tsx
import { cn, getInitials } from "@/lib/utils";
```

**Step 2: Replace inline initials computation at lines 22-24**

Current:
```tsx
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";
```

Replace with:
```tsx
  const initials = user?.name ? getInitials(user.name) : "?";
```

**Step 3: Verify TypeScript**

```bash
cd /Users/jayson/Documents/practice/memzo-core/memzo-web && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors

**Step 4: Commit**

```bash
git add src/components/sidebar.tsx
git commit -m "refactor: use getInitials utility in sidebar"
```

---

### Task 7: Update mobile-nav to use getInitials

**Files:**
- Modify: `src/components/mobile-nav.tsx`

**Step 1: Update import line 7**

Current:
```tsx
import { cn } from "@/lib/utils";
```

Change to:
```tsx
import { cn, getInitials } from "@/lib/utils";
```

**Step 2: Replace inline initials computation at lines 24-26**

Current:
```tsx
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";
```

Replace with:
```tsx
  const initials = user?.name ? getInitials(user.name) : "?";
```

**Step 3: Verify TypeScript**

```bash
cd /Users/jayson/Documents/practice/memzo-core/memzo-web && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors

**Step 4: Commit**

```bash
git add src/components/mobile-nav.tsx
git commit -m "refactor: use getInitials utility in mobile-nav"
```

---

### Task 8: Update openapi.yaml with missing auth routes

**Files:**
- Modify: `docs/openapi.yaml`

The current `/auth/me` section at line 284 only has a `get` operation. Add `patch` under the same path. Then add a new `/auth/change-password` path.

**Step 1: Add PATCH to /auth/me**

Find the `/auth/me` path section at line 284. It currently ends at line 302 with the 401 error response. Add the `patch` operation after the closing of the `get` operation (after line 302):

```yaml
  /auth/me:
    get:
      summary: Get current authenticated user
      tags: [Auth]
      security:
        - cookieAuth: []
      responses:
        '200':
          description: Current user
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
    patch:
      summary: Update current user's display name
      tags: [Auth]
      security:
        - cookieAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                  minLength: 1
              required: [name]
      responses:
        '200':
          description: Updated user; also re-issues session cookie with new name
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          description: Name is required
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
```

**Step 2: Add /auth/change-password path**

After the `/auth/me` block (before the `# ─── DECKS` comment), insert:

```yaml
  /auth/change-password:
    post:
      summary: Change current user's password
      tags: [Auth]
      security:
        - cookieAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                currentPassword:
                  type: string
                newPassword:
                  type: string
                  minLength: 8
              required: [currentPassword, newPassword]
      responses:
        '200':
          description: Password changed successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
        '400':
          description: Missing fields, password too short, or current password is incorrect
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '404':
          description: User not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
```

**Step 3: Commit**

```bash
git add docs/openapi.yaml
git commit -m "docs: add PATCH /auth/me and POST /auth/change-password to openapi.yaml"
```

---

## Summary

| Task | Files | Type |
|------|-------|------|
| 1 | `src/lib/utils.ts` | Utility (getInitials) |
| 2 | `src/providers/user-provider.tsx` | New file (UserProvider) |
| 3 | `src/hooks/use-user.ts` | Refactor (context-backed) |
| 4 | `src/app/layout.tsx` | Integration (add UserProvider) |
| 5 | `src/app/(app)/profile/page.tsx` | Bug fix (3 issues) |
| 6 | `src/components/sidebar.tsx` | Refactor (getInitials) |
| 7 | `src/components/mobile-nav.tsx` | Refactor (getInitials) |
| 8 | `docs/openapi.yaml` | Docs |
