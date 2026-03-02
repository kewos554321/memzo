# Feature: Progressive Web App (PWA)

## Overview

Memzo is installable as a Progressive Web App on mobile and desktop. A service worker handles asset caching for offline support. The UI is mobile-first and responsive.

## Implementation

| Component | Technology |
|-----------|-----------|
| Service Worker | Serwist 9.5.6 |
| SW Config | `src/app/sw.ts` |
| Manifest | `manifest.json` (in `/public`) |

## Capabilities

- **Installable:** Users can add Memzo to their home screen via browser prompt
- **Asset Caching:** Service worker caches static assets for faster loads and basic offline support
- **Responsive Layout:** Works on mobile (320px+) and desktop viewports

## Mobile Layout

- Sidebar collapses on mobile; bottom navigation or hamburger menu used instead
- `mobile-nav.tsx` component handles mobile navigation
- Touch-friendly card flip and study interaction

## Acceptance Criteria

- [ ] App has a valid `manifest.json` with name, icons, and `display: standalone`
- [ ] Service worker is registered on app load
- [ ] Static assets are cached by the service worker
- [ ] Core pages (decks list, study view) load from cache when offline
- [ ] App can be installed from Chrome/Safari on mobile
- [ ] UI layout is usable on 320px viewport (mobile minimum)
- [ ] Study flashcard flip works with touch events on mobile
