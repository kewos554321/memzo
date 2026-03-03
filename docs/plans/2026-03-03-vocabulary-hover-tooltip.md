# Vocabulary Hover Tooltip Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a hover tooltip to every word in vocabulary card context sentences. Hovering a word shows its definition (English, no translation), phonetic, pronunciation, and status toggle buttons if the word is already in the user's vocabulary.

**Architecture:** Three pieces: (1) `/api/dictionary` route proxying Free Dictionary API, (2) `VocabularyTooltip` component that uses `position: fixed` + `getBoundingClientRect()` to escape overflow-hidden card containers, (3) `SentenceWithTooltips` component that tokenizes the sentence string into hoverable word spans. The vocabulary page passes its `words` list down so any sentence word can look up its captured status.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS v4, React 19, `useRef`/`useState` for hover-intent timers.

**No test framework exists in this project.** Verify with `npx tsc --noEmit` + browser testing.

**Why `position: fixed`:** Vocabulary cards have `overflow: hidden` which clips `position: absolute` tooltips. Fixed positioning bypasses all ancestors and renders relative to the viewport.

---

## Task 1: Create `/api/dictionary` route

**Files:**
- Create: `src/app/api/dictionary/route.ts`

**Step 1: Create the file**

```typescript
// src/app/api/dictionary/route.ts
import { NextRequest, NextResponse } from "next/server";

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  audioUrl?: string;
  meanings: {
    partOfSpeech: string;
    definitions: { definition: string; example?: string }[];
  }[];
}

export async function GET(req: NextRequest) {
  const word = new URL(req.url).searchParams.get("word");
  if (!word) {
    return NextResponse.json({ error: "word param required" }, { status: 400 });
  }

  const upstream = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
    { headers: { "User-Agent": "memzo-web/1.0" } }
  );

  if (upstream.status === 404) {
    return NextResponse.json(null);
  }
  if (!upstream.ok) {
    return NextResponse.json({ error: "upstream error" }, { status: 502 });
  }

  const data = await upstream.json() as Array<{
    word: string;
    phonetics: { text?: string; audio?: string }[];
    meanings: {
      partOfSpeech: string;
      definitions: { definition: string; example?: string }[];
    }[];
  }>;

  const first = data[0];
  const phonetic = first.phonetics.find((p) => p.text)?.text;
  const audioUrl = first.phonetics.find((p) => p.audio)?.audio;

  const entry: DictionaryEntry = {
    word: first.word,
    phonetic,
    audioUrl,
    meanings: first.meanings.map((m) => ({
      partOfSpeech: m.partOfSpeech,
      definitions: m.definitions.slice(0, 2),
    })),
  };

  return NextResponse.json(entry);
}
```

**Step 2: Type-check**

```bash
cd /Users/jayson/Documents/practice/memzo-core/memzo-web
npx tsc --noEmit
```
Expected: no errors.

**Step 3: Manual verify**

Start dev server (`npm run dev`), then open browser:
```
http://localhost:3000/api/dictionary?word=trainable
```
Expected JSON: `{ word: "trainable", phonetic: "...", audioUrl: "...", meanings: [...] }`

```
http://localhost:3000/api/dictionary?word=xzyzzy99
```
Expected: `null`

**Step 4: Commit**

```bash
git add src/app/api/dictionary/route.ts
git commit -m "feat(api): add /api/dictionary route proxying Free Dictionary API"
```

---

## Task 2: Create `VocabularyTooltip` component

**Files:**
- Create: `src/components/vocabulary/VocabularyTooltip.tsx`

**Context:** This component renders at `position: fixed` so it escapes all overflow-hidden ancestors. It receives the word's bounding rect from the parent and positions itself above the word. It fetches the dictionary entry on mount. If the word is a captured vocabulary item (`capturedWord` prop is set), it shows status toggle buttons.

**`CapturedWord` type** is defined inline in `src/app/(app)/vocabulary/page.tsx`. Import it from there, or re-declare the minimal shape needed:

```typescript
// The minimal shape we need from the page's CapturedWord
interface CapturedWordRef {
  id: string;
  status: string;
}
```

**Step 1: Create the directory and file**

```bash
mkdir -p src/components/vocabulary
```

