# Vocabulary Tooltip v2 + Card UI Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the vocabulary tooltip to match the project's teal claymorphism theme and add 5 UI improvements to the vocabulary page.

**Architecture:** Three files are modified — `VocabularyTooltip.tsx` (tooltip redesign + audio + add-word button), `SentenceWithTooltips.tsx` (pass new props), and `vocabulary/page.tsx` (remove dupe definition, fix source title, move play button, add handler). No new files needed.

**Tech Stack:** Next.js 15, TypeScript 5, Tailwind CSS 4, Lucide React, shadcn/ui. No tests exist in project — verify with `tsc --noEmit` and browser.

**Design doc:** `docs/plans/2026-03-03-vocabulary-tooltip-v2-design.md`

---

## Task 1: Redesign VocabularyTooltip to match project theme

**Files:**
- Modify: `src/components/vocabulary/VocabularyTooltip.tsx`

### Step 1: Verify current state compiles

```bash
cd /path/to/memzo-web
npx tsc --noEmit
```

Expected: 0 errors (baseline).

### Step 2: Replace the tooltip container styling

In `src/components/vocabulary/VocabularyTooltip.tsx`, replace the outer div's className from:
```tsx
className="rounded-[10px] border border-white/10 bg-[#18181b] p-[12px_14px] text-left text-sm leading-relaxed shadow-[0_12px_32px_rgba(0,0,0,0.65)]"
```
to:
```tsx
className="rounded-xl border border-border bg-card p-[12px_14px] text-left text-sm leading-relaxed shadow-[0_8px_24px_rgba(13,148,136,0.12)]"
```

### Step 3: Update word + phonetic row colors

Replace the word span and phonetic span:
```tsx
// word span: change text-[#f4f4f5] → text-foreground
<span className="text-base font-bold text-foreground">{word}</span>

// phonetic span: change text-[#a1a1aa] → text-muted-foreground
<span className="text-xs text-muted-foreground">{entry.phonetic}</span>
```

### Step 4: Replace inline SVG audio button with Lucide icon

At the top of the file, add `Volume2` to the import:
```tsx
import { Volume2 } from "lucide-react";
```

Replace the audio button's SVG with:
```tsx
<button
  onClick={playAudio}
  className="inline-flex items-center rounded-full p-1 text-primary hover:bg-muted transition-colors"
  title="播放發音"
>
  <Volume2 className="h-3.5 w-3.5" />
</button>
```

### Step 5: Update POS + definition line colors

Replace:
```tsx
<span className="shrink-0 italic text-blue-400">{line.pos}</span>
<span className="text-[#d4d4d8]">{line.text}</span>
```
with:
```tsx
<span className="shrink-0 italic text-primary">{line.pos}</span>
<span className="text-foreground/80">{line.text}</span>
```

Also update loading/not-found text:
```tsx
// change text-[#71717a] → text-muted-foreground (both occurrences)
<div className="mb-2.5 text-[13px] text-muted-foreground">載入中…</div>
<div className="mb-2.5 text-[13px] text-muted-foreground">查無此字</div>
```

### Step 6: Update status button colors

Replace 學習中 active classes:
```
border-blue-400/60 bg-blue-500/20 text-blue-300
→
border-amber-300 bg-amber-50 text-amber-700
```

Replace 學習中 inactive classes:
```
border-white/10 bg-transparent text-[#a1a1aa] hover:text-white
→
border-border bg-muted text-muted-foreground hover:text-foreground
```

Replace 已掌握 active classes:
```
border-emerald-400/60 bg-emerald-500/20 text-emerald-300
→
border-primary/40 bg-teal-50 text-primary
```

Replace 已掌握 inactive classes:
```
border-white/10 bg-transparent text-[#a1a1aa] hover:text-white
→
border-border bg-muted text-muted-foreground hover:text-foreground
```

### Step 7: Update arrow pointer styling

Replace:
```tsx
<div className="absolute bottom-[-6px] left-1/2 h-[10px] w-[10px] -translate-x-1/2 rotate-45 border-b border-r border-white/10 bg-[#18181b]" />
```
with:
```tsx
<div className="absolute bottom-[-6px] left-1/2 h-[10px] w-[10px] -translate-x-1/2 rotate-45 border-b border-r border-border bg-card" />
```

