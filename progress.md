Original prompt: implement my assets into the game and plan out how we can make this a combination of team building communication games as well as casual word and puzzle and sorting games that becomes one big multiplayer adventure. it should be developed for mobile first.

- 2026-05-08: Began implementation of chapter-based mobile-first adventure on top of existing Node/SSE cockpit prototype.
- Current focus: replace stage/task flow with campaign/chapter/encounter state while preserving room sync and existing asset manifest usage.
- Added campaign/chapter/encounter/scene/route/reward state to the room payload and replaced the old mission-stage server loop.
- Rebuilt the client around Voyage / Puzzle / Hangar / Manual tabs, a reactive diorama panel, QR join links, and new local puzzle types.
- Verified locally:
  - `node --check server.js`
  - `/health`
  - room create/join
  - browser render through lobby -> voyage briefing -> challenge -> puzzle tab
  - API progression through `campaign:start`, `encounter:begin`, `task:complete`, `scene:acknowledge`, `chapter:selectRoute`, `reward:claim`
