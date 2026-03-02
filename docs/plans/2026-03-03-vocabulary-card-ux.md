# Vocabulary Card UX Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Simplify filter bar, remove redundant badges, make status circles clickable, add sentence TTS, and upgrade YT icon.

**Architecture:** All changes are localised to `src/app/(app)/vocabulary/page.tsx` and the `memzo.pen` design file. No API, database, or new file changes required — the existing `PATCH /api/words/:id` endpoint already accepts any status string.

**Tech Stack:** React (Next.js 15), TypeScript, Tailwind CSS 4, lucide-react, Web Speech API (browser built-in)

**Spec:** `docs/spec/12-vocabulary-card-ux.md`

---

## Task 1: Remove "未加入" / "已加入" filters from page.tsx

**Files:**
- Modify: `src/app/(app)/vocabulary/page.tsx:36,88,135-140`

**Step 1: Update FilterStatus type and default state**

In `page.tsx`, change line 36:
```tsx
// Before
type FilterStatus = "all" | "saved" | "imported" | "ignored";

// After
type FilterStatus = "all" | "ignored";
```

Change line 88 (default filter state):
```tsx
// Before
const [filter, setFilter] = useState<FilterStatus>("saved");

// After
const [filter, setFilter] = useState<FilterStatus>("all");
```

**Step 2: Replace the filters array**

Lines 135-140, change:
```tsx
// Before
const filters: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "saved", label: "未加入" },
  { value: "imported", label: "已加入" },
  { value: "ignored", label: "已學習" },
];

// After
const filters: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "ignored", label: "已學習" },
];
```

**Step 3: Fix the filtered logic**

Line 126-131 currently does `filter === "all" || w.status === filter`. With the new type, `filter` can only be `"all"` or `"ignored"`, so the logic works correctly as-is — no change needed there.

**Step 4: Build check**

```bash
cd /Users/kewos/Documents/projects/memzo-core/memzo-web
npx tsc --noEmit
```
Expected: no errors.

**Step 5: Commit**

```bash
git add src/app/(app)/vocabulary/page.tsx
git commit -m "feat(vocabulary): remove 未加入/已加入 filter tabs, default to 全部"
```

---

## Task 2: Remove "已加入" badge from card right section

**Files:**
- Modify: `src/app/(app)/vocabulary/page.tsx:252-255`

**Step 1: Remove the imported badge**

Lines 252-266 currently:
```tsx
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
    <span className="text-xs text-muted-foreground">
      1 context
    </span>
  )
)}
```

Replace with (remove the imported branch entirely):
```tsx
{w.status === "ignored" ? (
  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
    已學習
  </span>
) : (
  w.source.context && (
    <span className="text-xs text-muted-foreground">
      1 context
    </span>
  )
)}
```

**Step 2: Build check**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add src/app/(app)/vocabulary/page.tsx
git commit -m "feat(vocabulary): remove 已加入 badge from card right section"
```

---

## Task 3: Make status circle clickable to toggle 學習中 ↔ 已學習

**Files:**
- Modify: `src/app/(app)/vocabulary/page.tsx:103-112,217-231`

**Step 1: Replace handleIgnore with handleToggleStatus**

Current (lines 103-112):
```tsx
async function handleIgnore(id: string) {
  await fetch(`/api/words/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "ignored" }),
  });
  setWords((prev) =>
    prev.map((w) => (w.id === id ? { ...w, status: "ignored" } : w))
  );
}
```

Replace with:
```tsx
async function handleToggleStatus(id: string) {
  const word = words.find((w) => w.id === id);
  if (!word) return;
  const nextStatus = word.status === "ignored" ? "saved" : "ignored";
  await fetch(`/api/words/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: nextStatus }),
  });
  setWords((prev) =>
    prev.map((w) => (w.id === id ? { ...w, status: nextStatus } : w))
  );
}
```

**Step 2: Make status circle a standalone button**

Current (lines 217-231), the status circle is a `<div>` inside the card header click target:
```tsx
{/* Status circle */}
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
  {w.status === "imported" && (
    <Check className="h-3.5 w-3.5 text-primary" />
  )}
</div>
```

Replace with a `<button>`:
```tsx
{/* Status circle — click to toggle 學習中 / 已學習 */}
<button
  onClick={(e) => {
    e.stopPropagation();
    handleToggleStatus(w.id);
  }}
  className={cn(
    "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 transition-opacity hover:opacity-70",
    w.status === "imported"
      ? "border-primary bg-[#CCFBF1]"
      : w.status === "ignored"
      ? "border-border bg-muted"
      : "border-amber-400 bg-[#FFFBEB]"
  )}
>
  {w.status === "imported" && (
    <Check className="h-3.5 w-3.5 text-primary" />
  )}