### Step 8: Verify TypeScript

```bash
npx tsc --noEmit
```

Expected: 0 errors.

### Step 9: Commit

```bash
git add src/components/vocabulary/VocabularyTooltip.tsx
git commit -m "feat(vocabulary): redesign tooltip to match teal claymorphism theme"
```

---

## Task 2: Add "加入學習" button for non-vocabulary sentence words

**Files:**
- Modify: `src/components/vocabulary/VocabularyTooltip.tsx`
- Modify: `src/components/vocabulary/SentenceWithTooltips.tsx`
- Modify: `src/app/(app)/vocabulary/page.tsx`

The goal: when a sentence word is NOT in the user's vocabulary, the tooltip shows a "+ 加入學習" button that calls POST `/api/words/capture`.

### Step 1: Extend VocabularyTooltipProps

In `src/components/vocabulary/VocabularyTooltip.tsx`, add two new optional props:

```tsx
// Add to the interface:
export interface VocabularyTooltipProps {
  word: string;
  triggerRect: DOMRect;
  capturedWord?: CapturedWordRef | null;
  onStatusChange?: (wordId: string, nextStatus: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  // NEW:
  onAddWord?: (word: string, definition: string) => Promise<void>;
}
```

### Step 2: Add loading state and "加入學習" button logic

Inside the `VocabularyTooltip` function body, add state:
```tsx
const [adding, setAdding] = useState(false);
const [added, setAdded] = useState(false);
```

Add the handler:
```tsx
async function handleAddWord() {
  if (!onAddWord || !entry?.meanings[0]?.definitions[0]) return;
  setAdding(true);
  await onAddWord(word, entry.meanings[0].definitions[0].definition);
  setAdded(true);
  setAdding(false);
}
```

### Step 3: Replace the `{capturedWord && ...}` status section

Currently the status buttons render only if `capturedWord` exists. Replace the entire block:

```tsx
{/* Status buttons or add button */}
{capturedWord ? (
  <div className="flex gap-1.5">
    <button
      onClick={handleLearningClick}
      className={`flex flex-1 items-center justify-center gap-1 rounded-[7px] border px-2 py-[5px] text-xs font-medium transition-all ${
        isLearning
          ? "border-amber-300 bg-amber-50 text-amber-700"
          : "border-border bg-muted text-muted-foreground hover:text-foreground"
      }`}
    >
      <span>📖</span>
      {isLearning ? "取消學習" : "學習中"}
    </button>
    <button
      onClick={handleMasteredClick}
      className={`flex flex-1 items-center justify-center gap-1 rounded-[7px] border px-2 py-[5px] text-xs font-medium transition-all ${
        isMastered
          ? "border-primary/40 bg-teal-50 text-primary"
          : "border-border bg-muted text-muted-foreground hover:text-foreground"
      }`}
    >
      <span>✓</span>
      {isMastered ? "取消掌握" : "已掌握"}
    </button>
  </div>
) : onAddWord && entry && !added ? (
  <button
    onClick={handleAddWord}
    disabled={adding}
    className="flex w-full items-center justify-center gap-1 rounded-[7px] border border-primary/40 bg-teal-50 px-2 py-[5px] text-xs font-medium text-primary transition-all hover:bg-teal-100 disabled:opacity-60"
  >
    {adding ? "加入中…" : "+ 加入學習"}
  </button>
) : added ? (
  <div className="flex w-full items-center justify-center gap-1 rounded-[7px] border border-primary/40 bg-teal-50 px-2 py-[5px] text-xs font-medium text-primary">
    ✓ 已加入
  </div>
) : null}
```

### Step 4: Add `onAddWord` prop to SentenceWithTooltipsProps

In `src/components/vocabulary/SentenceWithTooltips.tsx`:

```tsx
interface SentenceWithTooltipsProps {
  sentence: string;
  highlightWord?: string;
  allWords: WordEntry[];
  onStatusChange: (id: string, nextStatus: string) => void;
  // NEW:
  onAddWord?: (word: string, definition: string) => Promise<void>;
}
```

Add `onAddWord` to the destructured props:
```tsx
export function SentenceWithTooltips({
  sentence,
  highlightWord,
  allWords,
  onStatusChange,
  onAddWord,         // NEW
}: SentenceWithTooltipsProps) {
```

