# Vocabulary Web Page Integration Design

**Date:** 2026-03-03
**Source design:** `#19 [Web] 04 · Vocabulary` (memzo.pen)

## Goal

Integrate the existing `vocabulary/page.tsx` implementation with the Pencil design spec, removing Add to Deck functionality and renaming "忽略" to "已學習".

## Data Status Mapping

| DB status | Filter label | Meaning |
|---|---|---|
| `saved` | 未加入 | Captured, not yet acted on |
| `imported` | 已加入 | Already added to a deck |
| `ignored` | 已學習 | User already knows this word |

## Layout

- Container: `max-w-[640px]` centered (from `max-w-3xl`)
- Header: `book-marked` icon + "Vocabulary" title in same row, subtitle "N words captured" below, "N new" badge (saved count) on right
- Search bar: unchanged logic
- Filter pills: 全部 / 未加入 / 已加入 / 已學習, default `saved`
- Word list: vertical, gap 12

## Word Card States

| Status | Circle style | Card border | Right section |
|---|---|---|---|
| `saved` | `bg-[#FFFBEB] border-2 border-amber-400` empty | `border border-border` | "N context" + chevron |
| `imported` | `bg-[#CCFBF1] border-2 border-primary` + check icon | `border border-border` | 「已加入」green badge + chevron |
| `ignored` | `bg-muted border-2 border-border` empty | `border border-border` | 「已學習」muted badge + chevron |

## Expanded Card

- Expanded section background: `bg-muted` (solid, not `bg-muted/30`)
- Full definition text
- Context block: `bg-card border border-border rounded-lg` with highlighted sentence
- Source link: `external-link` icon + "YouTube · timestamp"
- Audio playback button (if audioUrl present)
- Actions (only for `saved` status):
  - **「已學習」** button → PATCH status = `ignored`

## Removed Features

- `selected` Set (multi-select)
- Floating import bar
- Import modal
- `showImportModal` / `importing` states
- "Add to Deck" button

## Out of Scope

- Sidebar changes (already matches design)
- Mobile nav
- Log Out button in sidebar
- API changes
