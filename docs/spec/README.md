# Memzo — Specification Index

**Version:** 1.0.0
**Date:** 2026-03-02
**Status:** Current Implementation

## What is Memzo?

Memzo is an AI-powered language learning flashcard application with browser extension integration. Users capture vocabulary from web content (YouTube, etc.), organize words into study decks, and practice with interactive flashcard sessions. Progress is tracked with streaks and weekly statistics.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, React 19) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui + Radix UI |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| Auth | JWT (jose) + bcryptjs |
| AI | Vercel AI SDK + OpenAI + Deepseek |
| PWA | Serwist (Service Worker) |
| Icons | Lucide React |

## Feature Specs

| File | Feature |
|------|---------|
| [01-auth.md](./01-auth.md) | User registration, login, session management |
| [02-decks.md](./02-decks.md) | Deck CRUD and management |
| [03-cards.md](./03-cards.md) | Flashcard CRUD within a deck |
| [04-study.md](./04-study.md) | Flashcard study sessions and result tracking |
| [05-vocabulary.md](./05-vocabulary.md) | Browser extension word capture inbox |
| [06-word-import.md](./06-word-import.md) | Import captured words into decks |
| [07-settings.md](./07-settings.md) | User language and CEFR level settings |
| [08-stats.md](./08-stats.md) | Dashboard stats and progress tracking |
| [09-ai.md](./09-ai.md) | AI card generation and OCR |
| [10-extension.md](./10-extension.md) | Browser extension API (Bearer token auth) |
| [11-pwa.md](./11-pwa.md) | Progressive Web App support |
| [data-models.md](./data-models.md) | All database models and TypeScript interfaces |
| [architecture.md](./architecture.md) | System architecture and design decisions |

## API Reference

See [`../openapi.yaml`](../openapi.yaml) for the full OpenAPI 3.0 spec.
