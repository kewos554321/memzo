# Feature: User Settings

## Overview

Users configure their native language, target learning language, and vocabulary proficiency level per language (CEFR scale). Settings are stored on the User model and used by the extension to personalize word capture.

## Routes

| Path | Description |
|------|-------------|
| `/settings` | Settings page |

## API Endpoints

Settings are read/written via the extension settings endpoints (shared by web and extension):

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/ext/settings` | Bearer | Get current user settings |
| PATCH | `/api/ext/settings` | Bearer | Update user settings |

## Data

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `nativeLang` | string | `"en"` | User's native language (ISO code) |
| `targetLang` | string | `"zh-TW"` | Language being learned (ISO code) |
| `userLevels` | `Record<string, CEFRLevel>` | `{}` | Proficiency level per language |

**CEFR Levels:** `A1` | `A2` | `B1` | `B2` | `C1` | `C2`

**Supported Language Codes (current):** `"en"`, `"zh-TW"`

## Update Behavior

- All fields are optional in PATCH request
- `userLevels` is **merged** with existing value (not replaced)
  - e.g., PATCH `{ userLevels: { "zh-TW": "B1" } }` preserves other language levels

## Example Settings Object

```json
{
  "nativeLang": "en",
  "targetLang": "zh-TW",
  "userLevels": {
    "zh-TW": "A2"
  }
}
```

## Acceptance Criteria

- [ ] Settings page loads current `nativeLang`, `targetLang`, and `userLevels`
- [ ] User can select native language from a dropdown
- [ ] User can select target language from a dropdown
- [ ] User can select CEFR proficiency level for the target language
- [ ] Settings are persisted to database on save
- [ ] `userLevels` merge (not replace) behavior is preserved on partial updates
- [ ] Extension reads settings from `GET /api/ext/settings` using Bearer token
- [ ] Extension can update settings via `PATCH /api/ext/settings`
