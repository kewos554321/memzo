# Feature: Deck Management

## Overview

A **Deck** is a named collection of flashcards. Users create, view, edit, and delete decks. The Decks page is the primary navigation hub for all learning content.

## Routes

| Path | Description |
|------|-------------|
| `/decks` | List all decks with search |
| `/decks/new` | Create a new deck |
| `/decks/[id]` | Deck detail view |
| `/decks/[id]/edit` | Edit deck metadata and cards |

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/decks` | None | List all decks (with embedded cards) |
| POST | `/api/decks` | None | Create a new deck |
| GET | `/api/decks/[id]` | None | Get deck by ID |
| PUT | `/api/decks/[id]` | None | Update deck title/description |
| DELETE | `/api/decks/[id]` | None | Delete deck (cascades) |

## Data

See [data-models.md](./data-models.md#deck) for the full Deck model.

**Request body for create/update:**
```json
{
  "title": "string (required)",
  "description": "string (required on create)"
}
```

## Cascade Behavior

Deleting a deck cascades to:
- All `Card` records in the deck
- All `StudySession` records for the deck
- All `StudyResult` records for those sessions

## State Management

Decks are loaded once at the `(app)` layout level via `DecksProvider` context and shared across all authenticated pages.

## Acceptance Criteria

- [ ] `/decks` page lists all decks with title, description, and card count
- [ ] Deck list supports text search/filter
- [ ] User can create a new deck via `/decks/new` with title and description
- [ ] User can view a single deck at `/decks/[id]` with its card list
- [ ] User can edit deck title and description at `/decks/[id]/edit`
- [ ] User can delete a deck; deletion cascades to all related records
- [ ] Deck `updatedAt` is updated whenever a card is added or modified
- [ ] Empty state shown when user has no decks
