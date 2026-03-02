# Feature: Vocabulary Capture

## Overview

The browser extension captures vocabulary words while users browse web content (YouTube, Netflix, etc.). Captured words are stored as `CapturedWord` records with status `"saved"` and appear in the Vocabulary inbox for review.

## Routes

| Path | Description |
|------|-------------|
| `/vocabulary` | Vocabulary inbox — review captured words |

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/words/capture` | Bearer | Capture a word (from extension) |
| GET | `/api/words` | Bearer | List captured words (filterable by status) |
| PATCH | `/api/words/[id]` | Bearer | Update word status |

## Word Status Values

| Status | Meaning |
|--------|---------|
| `saved` | Captured, not yet reviewed |
| `imported` | Added to a deck as a card |
| `ignored` | User dismissed it |

## Source Schema

The `source` field is a JSON blob describing where the word was captured:

```ts
{
  type: "youtube" | "netflix" | string;
  url?: string;
  videoId?: string;
  title?: string;
  timestamp?: number;   // seconds into video
  context?: string;     // sentence surrounding the word
  highlightWord?: string;
}
```

## Capture Behavior

- If the same word already exists for the user, the existing record is returned (status 200) instead of creating a duplicate (status 201)
- Words are associated with the authenticated user via Bearer token

## Query Parameters

`GET /api/words` supports:
- `?status=saved` — show only saved words
- `?status=imported` — show only imported words
- `?status=ignored` — show only ignored words
- No parameter — return all words

## Acceptance Criteria

- [ ] Extension can POST to `/api/words/capture` with Bearer token
- [ ] Duplicate word for same user returns existing record (200), not a new one
- [ ] Vocabulary page shows all `saved` words with word, definition, and source context
- [ ] User can filter words by status
- [ ] User can mark a word as `"ignored"` (PATCH status)
- [ ] Ignored words are hidden from the default `saved` view
- [ ] Captured words count is visible somewhere in the UI (badge or header)
