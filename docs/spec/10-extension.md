# Feature: Browser Extension APIs

## Overview

All extension endpoints live under `/api/ext/*` and require `Authorization: Bearer <token>` authentication. The extension has its own auth flow (no cookies) and dedicated endpoints for decks, cards, settings, and word capture.

## Authentication

Extension uses Bearer token auth, separate from the web session cookie. Token is obtained via `POST /api/ext/auth/token` and stored locally in the extension.

See [01-auth.md](./01-auth.md) for the extension login flow.

## Extension-Specific Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ext/auth/token` | Exchange credentials for Bearer token |
| GET | `/api/ext/auth/me` | Get current extension user |
| GET | `/api/ext/settings` | Get user language and level settings |
| PATCH | `/api/ext/settings` | Update user settings |
| GET | `/api/ext/decks` | List user's decks |
| POST | `/api/ext/decks` | Create a new deck |
| POST | `/api/ext/decks/[id]/cards` | Add cards to a deck |

## Shared Endpoints (also used by extension)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/words/capture` | Capture a word |
| GET | `/api/words` | List captured words |
| PATCH | `/api/words/[id]` | Update word status |

## CORS

`POST /api/words/capture` includes an `OPTIONS` preflight handler to support cross-origin requests from the extension.

## Extension Create Deck Request

```json
{
  "title": "string (required)",
  "description": "string (optional, defaults to empty string)"
}
```

## Response for GET /api/ext/auth/me

```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string"
  }
}
```

## Acceptance Criteria

- [ ] Extension can authenticate independently of the web session
- [ ] All `/api/ext/*` endpoints return 401 for missing or invalid Bearer token
- [ ] Extension can read user settings via `GET /api/ext/settings`
- [ ] Extension can update user settings via `PATCH /api/ext/settings`
- [ ] Extension can list decks via `GET /api/ext/decks`
- [ ] Extension can create a new deck via `POST /api/ext/decks`
- [ ] Extension can add cards to a deck via `POST /api/ext/decks/[id]/cards`
- [ ] Extension can capture words via `POST /api/words/capture`
- [ ] Word capture endpoint handles CORS preflight (`OPTIONS`) correctly
