# Vocabulary Tooltip v2 + Card UI Improvements

**Date:** 2026-03-03
**Status:** Approved

## Overview

Six focused improvements to the vocabulary page and its sentence tooltip:
1. Redesign tooltip to match project claymorphism/teal theme
2. Ensure tooltip always shows audio play button when available
3. Allow adding non-vocabulary sentence words to vocabulary from tooltip
4. Remove duplicate definition from card header
5. Show YouTube video title in source link
6. Move sentence play button to left of sentence, icon-only

---

## Change 1: Tooltip Redesign (match project theme)

**File:** `src/components/vocabulary/VocabularyTooltip.tsx`

**Current:** Dark zinc `bg-[#18181b]` with white text — clashes with project's teal claymorphism style.

**New visual spec:**
- Background: `bg-card` (white)
- Border: `border border-border` (teal `#99F6E4`)
- Shadow: `shadow-[0_8px_24px_rgba(13,148,136,0.12)]`
- Foreground text: `text-foreground` (`#134E4A`)
- Phonetic: `text-muted-foreground`
- POS abbreviations: `text-primary italic` (teal)
- Definition text: `text-foreground/80`
- Arrow pointer: `bg-card border-r border-b border-border`
- Border radius: `rounded-xl` (matching card style)

**Status buttons:**
- 學習中 active: `bg-amber-50 border-amber-300 text-amber-700`
- 學習中 inactive: `bg-muted border-border text-muted-foreground hover:text-foreground`
- 已掌握 active: `bg-teal-50 border-primary/40 text-primary`
- 已掌握 inactive: `bg-muted border-border text-muted-foreground hover:text-foreground`

**Layout:**
```
┌─────────────────────────────┐
│  word  /fɒnətɪk/  [🔊]     │  white bg, teal border
│  n.  definition text        │  teal POS, dark text
│  v.  another meaning        │
│ ┌─────────────┐ ┌─────────┐ │
│ │ 📖 學習中   │ │ ✓ 已掌握│ │
│ └─────────────┘ └─────────┘ │
└──────────┬──────────────────┘
           ▼ (teal arrow)
```

---

## Change 2: Audio Play in Tooltip

**Already implemented** — `entry?.audioUrl` check exists. The redesign makes the `Volume2` icon (Lucide) more visible with teal color:
- Replace inline SVG with `<Volume2 className="h-3.5 w-3.5 text-primary" />`
- Button: `rounded-full p-1 hover:bg-muted transition-colors`

---

## Change 3: Add Non-Vocabulary Words from Sentence Tooltip

**Problem:** Words in sentences not yet in vocabulary show the tooltip with definitions but no action. Users want to add these words to their vocabulary.

**Solution:** When `capturedWord === null` and `entry !== null` (dictionary data loaded), show an `+ 加入學習` button.

**New props for `SentenceWithTooltips`:**
```typescript
wordSource: CapturedWord["source"]  // parent card's source
onAddWord: (word: string, definition: string) => Promise<void>
```

**New props for `VocabularyTooltip`:**
```typescript
wordSource?: CapturedWord["source"]
onAddWord?: (word: string, definition: string) => Promise<void>
```

**VocabularyTooltip behavior:**
- When `capturedWord === null` and `entry` has definitions:
  - Show single `+ 加入學習` button (full width, primary style)
  - On click: call `onAddWord(word, entry.meanings[0].definitions[0].definition)`
  - Show loading state while saving
- After save: parent updates `words` state → next hover shows status buttons

**VocabularyPage new handler:**
```typescript
async function handleAddWordFromSentence(
  word: string,
  definition: string,
  source: CapturedWord["source"]
) {
  const res = await fetch("/api/words/capture", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word, definition, source }),
  });
  if (res.ok) {
    const newWord = await res.json();
    setWords(prev => [...prev, { ...newWord, definition, source }]);
  }
}
```

Pass as `onAddWord` with source bound: `(word, def) => handleAddWordFromSentence(word, def, w.source)`

---

## Change 4: Remove Duplicate Definition from Card Header

**File:** `src/app/(app)/vocabulary/page.tsx`

**Remove** the `<p className="line-clamp-1 text-xs text-muted-foreground">{w.definition}</p>` from the card header area (lines 273-275).

The full definition remains in the expanded section only. Card header shows: word + phonetic only.

---

## Change 5: YouTube Source Shows Video Title

**File:** `src/app/(app)/vocabulary/page.tsx`

**Current logic:**
```tsx
w.source.type === "youtube"
  ? `YouTube${ts ? ` · ${ts}` : ""}`
  : `${w.source.title || w.source.type}${ts ? ` · ${ts}` : ""}`
```

**New logic:** Show title for all source types including YouTube:
```tsx
const sourceLabel = w.source.title || (w.source.type === "youtube" ? "YouTube" : w.source.type);
`${sourceLabel}${ts ? ` · ${ts}` : ""}`
```

---

## Change 6: Play Sentence Button — Left of Sentence, Icon-Only

**File:** `src/app/(app)/vocabulary/page.tsx`

**Current:** "Sentence" button (icon + text) on the right side of the expanded definition row.

**New layout:**
- Remove sentence button from the definition row's right side
- Add icon-only `Volume2` button to the LEFT of the sentence block
- Layout:
  ```
  [🔊]  "The word appeared in this context..."
  ```
- Button: `rounded-full p-1.5 shrink-0 text-muted-foreground hover:text-primary hover:bg-muted transition-colors`
- The sentence container becomes a flex row: `flex items-start gap-2`

---

## Acceptance Criteria

- [ ] Tooltip uses white/teal theme matching project style
- [ ] Tooltip audio button visible and functional
- [ ] Hovering a non-vocabulary sentence word shows `+ 加入學習` button
- [ ] Clicking `+ 加入學習` saves word via `/api/words/capture` and updates word list
- [ ] Card header no longer shows definition preview (word + phonetic only)
- [ ] YouTube source link shows video title (e.g., "Advanced English Vocab · 1:23")
- [ ] Sentence play button is icon-only, left of sentence text
- [ ] Play button in expanded section right side is removed

## Out of Scope

- Mobile touch support for tooltips
- Definition caching
- Adding words from non-sentence contexts
- Batch add multiple words at once