</button>
```

**Step 3: Remove the old "已學習" button in expanded actions (it's now replaced by circle)**

Lines 326-338 currently render a button inside expanded content for `saved` status:
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

Remove this entire block (the circle now handles toggling for all statuses).

**Step 4: Build check**

```bash
npx tsc --noEmit
```

**Step 5: Commit**

```bash
git add src/app/(app)/vocabulary/page.tsx
git commit -m "feat(vocabulary): make status circle clickable to toggle 學習中/已學習"
```

---

## Task 4: Add sentence TTS play button

**Files:**
- Modify: `src/app/(app)/vocabulary/page.tsx:3-13,279-293`

**Step 1: Add MessageSquare to lucide imports**

Line 3-13, add `MessageSquare` to the import list:
```tsx
import {
  BookMarked,
  ExternalLink,
  Loader2,
  MessageSquare,
  Search,
  Volume2,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
```

**Step 2: Add playSentence helper after playAudio (line 124)**

```tsx
function playSentence(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
}
```

**Step 3: Add the Sentence button in expanded content**

Current expanded header row (lines 279-293):
```tsx
<div className="mb-3 flex items-start justify-between gap-2">
  <p className="text-sm text-foreground">{w.definition}</p>
  {w.audioUrl && (
    <button
      onClick={(e) => {
        e.stopPropagation();
        playAudio(w.audioUrl!);
      }}
      className="flex shrink-0 items-center gap-1.5 rounded-lg bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
    >
      <Volume2 className="h-3.5 w-3.5" />
      Play
    </button>
  )}
</div>
```

Replace with:
```tsx
<div className="mb-3 flex items-start justify-between gap-2">
  <p className="text-sm text-foreground">{w.definition}</p>
  <div className="flex shrink-0 items-center gap-1.5">
    {w.audioUrl && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          playAudio(w.audioUrl!);
        }}
        className="flex items-center gap-1.5 rounded-lg bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
      >
        <Volume2 className="h-3.5 w-3.5" />
        Play
      </button>
    )}
    {w.source.context && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          playSentence(w.source.context!);
        }}
        className="flex items-center gap-1.5 rounded-lg bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        Sentence
      </button>
    )}
  </div>
