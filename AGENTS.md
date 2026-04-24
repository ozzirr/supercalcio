# GOLAZOO Development Guidelines

## 🚀 Overview
GOLAZOO is a high-fidelity football management simulator built with Next.js 16 and Phaser 4. It features a tactical simulation engine, an immersive Match 2.0 visual overhaul, and integrated Supabase SSR authentication.

## 🛠 Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Game Engine**: Phaser 4.0.0
- **Database/Auth**: Supabase (@supabase/ssr)
- **Styling**: Tailwind CSS 4 (Vanilla CSS fallback for custom components)
- **State Management**: Zustand (game-store.ts)

## 🏃 Running the Project
- Development: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

## ⚽ Game Engine 2.0
- **MatchScene.ts**: Main simulation scene using a logical coordinate system (1000x600).
- **Athlete Cards**: Player sprites are implemented as Phaser Containers with glassmorphism effects.
- **Fluid Momentum**: Tactical movement logic in `recalcTarget` handles team block positioning.
- **Ultimate system**: Charged via `ultimate-update`, ready state triggers visual pulse, activated via `activate-ultimate` event.

## 🔑 Auth & SSR
- **Middleware**: `src/middleware.ts` handles session refreshing and route protection.
- **Auth Utils**: Use `src/lib/supabase/server.ts` for server-side operations and `client.ts` for browser logic.
- **Redirects**: Managed via `src/app/auth/callback/route.ts` with dynamic URL resolution.

## 🔉 Audio Assets
Store custom audio in `public/audio/match/`:
- `whistle.mp3`, `goal.mp3`, `save.mp3`, `crowd.mp3`, `theme.mp3`.
Volume is managed via `isMuted` in `game-store.ts`.

## 🎨 Design Principles
- **Aesthetics**: High-contrast dark theme (Blue/Gold/Rose).
- **Mobile First**: All UI components (NavBar, TabBar, Modal) must be fully responsive and touch-friendly.
