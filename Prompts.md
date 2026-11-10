# Project Prompts & Development Log

This document records the prompt history and specifications used to build the **ParkSG** Singapore Carpark Tracker application.

---

## Prompt 1: Initial Application Specification

> **Prompt:**
> 
> build a singapore based carpark tracker application that tracks real time carpark lot availabilities. build just the frontend for now. i will integrate the backend connection later.

### Summary of Implementation:
- **Core Interface**: Built ParkSG frontend application with Leaflet interactive map, custom availability pins, and quick-jump navigation (Orchard, CBD, Singapore bounds).
- **Singapore Real-World Dataset**: Implemented realistic datasets covering HDB, URA, and Commercial carparks across Orchard, Marina Bay, CBD, Bugis, Jurong East, Tampines, Bedok, Woodlands, Toa Payoh, Queenstown, Changi Jewel, and HarbourFront.
- **Lot Availability Telemetry**: Implemented support for Car, Motorcycle, and Heavy vehicle lot types, visual vacancy meters, and realistic fluctuation simulation.
- **Singapore Tariffs & Rates**: Modeled official daytime, night cap ($5.00 HDB cap), Saturday, and Sunday & Public Holiday Free Parking schemes (7:00 AM – 10:30 PM) plus grace period calculations.
- **Trip Rate Calculator & Saved Spots**: Added trip parking cost comparison tool and bookmarked carparks view with low-lot alerts.

---

## Prompt 2: Git Initialization & Initial Push

> **Prompt:**
> 
> git push https://<GITHUB_TOKEN>@https://github.com/ganliling-prog/lta-carpark-tracker.git

### Summary of Implementation:
- Initialized local Git repository, configured safe directory and user identity (`ganliling-prog` / `gan.liling@gmail.com`).
- Staged and committed initial application codebase (`098b396`).
- Fixed remote URL syntax and pushed `main` branch to GitHub repository `ganliling-prog/lta-carpark-tracker`.
- Sanitized remote URL configuration to ensure credentials were not persisted in plaintext `.git/config`.

---

## Prompt 3: LTA DataMall Serverless Backend Integration

> **Prompt:**
> 
> 1. add a serverless connection that pulls live data from LTA's datamall using the following endpoints:
> 
> # Live carpark lots (HDB + LTA + URA):
> https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2
> 
> # All requests need the header:  AccountKey: 
> 
> 2. store this in /api folder (at project root level) 
> 3. include a /health.ts and /carparkavailability.ts within the same subfolder
> 4. do not hardcode any keys, i will include them later

### Summary of Implementation:
- Created `/api/carparkavailability.ts`: Serverless function proxying requests to LTA DataMall with `AccountKey` and pagination support (`$skip`), returning structured fallback status when the key is pending.
- Created `/api/health.ts`: Universal health check endpoint providing service uptime, timestamp, and environment configuration status.
- Created `server.ts`: Full-stack Express server mounting `/api/health` and `/api/carparkavailability` while running Vite middleware on port 3000.
- Updated `.env.example` with `LTA_DATAMALL_ACCOUNT_KEY` without hardcoding any secrets.
- Committed and pushed changes to GitHub repository (`22463ef`).

---

## Prompt 4: Prompts Documentation

> **Prompt:**
> 
> collate all the prompts into filename Prompts.md
