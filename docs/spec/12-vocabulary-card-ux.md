# Vocabulary Card UX Improvements

**Version:** 1.0.0
**Status:** In Progress
**Spec file:** docs/spec/12-vocabulary-card-ux.md

## Overview

Simplify the vocabulary filter bar, remove redundant status badges, make status circles clickable to toggle learning state, add sentence TTS playback, and upgrade the YouTube source link to use a play icon.

## User Stories

- As a user, I want to see only "全部" and "已學習" filter tabs so the list is not cluttered with deck-membership filters.
- As a user, I want to click the status circle on any vocabulary card to toggle between 學習中 (saved) and 已學習 (ignored) without expanding the card.
- As a user, I want a play button for the context sentence so I can hear how the word is used in context, not just the pronunciation.
- As a user, I want YouTube source links to use a recognisable play icon instead of an external-link icon.

## UI Changes — `src/app/(app)/vocabulary/page.tsx`

### 1. Remove filters

Remove `{ value: "saved", label: "未加入" }` and `{ value: "imported", label: "已加入" }` from the `filters` array.
Keep: `全部` (all) and `已學習` (ignored).
Update `FilterStatus` type and initial filter state accordingly (`"all"` as default).

### 2. Remove "已加入" card badge

In the card right-section (`rightSection`), remove the green "已加入" badge shown when `w.status === "imported"`.
Keep only the "已學習" muted badge (for `ignored`) and the `"1 context"` text (for `saved`).

### 3. Status circle — clickable toggle

The status circle must become a standalone interactive button:
- Stop click propagation so it does not trigger card expand/collapse.
- On click, call `handleToggleStatus(id)` which:
  - `saved` → PATCH `status: "ignored"`
  - `ignored` → PATCH `status: "saved"`
  - `imported` → PATCH `status: "ignored"` (one-way only; already in deck)
- Visual states remain unchanged (amber for saved, gray for ignored, primary+check for imported).
- Add `cursor-pointer` and `hover:opacity-80 transition-opacity` classes.

**API:** `PATCH /api/words/:id` with `{ status }` already supports any status string.

### 4. Sentence TTS playback

In the expanded content, next to the existing audio "Play" button, add a second button "Sentence" that uses the Web Speech API (`window.speechSynthesis`) to speak `w.source.context`.

Button layout (inside the `mb-3 flex items-start justify-between` row):
```
[definition text]   [▶ Play]  [🔊 Sentence]
```

- Only show "Sentence" button if `w.source.context` is present.
- Use `SpeakSquare` / `Volume2` icon from lucide for the sentence button (or `MessageSquare` to differentiate).
- On click: cancel any running utterance, create a new `SpeechSynthesisUtterance(w.source.context)`, call `speechSynthesis.speak(utterance)`.
- Stop propagation on both play buttons.

### 5. YouTube source link — play icon

For YouTube sources, replace the `ExternalLink` lucide icon with `PlayCircle` (or `CirclePlay`) from lucide.
Non-YouTube sources keep `ExternalLink`.

```tsx
// before
<ExternalLink className="h-3 w-3" />

// after (YouTube only)
<PlayCircle className="h-3 w-3" />
```

## Design File Changes — `memzo.pen`

Update the `#19 [Web] 04 · Vocabulary` frame:

### Filter row
- Remove `fp2` node (`未加入` button, id `1Ogl8`)
- Remove `fp3` node (`已加入` button, id `VlSM6`)
- Rename `fp4` → `fp2`, and update the `已忽略` label to `已學習` to match code
- Set `fp1` (全部) as the active/selected filter (primary background)

### Card badges
- Remove the `已加入` text badge from `word3`'s `rightSection` (line ~10647)

### YouTube source link icon
- Change `sourceLink1` icon from `external-link` to `play-circle` (lucide)

### Sentence play button
- In `expandedContent1` (word1), add a second button `sentenceBtn1` next to the existing audio button:
  ```json
  {
    "type": "frame", "name": "sentenceBtn1",
    "cornerRadius": 8, "fill": "$--card",
    "padding": [6, 10],
    "gap": 6, "alignItems": "center",
    "children": [
      { "type": "icon_font", "iconFontName": "volume-2", "iconFontFamily": "lucide",
        "width": 14, "height": 14, "fill": "$--foreground" },
      { "type": "text", "content": "Sentence", "fontFamily": "Nunito",
        "fontSize": 12, "fontWeight": "600", "fill": "$--foreground" }
    ]
  }
  ```

### Status circle
- No visual change needed in the design file (interaction is code-only).

## Acceptance Criteria

- [ ] Filter bar shows only "全部" and "已學習"
- [ ] "已加入" green badge no longer appears on any vocabulary card
- [ ] Clicking a status circle toggles the word between saved/ignored without expanding the card
- [ ] Expanded card shows a "Sentence" button that speaks the context aloud via TTS
- [ ] YouTube source link shows a play-circle icon
- [ ] All changes reflected in `memzo.pen` design file
- [ ] No regressions to search, expand/collapse, or existing filter functionality

## Out of Scope

- Multi-language TTS voice selection
- Persisting TTS language preference
- Toggling `imported` back to `saved` (imported = in deck, separate flow)
- Any changes to the deck or study pages
