# Feature: Word Import

## Overview

Users select one or more captured words from the Vocabulary inbox and import them into a deck. Each imported word becomes a `Card` with `front = word` and `back = definition`. Words are then marked as `"imported"`.

## Routes

| Path | Description |
|------|-------------|
| `/vocabulary` | Import is triggered from the Vocabulary page |

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/words/import` | Bearer | Import words into a deck |

## Request Body

```json
{
  "wordIds": ["clw1abc", "clw2def"],
  "collectionId": "deckId"
}
```

> Note: The field is named `collectionId` (legacy name for deck ID).

## Import Logic

1. User selects words to import (multi-select)
2. User selects a destination deck
3. POST `/api/words/import` with `wordIds[]` and `collectionId`
4. Server creates `Card` records: `{ front: word, back: definition }`
5. Server marks each `CapturedWord` as `status: "imported"`, `importedTo: deckId`
6. Response: `{ imported: number }`

## Response

```json
{
  "imported": 3
}
```

## Error Cases

| Status | Condition |
|--------|-----------|
| 400 | `wordIds` is empty or missing, or `collectionId` is missing |
| 401 | Missing or invalid Bearer token |
| 404 | Deck with `collectionId` not found |

## Acceptance Criteria

- [ ] User can select multiple words from Vocabulary for bulk import
- [ ] User selects a destination deck from their decks list
- [ ] Imported words appear as cards in the destination deck
- [ ] Word status changes to `"imported"` and `importedTo` is set to the deck ID
- [ ] Import count is returned and shown to the user
- [ ] Empty `wordIds` array returns 400 error
- [ ] Invalid `collectionId` returns 404 error
