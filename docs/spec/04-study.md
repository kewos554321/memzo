# Feature: Study Sessions

## Overview

Users study a deck by reviewing flashcards one at a time. Each card is shown front-side up; the user flips it and marks it as "Known" or "Not Known." Results are saved as a `StudySession` after all cards are reviewed.

## Routes

| Path | Description |
|------|-------------|
| `/decks/[id]/study` | Active study view for a deck |
| `/decks/[id]/study-method` | Study settings before starting |
| `/study` | Continue studying the most recent deck |

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/study-sessions` | None | Record a completed study session |

## Study Flow

1. User opens a deck and taps "Study"
2. Optional: User configures study settings at `/decks/[id]/study-method`
3. Cards are shown one at a time (front side)
4. User taps to flip card and see the back
5. User marks card as **Known** or **Not Known**
6. After the last card, session results are submitted to `/api/study-sessions`
7. User returns to deck view; stats are updated

## Request Body

```json
{
  "deckId": "string",
  "results": [
    { "cardId": "string", "known": true }
  ],
  "completedAt": 1709385600000
}
```

`completedAt` is a Unix timestamp in milliseconds.

## Notes

- Session results drive the stats shown on the dashboard (see [08-stats.md](./08-stats.md))
- There is no server-side spaced repetition algorithm currently — all cards in the deck are shown every session
- The `/study` route provides a shortcut to continue the most recently studied deck

## Acceptance Criteria

- [ ] Cards are shown one at a time with flip animation
- [ ] User can mark each card as Known or Not Known
- [ ] After the last card, session results are submitted automatically
- [ ] Session is persisted with `deckId`, `results[]`, and `completedAt`
- [ ] `/study` route navigates to the most recently active deck's study view
- [ ] Study sessions contribute to dashboard stats (totalCards, weekMastered, streak)
