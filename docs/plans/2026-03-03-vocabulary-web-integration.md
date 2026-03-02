# Vocabulary Web Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate existing `vocabulary/page.tsx` with the `#19 [Web] 04 · Vocabulary` Pencil design — remove Add to Deck, rename "忽略" to "已學習", and update UI to match design spec.

**Architecture:** Single-file edit (`src/app/(app)/vocabulary/page.tsx`). No API or DB changes. Sidebar already matches design and is untouched. Changes are purely UI: remove multi-select logic, update status circle styles, update filter labels, tighten layout.

**Tech Stack:** Next.js 14 App Router, React, Tailwind CSS, Lucide icons, `cn` utility

---

### Task 1: Remove Add to Deck logic (states, handlers, UI)

**Files:**
- Modify: `src/app/(app)/vocabulary/page.tsx`

**Context:** The existing page has multi-select + floating bar + import modal. All of this needs to go. The `decks` state and `loadDecks` / `handleImport` / `toggleSelect` functions are only used by Add to Deck.

**Step 1: Remove unused state declarations**

Find and delete these lines (~90-93):
```tsx
// DELETE these lines:
const [selected, setSelected] = useState<Set<string>>(new Set());
const [decks, setDecks] = useState<{ id: string; title: string }[]>([]);
const [showImportModal, setShowImportModal] = useState(false);
const [importing, setImporting] = useState(false);
```

**Step 2: Remove loadDecks call from useEffect**

```tsx
// Before:
useEffect(() => {
  loadWords();
  loadDecks();
}, []);

// After:
useEffect(() => {
  loadWords();
}, []);
```

**Step 3: Remove loadDecks, handleImport, toggleSelect functions**

Delete the following function bodies (~107-164):
- `async function loadDecks() { ... }`
- `async function handleImport(...) { ... }`
- `function toggleSelect(...) { ... }`

**Step 4: Remove `isSelected` variable in card render**

Inside the `.map((w) => {` block, delete:
```tsx
// DELETE:
const isSelected = selected.has(w.id);
```

**Step 5: Remove floating import bar block**

Delete entirely (~394-407):
```tsx
{/* Import bar */}
{selected.size > 0 && (
  <div className="fixed bottom-6 ...">
    ...
  </div>
)}
```

**Step 6: Remove import modal block**

Delete entirely (~409-439):
```tsx
{/* Import modal */}
{showImportModal && (
  <div className="fixed inset-0 ...">
    ...
  </div>
)}
```

**Step 7: Remove unused imports**

At the top of the file, remove `Loader2` is still needed. Remove these if no longer used after above steps:
- Check if `Check` is still used (yes — keep for imported status circle)
- No other imports to remove

**Step 8: Visual check**

```bash
bun dev
```
Open `/vocabulary`. Confirm: no floating bar, no modal, no console errors.

**Step 9: Commit**

```bash
git add src/app/(app)/vocabulary/page.tsx
git commit -m "feat(vocabulary): remove add-to-deck multi-select logic and UI"
```

---

### Task 2: Update filter labels (已忽略 → 已學習)

**Files:**
- Modify: `src/app/(app)/vocabulary/page.tsx`

**Step 1: Update the filters array**

Find (~179-184):
```tsx
const filters: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "saved", label: "未加入" },
  { value: "imported", label: "已加入" },
  { value: "ignored", label: "已忽略" },
];
```

Replace with:
```tsx
const filters: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "saved", label: "未加入" },
  { value: "imported", label: "已加入" },
  { value: "ignored", label: "已學習" },
];
```

**Step 2: Visual check**

Run dev server. Filter pill should now read「已學習」instead of「已忽略」.

**Step 3: Commit**

```bash
git add src/app/(app)/vocabulary/page.tsx
git commit -m "feat(vocabulary): rename 已忽略 to 已學習 in filter labels"
```

---

### Task 3: Update layout and header

**Files:**
- Modify: `src/app/(app)/vocabulary/page.tsx`

**Step 1: Narrow container**

```tsx
// Before:
<div className="mx-auto max-w-3xl px-4 py-8">

// After:
<div className="mx-auto w-full max-w-[640px] px-4 py-8">
```

**Step 2: Update header**

Replace the existing header block (~189-206):
```tsx
{/* Before */}
<div className="mb-6 flex items-start justify-between">
  <div className="flex items-center gap-3">
    <BookMarked className="h-6 w-6 text-primary" />
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">
        Vocabulary
      </h1>
      <p className="text-sm text-muted-foreground">
        {words.length} words captured
      </p>
    </div>
  </div>
  {savedCount > 0 && (
    <span className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-white">
      {savedCount} new
    </span>
  )}
</div>
```

Replace with:
```tsx
{/* Header */}
<div className="mb-6 flex items-center justify-between">
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-3">
      <BookMarked className="h-6 w-6 text-primary" />
      <h1 className="font-heading text-3xl font-bold text-foreground">Vocabulary</h1>
    </div>
    <p className="text-sm text-muted-foreground">{words.length} words captured</p>
  </div>
  {savedCount > 0 && (
    <span className="rounded-full bg-primary px-2.5 py-1 text-sm font-bold text-white">
      {savedCount} new
    </span>
  )}
</div>
```