Pass it down to VocabularyTooltip:
```tsx
<VocabularyTooltip
  word={hovered.cleanWord}
  triggerRect={hovered.rect}
  capturedWord={capturedWord}
  onStatusChange={onStatusChange}
  onMouseEnter={handleTooltipEnter}
  onMouseLeave={handleWordLeave}
  onAddWord={onAddWord}    // NEW
/>
```

### Step 5: Add handler in VocabularyPage and pass to SentenceWithTooltips

In `src/app/(app)/vocabulary/page.tsx`, add a new handler function after `handleTooltipStatusChange`:

```tsx
async function handleAddWordFromSentence(
  parentWord: CapturedWord,
  word: string,
  definition: string
) {
  const res = await fetch("/api/words/capture", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word, definition, source: parentWord.source }),
  });
  if (res.ok) {
    const saved = await res.json();
    // Add to local state so tooltip updates immediately on next hover
    setWords((prev) => [
      ...prev,
      {
        id: saved.id,
        word,
        definition,
        source: parentWord.source,
        status: "saved",
        capturedAt: new Date().toISOString(),
      } as CapturedWord,
    ]);
  }
}
```

In the JSX where `SentenceWithTooltips` is rendered (inside `isExpanded` block), add the prop:

```tsx
<SentenceWithTooltips
  sentence={w.source.context}
  highlightWord={w.source.highlightWord}
  allWords={words}
  onStatusChange={handleTooltipStatusChange}
  onAddWord={(word, def) => handleAddWordFromSentence(w, word, def)}  // NEW
/>
```

### Step 6: Verify TypeScript

```bash
npx tsc --noEmit
```

Expected: 0 errors.

### Step 7: Commit

```bash
git add src/components/vocabulary/VocabularyTooltip.tsx \
        src/components/vocabulary/SentenceWithTooltips.tsx \
        src/app/(app)/vocabulary/page.tsx
git commit -m "feat(vocabulary): allow adding non-vocabulary sentence words from tooltip"
```

---

## Task 3: Remove duplicate definition from card header

**Files:**
- Modify: `src/app/(app)/vocabulary/page.tsx`

### Step 1: Locate and remove the definition preview line

In `src/app/(app)/vocabulary/page.tsx`, find the card header's "Word + definition preview" block (around line 261–276):

```tsx
{/* Word + definition preview */}
<div className="min-w-0 flex-1">
  <div className="flex items-baseline gap-2">
    <span className="font-heading text-base font-bold text-foreground">
      {w.word}
    </span>
    {w.phonetic && (
      <span className="text-xs text-muted-foreground">
        {w.phonetic}
      </span>
    )}
  </div>
  <p className="line-clamp-1 text-xs text-muted-foreground">   {/* ← REMOVE THIS LINE */}
    {w.definition}                                               {/* ← AND THIS */}
  </p>                                                           {/* ← AND THIS */}
</div>
```

Remove the `<p>` element entirely — keep only the word + phonetic div.

### Step 2: Verify TypeScript

```bash
npx tsc --noEmit
```

Expected: 0 errors.

### Step 3: Commit

```bash
git add src/app/(app)/vocabulary/page.tsx
git commit -m "fix(vocabulary): remove duplicate definition from card header"
```

---

## Task 4: Show YouTube video title in source link

**Files:**
- Modify: `src/app/(app)/vocabulary/page.tsx`

### Step 1: Locate the source link label logic

In the expanded section, find the source link `<a>` content (around line 357–364):

```tsx
{w.source.type === "youtube" ? (
  <PlayCircle className="h-3 w-3" />
) : (
  <ExternalLink className="h-3 w-3" />
)}
{w.source.type === "youtube"
  ? `YouTube${ts ? ` · ${ts}` : ""}`
  : `${w.source.title || w.source.type}${ts ? ` · ${ts}` : ""}`}
```

### Step 2: Replace with unified label logic

Replace the label expression with:
```tsx
{w.source.type === "youtube" ? (
  <PlayCircle className="h-3 w-3" />
) : (
  <ExternalLink className="h-3 w-3" />
)}
{`${w.source.title || (w.source.type === "youtube" ? "YouTube" : w.source.type)}${ts ? ` · ${ts}` : ""}`}
```

