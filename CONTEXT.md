# LoggIT — Project Overview

LoggIT is a mobile-first React web app for logging marine wildlife observations at sea. Crew members record weather conditions and species sightings during ocean trips, then export their data for analysis. The app was originally designed in [Figma](https://www.figma.com/design/eSRk8FtudWkSLjGrCeyCx4/LoggIT) and exported as a code bundle.

## Core Features

- **Weather logging** — manual entry or auto-fetch from the Open-Meteo API (current conditions + marine data)
- **Sighting logging** — record species, count, behaviour, distance, photo, and GPS coordinates
- **Voice transcription** — dictate sightings via the Web Speech API; an NLP parser extracts species, count, behaviour, and distance automatically
- **Weather reminders** — configurable 30-minute interval reminders via system notifications and in-app alerts
- **Data export** — export all logs to Excel (via ExcelJS)
- **Crew management** — set up and persist crew members across sessions

## App Flow

1. **Lock screen** — session authentication gate
2. **Splash screen** — branding intro
3. **Crew setup** — select or add crew members for the current journey
4. **Main app** — five-tab navigation:
   - **Home** — dashboard with recent logs summary, weather stats, and sighting stats
   - **Weather** — weather log entry form with GPS auto-fetch
   - **Sightings** — sighting log entry form with voice input and species autocomplete
   - **Logs** — full log history with edit and delete
   - **Settings** — weather reminders, data export, and reset journey

## Supported Species

Bottlenose Dolphin, Humpback Whale, Grey Whale, Sea Turtle, Albatross, Pelican, Sea Lion, Orca, Blue Whale

## Data Captured

**Weather entries:** temperature (°C), wind speed (knots), wave height (m), visibility, GPS coordinates, notes, crew

**Sighting entries:** species, count, behaviour, distance (m), photo, GPS coordinates, notes, crew

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build tool | Vite |
| Styling | Tailwind CSS v4 |
| UI components | shadcn/ui + Radix UI primitives |
| Animations | Framer Motion |
| Data export | ExcelJS |
| Voice input | Web Speech API |
| Weather data | Open-Meteo API |
| Persistence | localStorage / sessionStorage |

## Design Origins

The UI was designed in Figma and exported as a code bundle. The brand palette centers on three colors:

- **Periwinkle** `#B2B1CF`
- **Sky Blue** `#98D2EB`
- **Alice Blue** `#E1F2FE`

The app targets a mobile viewport (`max-w-md`, `100dvh`).