**Step 3: Visual check**

Confirm: icon and title on same row, subtitle below, badge right-aligned, content narrower.

**Step 4: Commit**

```bash
git add src/app/(app)/vocabulary/page.tsx
git commit -m "feat(vocabulary): narrow layout to 640px and update header per design"
```

---

### Task 4: Update word card — border, status circle, right-section badge

**Files:**
- Modify: `src/app/(app)/vocabulary/page.tsx`

**Step 1: Update card container border**

Find (~255-258):
```tsx
className={`overflow-hidden rounded-xl border bg-card transition-colors ${
  isSelected ? "border-primary" : "border-border"
}`}
```

Replace with (no more `isSelected`):
```tsx
className="overflow-hidden rounded-xl border border-border bg-card transition-colors"
```

**Step 2: Update status circle**

Find and replace the status circle `<div>` (~265-277):

```tsx
// Before:
<div
  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${
    w.status === "imported"
      ? "border-primary bg-primary/10 text-primary"
      : w.status === "ignored"
      ? "border-border bg-muted text-muted-foreground"
      : "border-amber-400 bg-amber-50"
  }`}
>
  {w.status === "imported" && (
    <Check className="h-4 w-4 text-primary" />
  )}
</div>
```

Replace with:
```tsx
<div
  className={cn(
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2",
    w.status === "imported"
      ? "border-primary bg-[#CCFBF1]"
      : w.status === "ignored"
      ? "border-border bg-muted"
      : "border-amber-400 bg-[#FFFBEB]"
  )}
>
  {w.status === "imported" && <Check className="h-3.5 w-3.5 text-primary" />}
</div>
```

**Step 3: Update right section — add status badges**

Find the right section div (~297-307):
```tsx
<div className="flex shrink-0 items-center gap-2 text-muted-foreground">
  {w.source.context && (
    <span className="text-xs">1 context</span>
  )}
  {isExpanded ? (
    <ChevronUp className="h-4 w-4" />
  ) : (
    <ChevronDown className="h-4 w-4" />
  )}
</div>
```

Replace with:
```tsx
<div className="flex shrink-0 items-center gap-2">
  {w.status === "imported" ? (
    <span className="rounded-full bg-[#DCFCE7] px-2.5 py-1 text-xs font-bold text-[#16A34A]">
      已加入
    </span>
  ) : w.status === "ignored" ? (
    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
      已學習
    </span>
  ) : (
    w.source.context && (
      <span className="text-xs text-muted-foreground">1 context</span>
    )
  )}
  {isExpanded ? (
    <ChevronUp className="h-4 w-4 text-muted-foreground" />
  ) : (
    <ChevronDown className="h-4 w-4 text-muted-foreground" />
  )}
</div>
```

**Step 4: Visual check**

Verify three card states:
- `saved` → amber circle, no badge
- `imported` → teal circle + check, green「已加入」badge
- `ignored` → muted circle, grey「已學習」badge

**Step 5: Commit**

```bash
git add src/app/(app)/vocabulary/page.tsx
git commit -m "feat(vocabulary): update card status circles and right-section badges per design"
```

---

### Task 5: Update expanded content styling and rename action button

**Files:**
- Modify: `src/app/(app)/vocabulary/page.tsx`

**Step 1: Update expanded section background**

```tsx
// Before:
<div className="border-t border-border bg-muted/30 px-4 pb-4 pt-3">

// After:
<div className="border-t border-border bg-muted px-4 pb-4 pt-3">
```

**Step 2: Update context block styling**

```tsx
// Before:
<div className="mb-3 rounded-lg bg-card px-3 py-2.5 text-sm italic text-foreground/80">

// After:
<div className="mb-3 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground">
```

**Step 3: Rename "忽略" action button to "已學習"**

Find the actions block (~360-384):
```tsx
{w.status === "saved" && (
  <div className="flex items-center gap-2">
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleSelect(w.id);
      }}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
        isSelected
          ? "bg-primary text-white"
          : "border border-primary text-primary hover:bg-primary/10"
      }`}
    >
      {isSelected ? "✓ Selected" : "Add to Deck"}
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleIgnore(w.id);
      }}
      className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
    >
      忽略
    </button>
  </div>
)}
```

Replace with:
```tsx
{w.status === "saved" && (
  <div className="flex items-center gap-2">
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleIgnore(w.id);
      }}
      className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
    >
      已學習
    </button>
  </div>
)}
```

**Step 4: Final visual check**

1. Expand a `saved` word → see only「已學習」button, no Add to Deck
2. Click「已學習」→ word moves to「已學習」filter, badge appears
3. Context block has border, non-italic text
4. Expanded background is solid `bg-muted`
5. No console errors

**Step 5: Commit**

```bash
git add src/app/(app)/vocabulary/page.tsx
git commit -m "feat(vocabulary): update expanded content style and rename action to 已學習"
```

---

## Done

All 5 tasks complete. The vocabulary page now:
- Shows words captured via extension
- Filters by 全部 / 未加入 / 已加入 / 已學習
- Expands to show definition, context, source, audio
- Action: mark as「已學習」(was "忽略")
- No Add to Deck flow
- UI matches `#19 [Web] 04 · Vocabulary` design spec
