# Treasure Crew V1

A mobile-first, exactly-2-player cooperative web adventure built around communication-first chapters, manifest-driven 3D assets, and short shared voyage interludes.

This version commits to one canonical implementation base:

- plain Node + SSE for multiplayer sync
- plain browser JavaScript for the client
- Three.js scene runtime for dioramas, character previews, and hangar previews
- a single manifest-backed asset identity model

## What is new in V1

- Server code split into `src/server/config.js`, `src/server/state.js`, and `src/server/actions.js`.
- Client code split into `public/app/` modules for room flow, asset loading, scene sync, tab rendering, and task widgets.
- Canonical four-chapter loop: `Harbor Launch`, `Treasure Waters`, `Pirate Intercept`, `Storm Repair`.
- New shared voyage interludes between chapters:
  - waypoint confirmation
  - pirate signal callout
  - storm recovery choice
  - harbor resupply stop
- Canonical runtime asset IDs aligned to the shipped GLBs currently in `public/assets/models/`.
- Hangar still supports local GLB/GLTF preview, but hosted gameplay now resolves only through the manifest-backed public assets.

## Install

```bash
npm install
```

This installs the build dependencies used for the Three.js scene bundle.

## Run locally

```bash
npm run dev
```

Open:

```text
http://localhost:3001
```

Open the site on two devices or two browser tabs. Create a room on one device, then join with the room code on the other.

## Production run

```bash
npm start
```

## Host it

Use a host that can run a persistent Node server because multiplayer sync uses Server-Sent Events.

Good options:

- Render
- Railway
- Fly.io
- DigitalOcean App Platform
- VPS / self-hosted Node

Suggested settings:

```text
Build command: npm install
Start command: npm start
Node version: 20+
```

## Asset pipeline

The canonical asset registry is:

```text
public/assets/asset-manifest.json
```

The shipped runtime now expects the existing filenames that are already present under `public/assets/models/`. Replace those files in place or update the manifest deliberately when new art lands.

## Local model preview

The Hangar has a **Preview local GLB/GLTF** button. This lets you test a file from your computer before copying it into the project.

Local preview files are not uploaded and are not saved to the project. To make a previewed model part of the hosted game, copy it into `public/assets/models/...` and update the manifest if needed.

## Project structure

```text
server.js                         Node server entrypoint
src/server/config.js              Chapters, tasks, unlocks, interludes
src/server/state.js               Room state factories and selectors
src/server/actions.js             Action handlers and room ticking
public/index.html                 App shell
public/app.js                     Client bootstrap
public/app/                       Modular client features
public/styles.css                 Shared visual system
public/assets/asset-manifest.json Canonical runtime asset registry
```

## Current scope

- Exactly 2 active players: Captain and Engineer
- Session-based room-code multiplayer
- Communication-first chapter progression
- Cosmetic/manual progression
- Short shared interludes instead of free-roam sailing

Not in V1:

- open-world navigation
- live naval combat
- trade economy
- accounts or persistence beyond the live room
