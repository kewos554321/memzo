# Feature: Stats & Progress

## Overview

The dashboard shows the user's learning progress with summary metric cards and a 7-day activity chart. Stats are derived from `StudySession` and `StudyResult` records in the database.

## Routes

| Path | Description |
|------|-------------|
| `/` | Dashboard (home) — shows stats |

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/stats` | None | Get user progress statistics |

## Stats Response

```json
{
  "totalCards": 120,
  "weekMastered": 34,
  "learningCount": 15,
  "todayMinutes": 12,
  "streak": 5,
  "weeklyData": [
    { "day": "Sun", "cards": 10, "minutes": 8 },
    { "day": "Mon", "cards": 25, "minutes": 20 },
    { "day": "Tue", "cards": 0, "minutes": 0 },
    { "day": "Wed", "cards": 18, "minutes": 14 },
    { "day": "Thu", "cards": 30, "minutes": 24 },
    { "day": "Fri", "cards": 22, "minutes": 18 },
    { "day": "Sat", "cards": 15, "minutes": 12 }
  ]
}
```

## Field Definitions

| Field | Description |
|-------|-------------|
| `totalCards` | Total number of cards across all decks |
| `weekMastered` | Cards marked `known: true` in the past 7 days |
| `learningCount` | Cards currently marked `known: false` (in active learning) |
| `todayMinutes` | Estimated study time for today (derived from session count) |
| `streak` | Consecutive days with at least one completed study session |
| `weeklyData` | Per-day breakdown for the last 7 days |

## Acceptance Criteria

- [ ] Dashboard shows `totalCards`, `weekMastered`, `learningCount`, `streak`
- [ ] 7-day chart renders with `day`, `cards`, and `minutes` per day
- [ ] Stats update immediately after a completed study session
- [ ] `streak` increments when user studies on a new calendar day
- [ ] `streak` resets if user misses a day
- [ ] Empty state handles users with no study sessions (all zeros)
