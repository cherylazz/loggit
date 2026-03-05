# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LoggIT is a mobile-first React web app for marine wildlife observation logging. Users record weather conditions and species sightings during ocean trips. The app was originally designed in Figma and exported as a code bundle.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start Vite dev server on port 3000
- `npm run build` — production build to `build/` directory

There are no tests, linters, or formatters configured.

## Architecture

**Single-page app with tab-based navigation.** No router — `App.tsx` manages a `currentTab` state that switches between views: `home`, `weather`, `sightings`, `logs`, `settings`.

**State management:** All state lives in `App.tsx` via `useState`. Logs are persisted to `localStorage` under `loggit-logs`. Crew members persist under `loggit-saved-crew`. Session auth uses `sessionStorage` (`loggit-auth`). An `APP_VERSION` constant triggers data clearing on version bumps.

**App flow:** LockScreen → SplashScreen → CrewSetupScreen → main app with BottomNav.

**Key components (in `src/components/`):**
- `Home.tsx` — dashboard with recent logs summary, weather stats, sighting stats
- `WeatherLog.tsx` / `SightingLog.tsx` — log entry forms
- `Logs.tsx` — log history with edit/delete
- `VoiceTranscriptionSheet.tsx` — voice input via Web Speech API
- `transcriptParser.ts` — NLP-style parser that extracts species, count, behaviour, and distance from voice transcripts
- `useWeatherReminder.ts` — custom hook for timed weather logging reminders with notification support
- `Settings.tsx` — weather reminder toggle, data export (Excel via exceljs), reset journey

**UI layer:** Tailwind CSS v4 (pre-compiled in `src/index.css`), shadcn/ui components in `src/components/ui/`, Radix UI primitives, Framer Motion (`motion/react`) for animations, Lucide icons.

## Path Aliases

`@` maps to `src/` (configured in `vite.config.ts`). Figma asset imports use `figma:asset/...` aliases that resolve to `src/assets/`.

## Key Conventions

- Temperatures in Celsius, wind speed in knots, wave height in meters, distance in meters
- Species list is hardcoded in both `SightingLog.tsx` and `transcriptParser.ts` — keep these in sync
- The app targets mobile viewport (`max-w-md mx-auto`) and uses `100dvh` for height
