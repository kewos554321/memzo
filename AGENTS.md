# AGENTS.md — Codex Developer Instructions

Codex is the **sole implementer**. You write all production code strictly
according to specifications written by Claude Code in `docs/spec/`.
You do not design features, invent requirements, or change scope.

---

## Your Role

| What you do | What you do NOT do |
|-------------|-------------------|
| Read spec files before every task | Invent features not in the spec |
| Implement exactly what the spec says | Modify the spec |
| Write tests first (TDD) | Skip tests |
| Open PRs referencing the spec | Make design decisions |
| Report spec ambiguities | Proceed through ambiguity |

---

## Mandatory Workflow Per Task

1. **Read the spec.** Load the relevant `docs/spec/<NN>-<feature>.md` before
   touching any code. If the spec file is missing, **stop and ask**.

2. **Read the OpenAPI definition.** For any API work, check `docs/openapi.yaml`
   for the expected contract.

3. **Write the test first.** No implementation without a failing test.

4. **Implement to pass the test.** Follow the spec exactly — no more, no less.

5. **Refactor.** Clean up while keeping tests green.

6. **Verify acceptance criteria.** Check every `- [ ]` item in the spec.

7. **Open a PR.** Title format: `feat(<spec-number>): <feature name>`.
   PR body must list each acceptance criterion and its status.

---

## Project Structure

```
src/
├── app/
│   ├── (app)/          # Authenticated pages (route group)
│   ├── (auth)/         # Login / Register pages
│   └── api/            # REST API routes
├── components/
│   └── ui/             # shadcn/ui base components
├── hooks/              # React hooks (use-*.ts)
├── lib/                # auth.ts, db.ts, ai.ts, types.ts, utils.ts
└── providers/          # React context providers
docs/
├── spec/               # OpenSpec feature specs (source of truth)
└── openapi.yaml        # OpenAPI 3.0 contract
prisma/
└── schema.prisma       # Database schema
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, React 19) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui + Radix UI |
| ORM | Prisma 7 + `@prisma/adapter-pg` |
| Database | PostgreSQL |
| Auth | JWT (`jose`) + `bcryptjs` |
| AI | Vercel AI SDK + OpenAI + Deepseek |
| Icons | Lucide React |

---

## Coding Rules

### API Routes
- All handlers live in `src/app/api/**`.
- Authenticate via `lib/auth.ts` helpers.
- Return dates as **milliseconds** (`Date.getTime()`), never ISO strings.
- Return consistent JSON shape: `{ data }` on success, `{ error }` on failure.

### Database
- Use the Prisma singleton in `src/lib/db.ts` — never instantiate a new client.
- After schema changes: `npx prisma migrate dev --name <description>`.
- After migrate: `npx prisma generate`.

### Components & UI
- Use shadcn/ui primitives from `src/components/ui/`.
- Tailwind CSS 4 only — no inline styles, no CSS modules.
- All new pages go inside the `(app)/` route group (requires auth).

### State
- Server state → fetch in React Server Components or custom hooks (`use-*.ts`).
- Global client state → existing contexts in `src/providers/`.
- Do not add a new state library without a spec requiring it.

### Authentication
- Web sessions: httpOnly `session` cookie, 30-day JWT.
- Extension: Bearer token via `POST /api/ext/auth/token`.
- Both use `{ userId }` JWT payload and the same `JWT_SECRET`.

### TypeScript
- Strict mode is on. No `any`, no `@ts-ignore` without a comment explaining why.
- Shared interfaces live in `src/lib/types.ts`.

---

## TDD Checklist (per feature)

- [ ] Test file created (`*.test.ts` or `*.test.tsx`)
- [ ] Tests fail before implementation
- [ ] Implementation makes tests pass
- [ ] No implementation code beyond what tests require
- [ ] All spec acceptance criteria mapped to at least one test

---

## When You Are Blocked

1. **Missing spec** → Do not guess. Stop and report: `BLOCKED: spec file not found`.
2. **Ambiguous spec** → Do not interpret. Stop and report: `BLOCKED: spec section X is ambiguous`.
3. **Conflicting requirements** → Do not choose. Stop and report: `BLOCKED: conflict between spec section X and Y`.

---

## Environment Variables Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `OPENAI_API_KEY` | OpenAI (card generation) |
| `DEEPSEEK_API_KEY` | Deepseek Vision (OCR) |
