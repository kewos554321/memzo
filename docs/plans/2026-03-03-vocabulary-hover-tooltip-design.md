# Vocabulary Hover Tooltip Design

**Date:** 2026-03-03
**Status:** Approved

## Overview

Add a hover tooltip to vocabulary card word names that shows structured word details (phonetic, definitions with POS, pronunciation button, and status buttons), mirroring the extension's tooltip experience.

## User Story

As a user browsing the vocabulary page, when I hover over a word name in a card, I want to see a rich tooltip showing the word's phonetic, part-of-speech, translated definitions, and status toggle buttons — without needing to expand the card.

## Architecture

```
vocabulary/page.tsx
  └── Word <span> (hover trigger, 200ms intent delay)
        └── VocabularyTooltip component (new)
              ├── fetch /api/dictionary?word=xxx (new)
              │     └── proxies Free Dictionary API
              ├── fetch /api/translate (new)
              │     └── proxies Google Translate (same as ext)
              └── PATCH /api/words/[id] (existing)

useSettings() hook (existing)
  └── provides nativeLang for translation target
```

## Components & Files

### 1. `/api/dictionary` — New API Route

**File:** `src/app/api/dictionary/route.ts`

- `GET /api/dictionary?word={word}`
- Proxies `https://api.dictionaryapi.dev/api/v2/entries/en/{word}`
- Returns `DictionaryEntry` shape:

```typescript
interface DictionaryEntry {
  word: string;
  phonetic?: string;
  audioUrl?: string;
  meanings: {
    partOfSpeech: string;
    definitions: { definition: string; example?: string }[];
  }[];
}
```

- Returns `null` when word not found (404 from upstream)
- No caching (Next.js default)

### 2. `/api/translate` — New API Route

**File:** `src/app/api/translate/route.ts`

- `POST /api/translate`
- Body: `{ texts: string[], targetLang: string }`
- Response: `{ translations: string[] }`
- Proxies `https://translate.googleapis.com/translate_a/t?client=gtx&sl=auto&tl={targetLang}&q=...`
- Handles both single and batch translation (same logic as ext's `translator.ts`)

### 3. `VocabularyTooltip` — New Component

**File:** `src/components/vocabulary/VocabularyTooltip.tsx`

Props:
```typescript
interface VocabularyTooltipProps {
  wordId: string;
  word: string;
  status: string;         // "saved" | "ignored" | "imported"
  nativeLang: string;     // from useSettings()
  onStatusChange: (id: string, nextStatus: string) => void;
}
```

**Behavior:**
- Mounted inside a `relative` positioned container on the word name
- On mount: fetches `/api/dictionary?word={word}` (once per render)
- After fetch: if nativeLang !== "en", calls `/api/translate` with the definitions
- Displays: word, phonetic, audio button (if audioUrl), meaning lines, status buttons
- Positioned above the word with CSS arrow pointer (same as ext)
- `pointerEvents: auto` so mouse can move into tooltip without hiding

**Status mapping (web → tooltip display):**

| web `status` | 學習中 button | 已掌握 button |
|--------------|--------------|--------------|
| `saved`      | active (blue)| inactive     |
| `ignored`    | inactive     | active (green)|
| `imported`   | inactive     | inactive     |

**Status toggle logic:**
- "學習中" click: `saved` ↔ `saved` (toggle via PATCH keeps `saved`)
  Actually: clicking "學習中" when inactive → set `saved`; clicking when active → set `saved` (no-op; saved is the learning state)
- "已掌握" click: when inactive → PATCH `ignored`; when active → PATCH `saved`

**Visual style:**
- Dark theme: `bg-[#18181b]` background
- White text for word, muted for phonetic
- Blue (`text-blue-400`) italic POS abbreviations
- Positioned: `absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2`
- Min width 220px, max width 300px
- Box shadow: `shadow-[0_12px_32px_rgba(0,0,0,0.65)]`
- Arrow: rotated div at bottom center

**POS abbreviation map:**
```typescript
const POS_ABBR: Record<string, string> = {
  noun: "n.", verb: "v.", adjective: "adj.", adverb: "adv.",
  pronoun: "pron.", preposition: "prep.", conjunction: "conj.",
  interjection: "int.", article: "art.", determiner: "det.",
};
```

### 4. Update `vocabulary/page.tsx`

**Change:** Wrap the word `<span>` (currently at line 250) in a hover container:

```tsx
// Add to page state:
const [hoveredId, setHoveredId] = useState<string | null>(null);
const showTimerRef = useRef<ReturnType<typeof setTimeout>>();
const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();

// Wrap word span:
<div
  className="relative inline-block"
  onMouseEnter={() => { /* 200ms intent delay → setHoveredId(w.id) */ }}
  onMouseLeave={() => { /* 80ms delay → setHoveredId(null) */ }}
>
  <span className="font-heading text-base font-bold text-foreground cursor-default">
    {w.word}
  </span>
  {hoveredId === w.id && (
    <VocabularyTooltip
      wordId={w.id}
      word={w.word}
      status={w.status}
      nativeLang={settings.nativeLang}
      onStatusChange={handleTooltipStatusChange}
      onMouseEnter={() => { /* keep visible */ }}
      onMouseLeave={() => { /* 80ms hide */ }}
    />
  )}
</div>
```

- Import `useSettings` to get `nativeLang`
- Add global hover-intent logic (one tooltip at a time)
- `handleTooltipStatusChange` uses existing `handleToggleStatus` logic but maps tooltip states to web states

## Acceptance Criteria

- [ ] Hovering over a word name shows tooltip after 200ms
- [ ] Tooltip displays word, phonetic (if available), audio button (if audioUrl)
- [ ] Tooltip shows up to 3 meanings with POS abbreviations
- [ ] Definitions are translated to user's nativeLang (from settings)
- [ ] "學習中" button reflects `saved` status (active = saved)
- [ ] "已掌握" button reflects `ignored` status (active = ignored)
- [ ] Clicking status buttons updates word status via PATCH API
- [ ] Moving mouse from word into tooltip keeps tooltip visible
- [ ] Tooltip hides after mouse leaves both word and tooltip
- [ ] Only one tooltip shown at a time
- [ ] English-only users (nativeLang = "en") see English definitions without translation call

## Out of Scope

- Mobile touch support (tooltip is hover-only)
- Definition caching (Next.js default is fine for now)
- Sentence TTS in tooltip (remains in expanded card only)
- CEFR-based word highlighting on vocabulary page