</div>
```

**Step 4: Build check**

```bash
npx tsc --noEmit
```

**Step 5: Commit**

```bash
git add src/app/(app)/vocabulary/page.tsx
git commit -m "feat(vocabulary): add sentence TTS play button in expanded card"
```

---

## Task 5: YouTube source link — use PlayCircle icon

**Files:**
- Modify: `src/app/(app)/vocabulary/page.tsx:3-13,308-323`

**Step 1: Add PlayCircle to lucide imports**

Add `PlayCircle` to the import list (alongside existing imports):
```tsx
import {
  BookMarked,
  ExternalLink,
  Loader2,
  MessageSquare,
  PlayCircle,
  Search,
  Volume2,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
```

**Step 2: Replace ExternalLink with PlayCircle for YouTube**

Current (lines 308-323):
```tsx
{link && (
  <div className="mb-3">
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      <ExternalLink className="h-3 w-3" />
      {w.source.type === "youtube"
        ? `YouTube${ts ? ` · ${ts}` : ""}`
        : `${w.source.title || w.source.type}${ts ? ` · ${ts}` : ""}`}
    </a>
  </div>
)}
```

Replace with:
```tsx
{link && (
  <div className="mb-3">
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      {w.source.type === "youtube" ? (
        <PlayCircle className="h-3 w-3" />
      ) : (
        <ExternalLink className="h-3 w-3" />
      )}
      {w.source.type === "youtube"
        ? `YouTube${ts ? ` · ${ts}` : ""}`
        : `${w.source.title || w.source.type}${ts ? ` · ${ts}` : ""}`}
    </a>
  </div>
)}
```

**Step 3: Build check**

```bash
npx tsc --noEmit
```

**Step 4: Commit**

```bash
git add src/app/(app)/vocabulary/page.tsx
git commit -m "feat(vocabulary): use PlayCircle icon for YouTube source links"
```

---

## Task 6: Update memzo.pen design file

**Files:**
- Modify: `memzo.pen`

This file is a large JSON-based design spec. All edits are string replacements within the `#19 [Web] 04 · Vocabulary` frame.

### 6a: Remove fp2 (未加入) and fp3 (已加入) filter buttons; rename fp4→fp2 and fix label

Find and remove the entire fp2 block (lines ~10049-10070). The block is:
```json
                    {
                      "type": "frame",
                      "id": "1Ogl8",
                      "name": "fp2",
                      "fill": "$--primary",
                      "cornerRadius": 8,
                      "padding": [
                        6,
                        12
                      ],
                      "children": [
                        {
                          "type": "text",
                          "id": "mjq1F",
                          "fill": "#FFFFFF",
                          "content": "未加入",
                          "fontFamily": "Nunito",
                          "fontSize": 14,
                          "fontWeight": "700"
                        }
                      ]
                    },
```

Find and remove the entire fp3 block (lines ~10071-10092):
```json
                    {
                      "type": "frame",
                      "id": "VlSM6",
                      "name": "fp3",
                      "fill": "$--muted",
                      "cornerRadius": 8,
                      "padding": [
                        6,
                        12
                      ],
                      "children": [
                        {
                          "type": "text",
                          "id": "YYcpx",
                          "fill": "$--muted-foreground",
                          "content": "已加入",
                          "fontFamily": "Nunito",
                          "fontSize": 14,
                          "fontWeight": "600"
                        }
                      ]
                    },
```

Then update fp4 (now becomes fp2 — the only non-all filter):
- Change `"name": "fp4"` → `"name": "fp2"`
- Change `"content": "已忽略"` → `"content": "已學習"` (in the HdkjW text node)

Also set fp1 (全部) as the active/selected filter:
- In the fp1 node (NTZRM id), change `"fill": "$--muted"` → `"fill": "$--primary"`
- Change its text node fill `"fill": "$--muted-foreground"` → `"fill": "#FFFFFF"`
- Change text fontWeight `"600"` → `"700"`

### 6b: Remove 已加入 badge from word3 rightSection

Find and remove the entire `importedBadge3` frame (lines ~10630-10660):
```json
                                {
                                  "type": "frame",
                                  "id": "nf4je",
                                  "name": "importedBadge3",
                                  "fill": "#DCFCE7",
                                  "cornerRadius": 999,
                                  "padding": [
                                    4,
                                    10
                                  ],
                                  "children": [
                                    {
                                      "type": "text",
                                      "id": "fE8IL",
                                      "name": "bgt3",
                                      "fill": "#16A34A",
                                      "content": "已加入",
                                      "fontFamily": "Nunito",
                                      "fontSize": 12,
                                      "fontWeight": "700"
                                    }
                                  ]
                                },
```

### 6c: Change YouTube external-link icon to play-circle

In `sourceLink1` (id 1TXuV), change the icon node (rVC2D):
```json
// Before
"iconFontName": "external-link",

// After
"iconFontName": "play-circle",
```

### 6d: Add Sentence play button in expandedContent1

In `expandedContent1` (id CowuK), after the definition text node (w74bK) and before `contextBlock1`, the current code area does not have an audio button (the design predates the play button). Add a `playRow` frame after `df1` text node:

Find the end of the df1 node:
```json
                            {
                              "type": "text",
                              "id": "w74bK",
                              "name": "df1",
                              ...
                            },
                            {
                              "type": "frame",
                              "id": "9Kz1l",
                              "name": "contextBlock1",
```

Insert a new `playRow` frame between `df1` and `contextBlock1`:
```json
                            {
                              "type": "frame",
                              "id": "pRw1X",
                              "name": "playRow1",
                              "gap": 6,
                              "alignItems": "center",
                              "children": [
                                {
                                  "type": "frame",
                                  "id": "pBt1A",
                                  "name": "playBtn1",
                                  "fill": "$--card",
                                  "cornerRadius": 8,
                                  "gap": 6,
                                  "padding": [6, 10],
                                  "alignItems": "center",
                                  "children": [
                                    {
                                      "type": "icon_font",
                                      "id": "pIc1A",
                                      "width": 14,
                                      "height": 14,
                                      "iconFontName": "volume-2",
                                      "iconFontFamily": "lucide",
                                      "fill": "$--foreground"
                                    },
                                    {
                                      "type": "text",
                                      "id": "pTx1A",
                                      "fill": "$--foreground",
                                      "content": "Play",
                                      "fontFamily": "Nunito",
                                      "fontSize": 12,
                                      "fontWeight": "600"
                                    }
                                  ]
                                },
                                {
                                  "type": "frame",
                                  "id": "sBt1A",
                                  "name": "sentenceBtn1",
                                  "fill": "$--card",
                                  "cornerRadius": 8,
                                  "gap": 6,
                                  "padding": [6, 10],
                                  "alignItems": "center",
                                  "children": [
                                    {
                                      "type": "icon_font",
                                      "id": "sIc1A",
                                      "width": 14,
                                      "height": 14,
                                      "iconFontName": "message-square",
                                      "iconFontFamily": "lucide",
                                      "fill": "$--foreground"
                                    },
                                    {
                                      "type": "text",
                                      "id": "sTx1A",
                                      "fill": "$--foreground",
                                      "content": "Sentence",
                                      "fontFamily": "Nunito",
                                      "fontSize": 12,
                                      "fontWeight": "600"
                                    }
                                  ]
                                }
                              ]
                            },
```

### 6e: Update actions1 to match current code (remove Add to Deck, rename 忽略→已學習)

In `actions1` (id Z3Imu):
- Remove the entire `addBtn1` frame (YKUcz id, "Add to Deck")
- In `ignoreBtn1` (ivVZS id), change text content `"忽略"` → `"已學習"`
  - Also change text fill from `"$--muted-foreground"` to `"$--foreground"`

**Step — commit:**

```bash
git add memzo.pen
git commit -m "design(vocabulary): update memzo.pen — remove unused filters/badges, add sentence btn, play-circle icon"
```

---

## Final verification

```bash
npx tsc --noEmit && echo "✅ TypeScript clean"
```

Check in browser (dev server):
1. Vocabulary page loads — only "全部" and "已學習" filter tabs
2. No "已加入" green badge on any card
3. Clicking circle toggles status without expanding card
4. Expanding a card with context shows "Sentence" button that speaks aloud
5. YouTube source shows play-circle icon; non-YouTube shows external-link icon
