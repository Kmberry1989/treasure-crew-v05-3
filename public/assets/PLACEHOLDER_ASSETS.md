# Placeholder Assets

This v0.5.3 patch includes generated placeholder files so the game no longer throws 404s while waiting for real production art.

## Thumbnail dimensions

All placeholder thumbnails are PNG files at **512 × 512 px**. Replace them with the same dimensions for clean gallery cards.

## 3D model scale guide

The GLB placeholders use normalized toy-game units:

- Player / pirate characters: roughly **1.6 units tall**
- Boats: roughly **2 units wide**
- Islands: roughly **1.7 units wide**
- Steering wheels: roughly **0.9 units wide**
- Seats: roughly **1 unit tall**
- Environment: roughly **3 units wide**

You can replace any placeholder by saving your real `.glb` file over the same filename. Keep filenames and manifest IDs stable so unlocks continue working.
