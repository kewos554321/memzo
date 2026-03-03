# Vocabulary Hover Tooltip Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a hover tooltip to vocabulary card word names that shows structured definitions, phonetic, pronunciation, and status toggle buttons — mirroring the extension's tooltip.

**Architecture:** Three new pieces: (1) `/api/dictionary` route that proxies Free Dictionary API, (2) `/api/translate` route that proxies Google Translate's unofficial endpoint, (3) `VocabularyTooltip` React component that wires these together and is rendered inside the vocabulary card's word `<span>`. The vocabulary page fetches `nativeLang` via `useSettings()` and passes it down to the tooltip.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS v4, React 19, `useRef`/`useState` for hover-intent timers.

**No test framework exists in this project.** Each task's verification is done via TypeScript type-check (`npx tsc --noEmit`) and browser manual testing (`npm run dev`).

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
Expected JSON: `{ word: "trainable", phonetic: "...", meanings: [...] }`

Try a missing word:
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

## Task 2: Create `/api/translate` route

**Files:**
- Create: `src/app/api/translate/route.ts`

**Step 1: Create the file**

```typescript
// src/app/api/translate/route.ts
import { NextRequest, NextResponse } from "next/server";

async function translateBatch(texts: string[], targetLang: string): Promise<string[]> {
  const query = texts.map((t) => `q=${encodeURIComponent(t)}`).join("&");
  const url = `https://translate.googleapis.com/translate_a/t?client=gtx&sl=auto&tl=${targetLang}&${query}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Translation upstream failed: ${res.status}`);

  const data = await res.json() as string[][][] | string[][];
  // Single text: [[trans, src]] → extract data[0][0]
  // Multiple texts: [[[trans, src]], ...] → extract data[i][0][0]
  if (texts.length === 1) {
    return [Array.isArray(data[0]) ? (data[0] as string[])[0] : String(data[0])];
  }
  return (data as string[][][]).map((item) =>
    Array.isArray(item[0]) ? item[0][0] : String(item[0])
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { texts: string[]; targetLang: string };
  const { texts, targetLang } = body;

  if (!texts?.length || !targetLang) {
    return NextResponse.json({ error: "texts and targetLang required" }, { status: 400 });
  }

  // If target is English, no translation needed
  if (targetLang === "en") {
    return NextResponse.json({ translations: texts });
  }

  try {
    const translations = await translateBatch(texts, targetLang);
    return NextResponse.json({ translations });
  } catch {
    // On failure, return original texts (fail gracefully)
    return NextResponse.json({ translations: texts });
  }
}
```

**Step 2: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

**Step 3: Manual verify**

```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"texts":["capable of being trained"],"targetLang":"zh-TW"}'
```
Expected: `{"translations":["能夠被訓練的"]}`

**Step 4: Commit**

```bash
git add src/app/api/translate/route.ts
git commit -m "feat(api): add /api/translate route proxying Google Translate"
```

---

## Task 3: Create `VocabularyTooltip` component

**Files:**
- Create: `src/components/vocabulary/VocabularyTooltip.tsx`

**Context:** This is a pure React component. It fetches dictionary + translation data on mount, renders a dark tooltip styled to match the extension, and passes mouse events up so the parent can manage show/hide timing.

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

interface VocabularyTooltipProps {
  wordId: string;
  word: string;
  /** web status: "saved" | "ignored" | "imported" */
  status: string;
  nativeLang: string;
  onStatusChange: (wordId: string, nextStatus: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function VocabularyTooltip({
  wordId,
  word,
  status,
  nativeLang,
  onStatusChange,
  onMouseEnter,
  onMouseLeave,
}: VocabularyTooltipProps) {
  const [entry, setEntry] = useState<DictionaryEntry | null | undefined>(undefined);
  const [translatedDefs, setTranslatedDefs] = useState<string[] | null>(null);

  // Fetch dictionary entry on mount
  useEffect(() => {
    fetch(`/api/dictionary?word=${encodeURIComponent(word)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: DictionaryEntry | null) => setEntry(data))
      .catch(() => setEntry(null));
  }, [word]);

  // Translate definitions when entry loads
  useEffect(() => {
    if (!entry) return;
    const defs = entry.meanings
      .slice(0, 3)
      .map((m) => m.definitions[0]?.definition)
      .filter(Boolean) as string[];
    if (!defs.length) return;

    if (nativeLang === "en") {
      setTranslatedDefs(defs);
      return;
    }

    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: defs, targetLang: nativeLang }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { translations: string[] } | null) => {
        if (data) setTranslatedDefs(data.translations);
      })
      .catch(() => {});
  }, [entry, nativeLang]);

  function playAudio() {
    if (entry?.audioUrl) {
      new Audio(entry.audioUrl).play().catch(() => {});
    }
  }

  const meaningLines = entry?.meanings.slice(0, 3).map((m, i) => ({
    pos: abbr(m.partOfSpeech),
    text: translatedDefs?.[i] ?? m.definitions[0]?.definition ?? "",
  }));

  // Map web status to tooltip button active states
  const isLearning = status === "saved";
  const isMastered = status === "ignored";

  function handleLearningClick() {
    // "學習中" = saved; clicking when active has no effect (already saved)
    if (!isLearning) onStatusChange(wordId, "saved");
  }

  function handleMasteredClick() {
    // Toggle: ignored ↔ saved
    onStatusChange(wordId, isMastered ? "saved" : "ignored");
  }

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute z-50 min-w-[220px] max-w-[300px] rounded-[10px] border border-white/10 bg-[#18181b] p-[12px_14px] text-left text-sm leading-relaxed shadow-[0_12px_32px_rgba(0,0,0,0.65)]"
      style={{ bottom: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)" }}
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

      {/* Status buttons */}
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

      {/* Arrow */}
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
git commit -m "feat(vocabulary): add VocabularyTooltip component"
```

---

## Task 4: Wire tooltip into `vocabulary/page.tsx`

**Files:**
- Modify: `src/app/(app)/vocabulary/page.tsx`

**Context:** The word name `<span>` is currently inside the card header at the `{w.word}` render (around line 250). We need to:
1. Import `VocabularyTooltip` and `useSettings`
2. Add hover state + timer refs at page level
3. Wrap the word `<span>` in a `relative` container with hover handlers
4. Pass `settings.nativeLang` to the tooltip
5. Add `handleTooltipStatusChange` that calls the existing PATCH logic

**Step 1: Add imports and state to `VocabularyPage`**

Find the existing imports block (top of file) and add:

```typescript
// Add to existing imports:
import { useRef } from "react";
import { VocabularyTooltip } from "@/components/vocabulary/VocabularyTooltip";
import { useSettings } from "@/hooks/use-settings";
```

Inside `VocabularyPage` function, after the existing `useState` declarations, add:

```typescript
const { settings } = useSettings();
const [hoveredWordId, setHoveredWordId] = useState<string | null>(null);
const showTimerRef = useRef<ReturnType<typeof setTimeout>>();
const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();
```

**Step 2: Add `handleTooltipStatusChange` function**

Add after `handleToggleStatus`:

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

**Step 3: Add hover helper functions**

Add after `handleTooltipStatusChange`:

```typescript
function handleWordMouseEnter(id: string) {
  clearTimeout(hideTimerRef.current);
  showTimerRef.current = setTimeout(() => {
    setHoveredWordId(id);
  }, 200);
}

function handleWordMouseLeave() {
  clearTimeout(showTimerRef.current);
  hideTimerRef.current = setTimeout(() => {
    setHoveredWordId(null);
  }, 80);
}
```

**Step 4: Wrap the word `<span>` in a hover container**

Find this block in the JSX (around line 248-257):

```tsx
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
  <p className="line-clamp-1 text-xs text-muted-foreground">
    {w.definition}
  </p>
</div>
```

Replace with:

```tsx
<div className="min-w-0 flex-1">
  <div className="flex items-baseline gap-2">
    <span
      className="relative inline-block"
      onMouseEnter={(e) => {
        e.stopPropagation();
        handleWordMouseEnter(w.id);
      }}
      onMouseLeave={(e) => {
        e.stopPropagation();
        handleWordMouseLeave();
      }}
    >
      <span className="cursor-default font-heading text-base font-bold text-foreground">
        {w.word}
      </span>
      {hoveredWordId === w.id && (
        <VocabularyTooltip
          wordId={w.id}
          word={w.word}
          status={w.status}
          nativeLang={settings.nativeLang}
          onStatusChange={handleTooltipStatusChange}
          onMouseEnter={() => {
            clearTimeout(hideTimerRef.current);
          }}
          onMouseLeave={handleWordMouseLeave}
        />
      )}
    </span>
    {w.phonetic && (
      <span className="text-xs text-muted-foreground">
        {w.phonetic}
      </span>
    )}
  </div>
  <p className="line-clamp-1 text-xs text-muted-foreground">
    {w.definition}
  </p>
</div>
```

**Step 5: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

**Step 6: Manual browser test**

With `npm run dev` running, go to `http://localhost:3000/vocabulary`.
- Hover over a word name → tooltip should appear after ~200ms
- Tooltip shows phonetic, POS + definition (translated to your nativeLang)
- Audio button plays pronunciation
- "學習中" / "已掌握" buttons reflect and toggle the word's status
- Moving mouse into tooltip keeps it visible
- Moving mouse away from both word and tooltip hides it

**Step 7: Commit**

```bash
git add src/app/(app)/vocabulary/page.tsx
git commit -m "feat(vocabulary): wire hover tooltip to vocabulary cards"
```

---

## Acceptance Criteria Checklist

- [ ] `GET /api/dictionary?word=trainable` returns structured entry with meanings
- [ ] `GET /api/dictionary?word=xzyzzy99` returns `null` (not 404)
- [ ] `POST /api/translate` with `targetLang: "zh-TW"` returns Chinese translations
- [ ] `POST /api/translate` with `targetLang: "en"` returns original texts unchanged
- [ ] Hovering word name shows tooltip after 200ms
- [ ] Tooltip shows word, phonetic (if available), audio button (if audioUrl exists)
- [ ] Up to 3 meaning lines shown with POS abbreviations
- [ ] Definitions are in user's nativeLang
- [ ] "學習中" active when status="saved", "已掌握" active when status="ignored"
- [ ] Clicking status buttons updates word status via PATCH and re-renders
- [ ] Mouse moving from word into tooltip keeps tooltip open
- [ ] Tooltip hides 80ms after mouse leaves both word and tooltip
- [ ] Only one tooltip visible at a time (hover a second word hides first)
- [ ] TypeScript compiles with no errors
