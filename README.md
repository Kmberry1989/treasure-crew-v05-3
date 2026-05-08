# Treasure Crew Co-op v0.5.3

A mobile-first multiplayer web prototype for the glossy toy-boat co-op game concept.

V0.5 adds the **3D Hangar / Model Gallery** so you can start working real GLB/GLTF assets into the game: player models, pirate models, boats, islands, environments, steering wheels, player seats, GUI assets, and minigame art.

The app still uses only Node built-ins for the server and plain browser JavaScript for the client. No npm package dependencies are required. The 3D preview uses the browser-side `<model-viewer>` web component loaded from a CDN in `public/index.html`; the game still runs without it, but GLB previews will fall back visually if the CDN is unavailable.

## What is new in v0.5.3

- 3D Hangar section below the cockpit.
- Category tabs for players, boats, steering wheels, seats, pirates, islands, and environments.
- Large turntable-style preview area.
- Manifest-based model slots with file readiness scanning.
- Local GLB/GLTF preview without uploading the file.
- Copy-path buttons for each expected asset location.
- Multiplayer-synced equipment assignments.
- Separate Captain and Engineer player model assignments.
- Separate Captain and Engineer seat assignments.
- Pirate, island, boat, environment, and steering wheel equipment slots.
- Optional PNG thumbnail paths for every model slot.
- Readiness panel for GUI and minigame assets.

## Install

```bash
npm install
```

There are no dependencies; this mainly verifies project metadata.

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

## Add your real 3D assets

Drop GLB/GLTF files into the paths listed in `ASSET_SLOTS.md` or `public/assets/asset-manifest.json`.

Example:

```text
public/assets/models/boats/boat-glossy-sloop.glb
public/assets/thumbnails/boats/boat-glossy-sloop.png
```

Then refresh the browser. The Hangar will scan the expected paths and show whether each asset file is ready or missing.

## Local model preview

The Hangar has a **Preview local GLB/GLTF** button. This lets you test a file from your computer before copying it into the project.

Local preview files are not uploaded and are not saved to the project. To make a previewed model part of the hosted game, copy it into `public/assets/models/...` and update the manifest if needed.

## Project structure

```text
server.js                         Node room server + static file server
public/index.html                 App shell and model-viewer loader
public/app.js                     Multiplayer client, minigames, and 3D Hangar
public/styles.css                 Glossy toy cockpit + hangar visual system
public/assets/asset-manifest.json Asset registry
ASSET_SLOTS.md                    Exact file paths and model-slot notes
GAME_DESIGN.md                    Game design and next-step notes
```

## Next ideal version

V0.6 should turn the 3D assets into a more game-like scene pipeline:

- Load equipped boat/island/environment models into a dedicated voyage scene.
- Add a pirate encounter diorama.
- Add animated cockpit controls using the equipped steering wheel and seats.
- Add QR-code room joining.
- Add audio and haptics.


## v0.5.3 patch

Fixed the tagged-template HTML helper so landing controls render correctly instead of mounting only interpolated values. This resolves the “Landing controls did not mount” warning.
