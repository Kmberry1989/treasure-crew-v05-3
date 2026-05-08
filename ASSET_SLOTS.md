# Treasure Crew Co-op v0.5.3 Asset Slots

These are the real file paths the game looks for by default.

## Manifest

```text
public/assets/asset-manifest.json
```

Browser path:

```text
/assets/asset-manifest.json
```

## Player models

```text
public/assets/models/players/player-captain.glb
public/assets/thumbnails/players/player-captain.png
```

Built-in fallback with no required model file:

```text
player-default
```

## Pirate models

```text
public/assets/models/pirates/pirate-default.glb
public/assets/thumbnails/pirates/pirate-default.png
```

## Boat models

```text
public/assets/models/boats/boat-glossy-sloop.glb
public/assets/thumbnails/boats/boat-glossy-sloop.png

public/assets/models/boats/boat-pirate-brown.glb
public/assets/thumbnails/boats/boat-pirate-brown.png
```

## Island models

```text
public/assets/models/islands/island-berry-cove.glb
public/assets/thumbnails/islands/island-berry-cove.png
```

## Environment models

```text
public/assets/models/environments/env-sky-cockpit.glb
public/assets/thumbnails/environments/env-sky-cockpit.png
```

## Steering wheel models

```text
public/assets/models/steering-wheels/wheel-brass.glb
public/assets/thumbnails/steering-wheels/wheel-brass.png

public/assets/models/steering-wheels/wheel-pirate.glb
public/assets/thumbnails/steering-wheels/wheel-pirate.png
```

Built-in fallback with no required model file:

```text
wheel-classic
```

## Player seat models

```text
public/assets/models/seats/seat-cream.glb
public/assets/thumbnails/seats/seat-cream.png

public/assets/models/seats/seat-pirate.glb
public/assets/thumbnails/seats/seat-pirate.png
```

Built-in fallback with no required model file:

```text
seat-navy
```

## GUI assets currently included

```text
public/assets/gui/coin.svg
public/assets/gui/pearl.svg
public/assets/gui/gem.svg
public/assets/gui/berry.svg
public/assets/gui/pirate-flag.svg
public/assets/gui/radio-wave.svg
```

## Minigame assets currently included

```text
public/assets/minigames/word/word-tile-frame.svg
public/assets/minigames/maintenance/liquid-tube.svg
public/assets/minigames/treasure/treasure-x.svg
```

## Prepared folders for future assets

```text
public/assets/minigames/pirate/
public/assets/audio/
public/assets/textures/
```

## Recommended model export notes

- Use `.glb` when possible.
- Keep pivots centered and sensible.
- Keep scale consistent across related categories.
- For seats and steering wheels, orient the front toward negative Z when possible.
- Use compressed textures if models get large.
- Add PNG thumbnails for faster browsing in the Hangar.


## v0.5.3 placeholder note

Every listed `.glb` and thumbnail `.png` path now has a generated placeholder file. Thumbnail placeholders are 512 × 512 px. Replace the placeholder files directly with final production assets while keeping the same filenames.
