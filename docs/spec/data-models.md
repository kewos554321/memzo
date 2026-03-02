# Data Models

All models use PostgreSQL via Prisma ORM. IDs are CUIDs. Dates in API responses are serialized as **Unix timestamps in milliseconds** (`.getTime()`).

---

## User

```prisma
model User {
  id         String   @id @default(cuid())
  name       String
  email      String   @unique
  password   String           // bcrypt hash
  nativeLang String   @default("en")
  targetLang String   @default("zh-TW")
  userLevels Json     @default("{}")  // Record<langCode, CEFRLevel>
  createdAt  DateTime @default(now())
}
```

```ts
interface User {
  id: string;
  name: string;
  email: string;
  password: string;       // never sent to client
  nativeLang: string;
  targetLang: string;
  userLevels: Record<string, "A1" | "A2" | "B1" | "B2" | "C1" | "C2">;
  createdAt: Date;
}
```

**API response shape** (public-safe):
```ts
{ id: string; name: string; email: string }
```

---

## Deck

```prisma
model Deck {
  id            String         @id @default(cuid())
  title         String
  description   String
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  cards         Card[]
  studySessions StudySession[]
}
```

```ts
interface Deck {
  id: string;
  title: string;
  description: string;
  cards: Card[];
  createdAt: number;  // ms
  updatedAt: number;  // ms
}
```

---

## Card

```prisma
model Card {
  id           String        @id @default(cuid())
  front        String
  back         String
  createdAt    DateTime      @default(now())
  deckId       String
  deck         Deck          @relation(fields: [deckId], references: [id], onDelete: Cascade)
  studyResults StudyResult[]
}
```

```ts
interface Card {
  id: string;
  front: string;
  back: string;
  createdAt: number;  // ms
}
```

---

## StudySession

```prisma
model StudySession {
  id          String        @id @default(cuid())
  deckId      String
  deck        Deck          @relation(fields: [deckId], references: [id], onDelete: Cascade)
  completedAt DateTime      @default(now())
  results     StudyResult[]
}
```

```ts
interface StudySession {
  id: string;
  deckId: string;
  completedAt: number;  // ms
  results: StudyResult[];
}
```

---

## StudyResult

```prisma
model StudyResult {
  id             String       @id @default(cuid())
  known          Boolean
  cardId         String
  card           Card         @relation(fields: [cardId], references: [id], onDelete: Cascade)
  studySessionId String
  studySession   StudySession @relation(fields: [studySessionId], references: [id], onDelete: Cascade)
}
```

```ts
interface StudyResult {
  id: string;
  cardId: string;
  studySessionId: string;
  known: boolean;
}
```

---

## CapturedWord

```prisma
model CapturedWord {
  id         String   @id @default(cuid())
  userId     String
  word       String
  definition String
  phonetic   String?
  audioUrl   String?
  source     Json
  status     String   @default("saved")
  importedTo String?
  capturedAt DateTime @default(now())
}
```

```ts
interface CapturedWord {
  id: string;
  userId: string;
  word: string;
  definition: string;
  phonetic?: string;
  audioUrl?: string;
  source: {
    type: "youtube" | "netflix" | string;
    url?: string;
    videoId?: string;
    title?: string;
    timestamp?: number;   // seconds into video
    context?: string;     // surrounding sentence
    highlightWord?: string;
  };
  status: "saved" | "imported" | "ignored";
  importedTo?: string;  // deckId if imported
  capturedAt: Date;
}
```

---

## Cascade Rules

| Delete | Cascades To |
|--------|-------------|
| Deck | Card, StudySession |
| Card | StudyResult |
| StudySession | StudyResult |
