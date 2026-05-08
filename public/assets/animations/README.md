# Runtime Animation Pipeline

This folder is the runtime-facing home for Treasure Crew animation assets.

## Current setup

- Source FBX clips currently live in:
  - `public/assets/thumbnails/animations/`
- A generated catalog is written to:
  - `public/assets/animations/animation-catalog.json`
- Runtime-ready converted clips should be exported to:
  - `public/assets/animations/runtime/`

## Workflow

1. Keep raw `.fbx` files as source assets only.
2. Retarget/export those clips to the player or pirate rigs as `.glb`.
3. Write the converted clip into `public/assets/animations/runtime/`.
4. Reference the clip ids from `public/assets/asset-manifest.json`.

## Why

The shipped client uses a bundled Three.js runtime and should consume optimized GLB assets at runtime. FBX files are preserved for authoring and future retargeting work.
