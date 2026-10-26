# m00n-phases
Pixel art desktop app that shows tonight's moon phase and the next 7 nights. Built with Electron and JavaScript.

## Milestones

### Phase 1 — Art
- [x] Moon phases sprite sheet (8 phases, 32x32) + UI
- [x] Background art for the 3 interfaces (day, night, upcoming moons list)
- [x] Menu button and small UI details

### Phase 2 — Core app structure
- [x] Basic Electron setup (frameless, transparent window)
- [x] Draggable window and custom close button
- [x] Night UI: display today's moon based on the current time
- [x] Day/night time logic (including the midnight date rollover)

### Phase 3 — Moon data
- [x] USNO API integration
- [x] Daily local cache of API responses
- [x] Network error handling (offline fallback, stale cache)

### Phase 4 — Upcoming moons screen
- [x] Menu button navigation to the upcoming moons screen
- [x] Next 7 moons grid (4+3 layout)

### Phase 5 — Polish
- [x] Loading splash screen
- [x] Final art pass / animation details

### Phase 6 — Packaging & release
- [x] electron-builder Windows build (.exe)
- [x] NSIS installer icon and images
- [x] First GitHub release