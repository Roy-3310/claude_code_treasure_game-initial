# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install      # Install dependencies
npm run dev      # Start dev server at http://localhost:3000 (auto-opens browser)
npm run build    # Production build → build/ directory
```

No test runner is configured.

## Architecture

This is a React + TypeScript + Vite treasure chest game. The entire game logic lives in `src/App.tsx`.

**Game state** (in `App.tsx`):
- `boxes`: Array of 3 `Box` objects (`{ id, isOpen, hasTreasure }`) — one randomly has treasure
- `score`: Player score; +$100 for treasure, -$50 for skeleton
- `gameEnded`: Ends when treasure is found or all boxes opened

**Key functions**: `initializeGame()`, `openBox(boxId)`, `resetGame()`

**Auth & user flow**:
- `src/hooks/useAuth.ts` — manages signed-in/guest state; persists `token` and `username` in `localStorage`
- `src/components/AuthModal.tsx` — blocking modal on first load (uses `react-hook-form`); tabs for Sign In / Sign Up, plus "Continue as Guest"
- `src/components/UserHeader.tsx` — shown when signed in; displays username and sign-out button
- Guest mode skips auth entirely; scores are only saved for signed-in users

**Backend API** (`src/lib/api.ts`):
- All calls go through a generic `request<T>()` helper that attaches `Authorization: Bearer <token>`
- Endpoints: `POST /api/auth/signup`, `POST /api/auth/signin`, `POST /api/scores`
- The backend server is **not included** in this repo — `npm run dev` only starts the Vite frontend

**Assets**:
- `src/assets/` — treasure chest images (closed, opened with treasure, opened with skeleton, key)
- `src/audios/` — `chest_open.mp3` (treasure) and `chest_open_with_evil_laugh.mp3` (skeleton)

**UI layer**:
- Framer Motion handles the 3D flip animation when a box is opened
- `src/components/ui/` contains 45+ Radix UI wrapper components (pre-styled with Tailwind) — use these instead of installing new UI libraries
- `src/styles/globals.css` defines the Tailwind CSS custom theme with CSS variables for light/dark mode
- `@` path alias resolves to `src/`

**Vite config**: Port 3000, SWC transpiler, path aliases for all Radix UI packages, output to `build/`.
