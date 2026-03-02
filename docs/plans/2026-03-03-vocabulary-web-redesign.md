# Vocabulary Web Page Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update `vocabulary/page.tsx` to match `#19 [Web] 04 · Vocabulary` design spec — inline per-card "Add to Deck" flow, correct status circle states, and tightened layout.

**Architecture:** Pure UI update to a single client component. Sidebar and layout are already implemented and matching. No API changes needed — existing `/api/words` and `/api/words/import` endpoints are reused as-is.

**Tech Stack:** Next.js 14 App Router, React, Tailwind CSS, Lucide icons

---

## Reference: Design States

| Card state | Status circle | Card border | Right section |
|---|---|---|---|
| `saved` (pending) | `bg-[#FFFBEB] border-2 border-amber-400` | `border border-border` | "N context" + chevron |
| `queued` (selected to add) | `bg-[#E0FAF7] border-2 border-primary` | `border-2 border-primary` | "N context" + chevron |
| `imported` | `bg-[#CCFBF1] border-2 border-primary` + check icon | `border border-border` | "已加入" green badge + chevron |
| `ignored` | `bg-muted border-2 border-border` | `border border-border` | chevron only |

---

### Task 1: Narrow page max-width & update header

**Files:**
- Modify: `src/app/(app)/vocabulary/page.tsx`

**Step 1: Change outer container width**

In `VocabularyPage` return, change:
```tsx
// Before
<div className="mx-auto max-w-3xl px-4 py-8">

// After
<div className="mx-auto w-full max-w-[640px] px-4 py-8">
```

**Step 2: Update header to match design**

Replace the existing header `<div className="mb-6 flex items-start justify-between">` block with:

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

Run dev server (`bun dev`) and navigate to `/vocabulary`. Confirm:
- Header icon + title on same row
- Subtitle below
- "N new" badge right-aligned

**Step 4: Commit**

```bash
git add src/app/(app)/vocabulary/page.tsx
git commit -m "feat(vocabulary): narrow layout to 640px, update header layout"
```

---

### Task 2: Update word card status circles & card border states

**Files:**
- Modify: `src/app/(app)/vocabulary/page.tsx`

**Step 1: Add `queued` to state**

Add a new state set for words queued to be added (visual "selected" state):
```tsx
// Change: remove 'selected' Set state
// Before:
const [selected, setSelected] = useState<Set<string>>(new Set());

// After: rename to 'queued' for clarity
const [queued, setQueued] = useState<Set<string>>(new Set());
```

Update all references: `selected` → `queued`, `isSelected` → `isQueued`, `toggleSelect` → `toggleQueued`.

**Step 2: Update card container border**

```tsx
// Before:
className={`overflow-hidden rounded-xl border bg-card transition-colors ${
  isSelected ? "border-primary" : "border-border"
}`}

// After:
className={`overflow-hidden rounded-xl bg-card transition-colors ${
  isQueued ? "border-2 border-primary" : "border border-border"
}`}
```

**Step 3: Update status circle rendering**

Replace the status circle `<div>` block:
```tsx
{/* Status circle */}
<div
  className={cn(
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2",
    w.status === "imported"
      ? "border-primary bg-[#CCFBF1] text-primary"
      : w.status === "ignored"
      ? "border-border bg-muted text-muted-foreground"
      : isQueued
      ? "border-primary bg-[#E0FAF7]"
      : "border-amber-400 bg-[#FFFBEB]"
  )}
>
  {w.status === "imported" && <Check className="h-3.5 w-3.5 text-primary" />}
</div>
```

**Step 4: Update right section — imported badge**