### Step 3: Verify TypeScript

```bash
npx tsc --noEmit
```

Expected: 0 errors.

### Step 4: Commit

```bash
git add src/app/(app)/vocabulary/page.tsx
git commit -m "fix(vocabulary): show video title in source link instead of 'YouTube'"
```

---

## Task 5: Move sentence play button to left of sentence, icon-only

**Files:**
- Modify: `src/app/(app)/vocabulary/page.tsx`

### Step 1: Check current imports

Ensure `Volume2` is already imported from `lucide-react` at the top. It should be — if not, add it:
```tsx
import {
  BookMarked,
  ExternalLink,
  Loader2,
  MessageSquare,   // ← can be removed after this task if unused
  PlayCircle,
  Search,
  Volume2,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
```

### Step 2: Remove Sentence button from the definition row

In the expanded section, find the definition + audio row (around line 302–330):

```tsx
<div className="mb-3 flex items-start justify-between gap-2">
  <p className="text-sm text-foreground">{w.definition}</p>
  <div className="flex shrink-0 items-center gap-1.5">
    {w.audioUrl && (
      <button ...>
        <Volume2 className="h-3.5 w-3.5" />
        Play
      </button>
    )}
    {w.source.context && (
      <button              {/* ← REMOVE THIS ENTIRE BUTTON */}
        onClick={...}
        className="..."
      >
        <MessageSquare className="h-3.5 w-3.5" />
        Sentence
      </button>
    )}
  </div>
</div>
```

Remove the `w.source.context &&` sentence button from this area entirely.

### Step 3: Add icon-only play button to the left of the sentence block

Find the context sentence block (around line 334–345):

```tsx
{w.source.context && (
  <div className="mb-3 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground">
    &ldquo;
    <SentenceWithTooltips ... />
    &rdquo;
  </div>
)}
```

Replace it with:
```tsx
{w.source.context && (
  <div className="mb-3 flex items-start gap-2">
    <button
      onClick={(e) => {
        e.stopPropagation();
        playSentence(w.source.context!);
      }}
      className="mt-0.5 shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
      title="播放句子"
    >
      <Volume2 className="h-4 w-4" />
    </button>
    <div className="flex-1 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground">
      &ldquo;
      <SentenceWithTooltips
        sentence={w.source.context}
        highlightWord={w.source.highlightWord}
        allWords={words}
        onStatusChange={handleTooltipStatusChange}
        onAddWord={(word, def) => handleAddWordFromSentence(w, word, def)}
      />
      &rdquo;
    </div>
  </div>
)}
```

### Step 4: Remove unused MessageSquare import if no longer used

Check if `MessageSquare` is still used anywhere. If not, remove it from the imports:
```tsx
// Remove: MessageSquare,
```

### Step 5: Verify TypeScript

```bash
npx tsc --noEmit
```

Expected: 0 errors.

### Step 6: Commit

```bash
git add src/app/(app)/vocabulary/page.tsx
git commit -m "feat(vocabulary): move sentence play button to left of sentence block"
```

---

## Final Verification

### Step 1: Build check

```bash
npm run build
```

Expected: Build succeeds, 0 TypeScript errors, 0 Next.js errors.

### Step 2: Browser verification checklist

Start dev server: `npm run dev`, open `http://localhost:3001/vocabulary`

- [ ] Tooltip background is white with teal border (not black)
- [ ] Tooltip POS text is teal (not blue)
- [ ] Audio button shows Volume2 icon in teal
- [ ] 學習中 button is amber when active
- [ ] 已掌握 button is teal when active
- [ ] Arrow pointer matches card background
- [ ] Hovering a sentence word NOT in vocabulary shows `+ 加入學習` button
- [ ] Clicking `+ 加入學習` shows "已加入" and word appears in list
- [ ] Card header shows word + phonetic only (no definition preview)
- [ ] YouTube source link shows video title (e.g. "My Video Title · 1:23")
- [ ] Sentence play button is icon-only on the left of sentence
- [ ] No play button in the definition row for sentence TTS

### Step 3: Final commit if any cleanup needed

```bash
git add -p
git commit -m "chore(vocabulary): cleanup unused imports after tooltip v2"
```
