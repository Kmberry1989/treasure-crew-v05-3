# Treasure Crew Co-op Game Design Notes

## Current build

**Version:** 0.5  
**Focus:** 3D Hangar, model gallery, asset readiness, and unlockable cosmetics.

The core game is a two-player cooperative mobile/web cockpit experience. Players join a room, claim Captain or Engineer seats, and solve asymmetric minigames to keep a stylized toy-like boat running.

## Core roles

### Captain / Radio + Navigation

- Radio callouts
- Word search
- Letter-bank word building
- GPS coordinate interpretation
- Treasure clue reading
- Owner's manual recovery

### Engineer / Maintenance + Repair

- Liquid sorting
- Connect-the-dots circuit repair
- Matching spare parts
- Breaker panel management
- Power/hull stabilization

## Existing systems

- Room-code multiplayer
- Server-Sent Event live sync
- Guided mission stages
- Owner's manual unlocks
- Treasure hunt mode
- Pirate event placeholder
- Cosmetic unlocks
- Real asset manifest
- 3D Hangar / model gallery
- Local GLB/GLTF preview
- File readiness checks

## V0.5 asset categories

- Players
- Boats
- Steering wheels
- Seats
- Pirates
- Islands
- Environments
- GUI assets
- Minigame assets

## Current loadout slots

- Captain player model
- Engineer player model
- Player boat
- Pirate enemy model
- Treasure island model
- Cockpit/environment model
- Shared steering wheel
- Captain seat
- Engineer seat

## Visual direction

Keep the style consistent with the generated concept art:

- Premium glossy 3D designer toy
- Rounded vinyl-like forms
- Bright sky and soft clouds
- Warm glossy wood
- Cream cockpit panels
- Navy nautical accents
- Brass/gold trim
- Red warning lights
- Toy-like GUI screens

## Unlock design

Cosmetics should unlock through owner’s manual progression. The current unlock rhythm:

- Page 0: base wheel, base seat, core player models, starting boat, environment
- Page 1: brass steering wheel
- Page 2: cream seat
- Page 3: pirate wheel and pirate enemy
- Page 4: pirate red seat
- Page 5: brown pirate ship
- Page 6: Berry Cove island

## Recommended v0.6

Build a real 3D voyage scene using the equipped assets.

### Target features

- A dedicated scene area showing the equipped boat, island, pirate, and environment.
- Use the Hangar loadout to determine which models appear.
- Add a treasure encounter diorama.
- Add a pirate encounter diorama.
- Add simple animation states:
  - boat idle
  - pirate approach
  - treasure discovered
  - cockpit emergency
- Add QR code room joining.
- Add sound and haptics.

## Recommended asset strategy

Start by dropping in one real model per major category:

1. Boat model
2. Steering wheel model
3. Seat model
4. Player model
5. Pirate model
6. Island model
7. Environment model

Then tune scale and orientation in `public/assets/asset-manifest.json`.
