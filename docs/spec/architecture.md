# Architecture

## Directory Structure

```
src/
├── app/
│   ├── (app)/                  # Route group: authenticated pages
│   │   ├── layout.tsx          # Sidebar + TopBar layout wrapper
│   │   ├── page.tsx            # / → Dashboard
│   │   ├── decks/              # /decks, /decks/new, /decks/[id]/*
│   │   ├── vocabulary/         # /vocabulary
│   │   ├── study/              # /study
│   │   ├── settings/           # /settings
│   │   └── profile/            # /profile
│   ├── (auth)/                 # Route group: unauthenticated pages
│   │   ├── login/
│   │   └── register/
│   ├── api/                    # REST API routes
│   │   ├── auth/               # register, login, logout, me
│   │   ├── decks/              # CRUD + cards
│   │   ├── words/              # capture, import, list, PATCH
│   │   ├── study-sessions/     # record session
│   │   ├── stats/              # dashboard stats
│   │   ├── ai/                 # ocr, generate
│   │   └── ext/                # extension-specific endpoints
│   ├── layout.tsx              # Root layout
│   └── sw.ts                   # Service worker entry
├── components/
│   ├── ui/                     # shadcn/ui base components
│   ├── sidebar.tsx
│   ├── mobile-nav.tsx
│   ├── deck-card.tsx
│   ├── flashcard.tsx
│   ├── study-session.tsx
│   ├── ai-import.tsx
│   └── card-form.tsx
├── hooks/
│   ├── use-decks.ts
│   ├── use-user.ts
│   ├── use-settings.ts
│   ├── use-study.ts
│   ├── use-speech.ts           # Text-to-speech
│   └── use-async-fn.ts
├── lib/
│   ├── auth.ts                 # JWT create/verify helpers
│   ├── db.ts                   # Prisma client singleton
│   ├── ai.ts                   # AI SDK provider setup
│   ├── types.ts                # Shared TypeScript interfaces
│   └── utils.ts
└── providers/
    └── decks-provider.tsx      # React context for deck list
```

---

## Authentication Architecture

```
Web Browser                      Browser Extension
     │                                  │
     │  httpOnly cookie (session)        │  Authorization: Bearer <token>
     ▼                                  ▼
/api/auth/*                      /api/ext/auth/token
     │                                  │
     └──────────────┬───────────────────┘
                    ▼
              lib/auth.ts
         JWT verify (jose HS256)
                    │
                    ▼
              Prisma → User
```

- Web: session stored in httpOnly `session` cookie, 30-day JWT
- Extension: Bearer token returned from `/api/ext/auth/token`, stored locally
- Both tokens share the same JWT secret and `{ userId }` payload

---

## State Management

| State | Where | How |
|-------|-------|-----|
| Deck list | `DecksProvider` context | Fetched once at `(app)` layout mount |
| Current user | `useUser` hook | Fetches `GET /api/auth/me` |
| User settings | `useSettings` hook | Fetches `GET /api/ext/settings` |
| Study state | `useStudy` hook | Local component state |

---

## Database

- **ORM:** Prisma 7 with `@prisma/adapter-pg` (PostgreSQL)
- **Client:** Singleton in `src/lib/db.ts` to avoid connection exhaustion in serverless
- **Schema file:** `prisma/schema.prisma`
- **Timestamps:** All `Date` fields serialized to milliseconds in API responses

---

## AI Configuration

| Provider | Purpose | SDK Package |
|----------|---------|-------------|
| OpenAI | Card generation | `@ai-sdk/openai` |
| Deepseek (Vision) | OCR | `@ai-sdk/deepseek` |

Configured in `src/lib/ai.ts`. Requires env vars:
- `OPENAI_API_KEY`
- `DEEPSEEK_API_KEY`

---

## Key Design Decisions

### Source as JSON blob (`CapturedWord.source`)

The `source` field is a flexible JSON blob rather than a typed relation. This allows the extension to capture from YouTube, Netflix, or any future source without requiring a schema migration.

### Separate Capture and Import

Words captured by the extension are held in `CapturedWord` (status: `saved`). They are not automatically added to a deck. Users consciously choose which words to study. This prevents deck pollution.

### Decks Stay Clean

Cards (`Card` model) do not store source context. The flashcard study game is independent of where words came from. Source metadata lives only on `CapturedWord`.

### Extension Auth Separation

Extension uses Bearer tokens (returned via `POST /api/ext/auth/token`) rather than session cookies because browser extensions cannot share httpOnly cookies with the web app.

### Timestamp Format

All API responses serialize dates as milliseconds (`Date.getTime()`) for consistent handling across client code without timezone issues.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `OPENAI_API_KEY` | Yes | OpenAI API key (card generation) |
| `DEEPSEEK_API_KEY` | Yes | Deepseek API key (OCR) |