In the right section, replace the context count + chevron for imported words:
```tsx
<div className="flex shrink-0 items-center gap-2">
  {w.status === "imported" ? (
    <span className="rounded-full bg-[#DCFCE7] px-2.5 py-1 text-xs font-bold text-[#16A34A]">
      已加入
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

**Step 5: Visual check**

Verify three card states render correctly:
- Captured/pending word → amber circle, default border
- Word queued for deck → teal circle, 2px primary border
- Imported word → teal+check circle, green "已加入" badge

**Step 6: Commit**

```bash
git add src/app/(app)/vocabulary/page.tsx
git commit -m "feat(vocabulary): update status circles and card border states per design"
```

---

### Task 3: Replace multi-select+modal with inline per-card deck picker

**Files:**
- Modify: `src/app/(app)/vocabulary/page.tsx`

**Context:** The design shows "Add to Deck" as an inline button in the expanded card. Clicking it should show a compact deck picker (replaces the floating bar + modal pattern).

**Step 1: Remove old multi-select states**

Remove:
```tsx
const [showImportModal, setShowImportModal] = useState(false);
const [importing, setImporting] = useState(false);
```

Add:
```tsx
const [deckPickerWordId, setDeckPickerWordId] = useState<string | null>(null);
const [importing, setImporting] = useState(false);
```

**Step 2: Update `handleImport` to accept a single wordId**

```tsx
async function handleImport(wordId: string, deckId: string) {
  setImporting(true);
  const res = await fetch("/api/words/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wordIds: [wordId], collectionId: deckId }),
  });
  if (res.ok) {
    setWords((prev) =>
      prev.map((w) =>
        w.id === wordId ? { ...w, status: "imported", importedTo: deckId } : w
      )
    );
    setQueued((prev) => { const s = new Set(prev); s.delete(wordId); return s; });
    setDeckPickerWordId(null);
  }
  setImporting(false);
}
```

**Step 3: Update "Add to Deck" button in expanded content**

Replace the old actions block for `w.status === "saved"`:
```tsx
{w.status === "saved" && (
  <div className="flex flex-col gap-2">
    {deckPickerWordId === w.id ? (
      // Inline deck picker
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold text-muted-foreground">選擇 Deck：</p>
        {decks.map((d) => (
          <button
            key={d.id}
            onClick={(e) => { e.stopPropagation(); handleImport(w.id, d.id); }}
            disabled={importing}
            className="rounded-lg border border-border px-3 py-1.5 text-left text-xs font-semibold transition-colors hover:border-primary hover:bg-muted/50 disabled:opacity-50"
          >
            {d.title}
          </button>
        ))}
        {decks.length === 0 && (
          <p className="text-xs text-muted-foreground">沒有 deck，請先建立一個。</p>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setDeckPickerWordId(null); }}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          取消
        </button>
      </div>
    ) : (
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setQueued((prev) => { const s = new Set(prev); s.add(w.id); return s; });
            setDeckPickerWordId(w.id);
          }}
          className="rounded-lg border border-primary px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/10"
        >
          Add to Deck
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleIgnore(w.id); }}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          忽略
        </button>
      </div>
    )}
  </div>
)}
```

**Step 4: Remove floating import bar and modal**

Delete the entire blocks:
```tsx
{/* Import bar */}
{selected.size > 0 && ( ... )}

{/* Import modal */}
{showImportModal && ( ... )}
```

**Step 5: Visual check**

1. Expand a "saved" word → see "Add to Deck" + "忽略" buttons
2. Click "Add to Deck" → card gets teal circle + primary border, deck list appears inline
3. Select a deck → word becomes "imported", shows green badge
4. Click "忽略" → word status changes to ignored

**Step 6: Commit**

```bash
git add src/app/(app)/vocabulary/page.tsx
git commit -m "feat(vocabulary): replace multi-select modal with inline per-card deck picker"
```

---

### Task 4: Update expanded content styling

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

**Step 3: Final visual check**

Open `/vocabulary` and verify:
- Expanded section background is solid `bg-muted` (not transparent)
- Context block has border and non-italic text
- All three card states render correctly
- Inline deck picker works end-to-end

**Step 4: Commit**

```bash
git add src/app/(app)/vocabulary/page.tsx
git commit -m "feat(vocabulary): update expanded content bg and context block border"
```

---

## Sidebar note

`src/components/sidebar.tsx` already matches the design spec — no changes needed. The Vocabulary nav item active state (`bg-muted font-bold text-primary`) is correct.

## Out of Scope

- Log Out button in sidebar bottom (not currently in Sidebar component — separate feature)
- Profile nav item disabled state (currently hidden by absence from navItems, not `enabled: false`)
- `src/components/mobile-nav.tsx` — mobile layout is separate from this spec