```typescript
// src/components/vocabulary/VocabularyTooltip.tsx
"use client";

import { useEffect, useState } from "react";
import type { DictionaryEntry } from "@/app/api/dictionary/route";

const POS_ABBR: Record<string, string> = {
  noun: "n.",
  verb: "v.",
  adjective: "adj.",
  adverb: "adv.",
  pronoun: "pron.",
  preposition: "prep.",
  conjunction: "conj.",
  interjection: "int.",
  article: "art.",
  determiner: "det.",
};

function abbr(pos: string) {
  return POS_ABBR[pos.toLowerCase()] ?? pos;
}

interface CapturedWordRef {
  id: string;
  status: string;
}

export interface VocabularyTooltipProps {
  word: string;
  /** Position of the triggering word element in the viewport */
  triggerRect: DOMRect;
  /** If this word is in the user's vocabulary, pass the captured word data */
  capturedWord?: CapturedWordRef | null;
  onStatusChange?: (id: string, nextStatus: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function VocabularyTooltip({
  word,
  triggerRect,
  capturedWord,
  onStatusChange,
  onMouseEnter,
  onMouseLeave,
}: VocabularyTooltipProps) {
  const [entry, setEntry] = useState<DictionaryEntry | null | undefined>(undefined);

  useEffect(() => {
    fetch(`/api/dictionary?word=${encodeURIComponent(word)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: DictionaryEntry | null) => setEntry(data))
      .catch(() => setEntry(null));
  }, [word]);

  function playAudio() {
    if (entry?.audioUrl) {
      new Audio(entry.audioUrl).play().catch(() => {});
    }
  }

  const meaningLines = entry?.meanings.slice(0, 3).map((m) => ({
    pos: abbr(m.partOfSpeech),
    text: m.definitions[0]?.definition ?? "",
  }));

  const isLearning = capturedWord?.status === "saved";
  const isMastered = capturedWord?.status === "ignored";

  function handleLearningClick() {
    if (!capturedWord || !onStatusChange) return;
    if (!isLearning) onStatusChange(capturedWord.id, "saved");
  }

  function handleMasteredClick() {
    if (!capturedWord || !onStatusChange) return;
    onStatusChange(capturedWord.id, isMastered ? "saved" : "ignored");
  }

  // Position: centered above the trigger word, using fixed coords
  const tooltipLeft = triggerRect.left + triggerRect.width / 2;
  const tooltipBottom = window.innerHeight - triggerRect.top + 10;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: "fixed",
        bottom: `${tooltipBottom}px`,
        left: `${tooltipLeft}px`,
        transform: "translateX(-50%)",
        zIndex: 9999,
        minWidth: "220px",
        maxWidth: "300px",
        pointerEvents: "auto",
      }}
      className="rounded-[10px] border border-white/10 bg-[#18181b] p-[12px_14px] text-left text-sm leading-relaxed shadow-[0_12px_32px_rgba(0,0,0,0.65)]"
    >
      {/* Word + phonetic + audio */}
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-base font-bold text-[#f4f4f5]">{word}</span>
        {entry?.phonetic && (
          <span className="text-xs text-[#a1a1aa]">{entry.phonetic}</span>
        )}
        {entry?.audioUrl && (
          <button
            onClick={playAudio}
            className="inline-flex items-center rounded p-0.5 text-blue-400 hover:text-blue-300"
            title="播放發音"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
          </button>
        )}
      </div>

      {/* Meanings */}
      {entry === undefined ? (
        <div className="mb-2.5 text-[13px] text-[#71717a]">載入中…</div>
      ) : entry === null || !meaningLines?.length ? (
        <div className="mb-2.5 text-[13px] text-[#71717a]">查無此字</div>
      ) : (
        <div className="mb-2.5">
          {meaningLines.map((line, i) => (
            <div key={i} className="mb-0.5 flex gap-[5px] text-[13px]">
              <span className="shrink-0 italic text-blue-400">{line.pos}</span>
              <span className="text-[#d4d4d8]">{line.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Status buttons — only shown for captured vocabulary words */}
      {capturedWord && (
        <div className="flex gap-1.5">
          <button
            onClick={handleLearningClick}
            className={`flex flex-1 items-center justify-center gap-1 rounded-[7px] border px-2 py-[5px] text-xs font-medium transition-all ${
              isLearning
                ? "border-blue-400/60 bg-blue-500/20 text-blue-300"
                : "border-white/10 bg-transparent text-[#a1a1aa] hover:text-white"
            }`}
          >
            <span>📖</span>
            {isLearning ? "取消學習" : "學習中"}
          </button>
          <button
            onClick={handleMasteredClick}
            className={`flex flex-1 items-center justify-center gap-1 rounded-[7px] border px-2 py-[5px] text-xs font-medium transition-all ${
              isMastered
                ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-300"
                : "border-white/10 bg-transparent text-[#a1a1aa] hover:text-white"
            }`}
          >
            <span>✓</span>
            {isMastered ? "取消掌握" : "已掌握"}
          </button>
        </div>
      )}

      {/* Arrow pointing down to the word */}
      <div
        className="absolute bottom-[-6px] left-1/2 h-[10px] w-[10px] -translate-x-1/2 rotate-45 border-b border-r border-white/10 bg-[#18181b]"
      />
    </div>
  );
}
```

**Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

**Step 3: Commit**

```bash
git add src/components/vocabulary/VocabularyTooltip.tsx
git commit -m "feat(vocabulary): add VocabularyTooltip component with fixed positioning"
```

---

## Task 3: Create `SentenceWithTooltips` component

**Files:**
- Create: `src/components/vocabulary/SentenceWithTooltips.tsx`

**Context:** This component replaces the existing `HighlightedContext` component in the expanded card. It splits the sentence into word and non-word tokens, wraps each word in a hoverable `<span>`, and shows `VocabularyTooltip` for the currently hovered word.

Hover state is managed inside this component (not at page level) using `useRef` timers for hover-intent (200ms show delay, 80ms hide delay).

**CapturedWord type** — the component only needs the minimal shape `{ id, word, status }` to look up a word's status. Import the full page type from the page if needed, or declare inline.

**Step 1: Create the file**

```typescript
// src/components/vocabulary/SentenceWithTooltips.tsx
"use client";

import { useRef, useState } from "react";
import { VocabularyTooltip } from "./VocabularyTooltip";

interface WordEntry {
  id: string;
  word: string;
  status: string;
}

interface SentenceWithTooltipsProps {
  sentence: string;
  highlightWord?: string;
  /** All of the user's captured vocabulary words, for status lookup */
  allWords: WordEntry[];
  onStatusChange: (id: string, nextStatus: string) => void;
}

interface HoveredToken {
  cleanWord: string;
  rect: DOMRect;
}

/** Split sentence into alternating word / non-word tokens */
function tokenize(sentence: string): { text: string; isWord: boolean }[] {
  const tokens: { text: string; isWord: boolean }[] = [];
  const regex = /([a-zA-Z'-]+)|([^a-zA-Z'-]+)/g;
  let match;
  while ((match = regex.exec(sentence)) !== null) {
    if (match[1]) {
      tokens.push({ text: match[1], isWord: true });
    } else {
      tokens.push({ text: match[2], isWord: false });
    }
  }
  return tokens;
}

export function SentenceWithTooltips({
  sentence,
  highlightWord,
  allWords,
  onStatusChange,
}: SentenceWithTooltipsProps) {
  const [hovered, setHovered] = useState<HoveredToken | null>(null);
  const showTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const tokens = tokenize(sentence);

  function handleWordEnter(cleanWord: string, e: React.MouseEvent<HTMLSpanElement>) {
    clearTimeout(hideTimerRef.current);
    const target = e.currentTarget;
    showTimerRef.current = setTimeout(() => {
      const rect = target.getBoundingClientRect();
      setHovered({ cleanWord, rect });
    }, 200);
  }

  function handleWordLeave() {
    clearTimeout(showTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setHovered(null);
    }, 80);
  }

  function handleTooltipEnter() {
    clearTimeout(hideTimerRef.current);
  }

  // Look up if the hovered word is a captured vocabulary word
  const capturedWord = hovered
    ? allWords.find(
        (w) => w.word.toLowerCase() === hovered.cleanWord.toLowerCase()
      ) ?? null
    : null;

  return (
    <span>
      {tokens.map((token, i) => {
        if (!token.isWord) {
          return <span key={i}>{token.text}</span>;
        }

        const isHighlighted =
          highlightWord &&
          token.text.toLowerCase() === highlightWord.toLowerCase();

        return (
          <span
            key={i}
            onMouseEnter={(e) => handleWordEnter(token.text, e)}
            onMouseLeave={handleWordLeave}
            className="cursor-default rounded"
            style={
              isHighlighted
                ? {
                    background: "rgba(250,204,21,0.3)",
                    borderRadius: "3px",
                    padding: "0 2px",
                  }
                : undefined
            }
          >
            {token.text}
          </span>
        );
      })}

      {/* Tooltip rendered at fixed position, outside overflow context */}
      {hovered && (
        <VocabularyTooltip
          word={hovered.cleanWord}
          triggerRect={hovered.rect}
          capturedWord={capturedWord}
          onStatusChange={onStatusChange}
          onMouseEnter={handleTooltipEnter}
          onMouseLeave={handleWordLeave}
        />
      )}
    </span>
  );
}
```

**Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

**Step 3: Commit**

```bash
git add src/components/vocabulary/SentenceWithTooltips.tsx
git commit -m "feat(vocabulary): add SentenceWithTooltips component"
```

---

## Task 4: Wire `SentenceWithTooltips` into `vocabulary/page.tsx`

**Files:**
- Modify: `src/app/(app)/vocabulary/page.tsx`

**Context:** The page currently renders `HighlightedContext` for the context sentence in expanded cards (around line 320-328). Replace it with `SentenceWithTooltips`. Also add `handleTooltipStatusChange` for status updates from inside the tooltip.

**Step 1: Update imports**

Find the top of `vocabulary/page.tsx`. Replace the `HighlightedContext` import (it's defined in the same file, not imported) — leave it in place since it may still be referenced. Add the new component import:

```typescript
// Add to the existing import block at the top of the file:
import { SentenceWithTooltips } from "@/components/vocabulary/SentenceWithTooltips";
```

**Step 2: Add `handleTooltipStatusChange`**

Inside `VocabularyPage`, after the existing `handleToggleStatus` function, add:

```typescript
async function handleTooltipStatusChange(id: string, nextStatus: string) {
  const word = words.find((w) => w.id === id);
  if (!word || word.status === nextStatus) return;
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

**Step 3: Replace `HighlightedContext` usage with `SentenceWithTooltips`**

Find this block in the JSX (inside the expanded card section, around line 320-328):

```tsx
{w.source.context && (
  <div className="mb-3 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground">
    &ldquo;
    <HighlightedContext
      context={w.source.context}
      highlightWord={w.source.highlightWord}
    />
    &rdquo;
  </div>
)}
```

Replace with:

```tsx
{w.source.context && (
  <div className="mb-3 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground">
    &ldquo;
    <SentenceWithTooltips
      sentence={w.source.context}
      highlightWord={w.source.highlightWord}
      allWords={words}
      onStatusChange={handleTooltipStatusChange}
    />
    &rdquo;
  </div>
)}
```

**Step 4: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

**Step 5: Manual browser test**

With `npm run dev` running, go to `http://localhost:3000/vocabulary`.

1. Click a vocabulary card to expand it — see the context sentence
2. Hover over any word in the sentence → tooltip appears above the word after ~200ms
3. Tooltip shows word, phonetic, POS + English definition
4. Tooltip is NOT clipped by the card border (it floats above all containers)
5. For the highlighted target word (yellow background), status buttons appear in the tooltip
6. Clicking "已掌握" changes the word's status — circle in card header updates
7. Moving mouse from word into tooltip keeps tooltip open
8. Moving mouse away from both word and tooltip hides it after 80ms

**Step 6: Commit**

```bash
git add src/app/(app)/vocabulary/page.tsx
git commit -m "feat(vocabulary): replace HighlightedContext with SentenceWithTooltips"
```

---

## Acceptance Criteria Checklist

- [ ] `GET /api/dictionary?word=trainable` returns `{ word, phonetic, audioUrl, meanings }`
- [ ] `GET /api/dictionary?word=xzyzzy99` returns `null`
- [ ] Hovering a word in the context sentence shows tooltip after 200ms
- [ ] Tooltip appears ABOVE the card container (not clipped by overflow)
- [ ] Tooltip shows word, phonetic (if available), audio button (if audioUrl exists)
- [ ] Up to 3 meaning lines with POS abbreviations (English only)
- [ ] Status buttons appear only when hovered word is a captured vocabulary word
- [ ] "學習中" active when status="saved", "已掌握" active when status="ignored"
- [ ] Clicking status buttons calls PATCH and updates card status circle
- [ ] Mouse moving from word into tooltip keeps tooltip open
- [ ] Tooltip hides 80ms after mouse leaves both word and tooltip
- [ ] Highlighted target word (yellow background) is preserved
- [ ] TypeScript compiles with no errors

---

## Notes for Codex

- **Do NOT create `/api/translate`** — translation was removed from scope. Definitions are English only.
- **`HighlightedContext` component** in `vocabulary/page.tsx` can be left in the file but is no longer used in JSX. You may delete it if you prefer clean code.
- **The `allWords` prop** passed to `SentenceWithTooltips` is the full `words` state array from the page — this is how any sentence word can check if it's a captured vocabulary item.
- **AGENTS.md conflict resolution** (confirmed by spec author):
  - API response shape: follow the plan (raw data, not `{ data }` wrapper) — matches existing routes in this codebase
  - TDD: proceed with `tsc --noEmit` + browser testing — no test framework is installed
