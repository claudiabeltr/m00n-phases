# m00n-phases
Pixel art desktop app that shows tonight's moon phase and the next 7 nights. Built with Electron and JavaScript.

## Milestones

### Phase 1 — Art
- [x] Moon phases sprite sheet (8 phases, 32x32) + UI
- [ ] Background art for the 3 interfaces (day, night, upcoming moons list)
- [ ] Menu button and small UI details (card frame, error icon)

### Phase 2 — Core app structure
- [x] Basic Electron setup (frameless, transparent window)
- [ ] Draggable window and custom close button
- [ ] Night UI: display today's moon based on the current time
- [ ] Day/night time logic (including the midnight date rollover)

### Phase 3 — Moon data
- [ ] USNO API integration
- [ ] Daily local cache of API responses
- [ ] Network error handling (offline fallback, stale cache)

### Phase 4 — Upcoming moons screen
- [ ] Menu button navigation to the upcoming moons screen
- [ ] Next 7 moons grid (4+3 layout)

### Phase 5 — Polish
- [ ] Loading splash screen
- [ ] Final art pass / animation details

### Phase 6 — Packaging & release
- [ ] electron-builder Windows build (.exe)
- [ ] NSIS installer icon and images
- [ ] First GitHub release