# Roadmap

This document outlines the planned features and improvements for Memash.

Legend:
- P1 = must have, P2 = should have, P3 = nice to have
- S = small, M = medium, L = large

## Now: v1.2 (core editing)

Goal: improve the editor with filters and proper layering.

Order (suggested):
1) Layers + visibility
2) Filter intensity
3) Theme (optional)

### Filters
- [x] (P1, M) Add basic image filters: grayscale, sepia, invert
- [x] (P1, M) Add UI controls for filter selection
- [ ] (P1, M) Add filter intensity control (slider)
- [ ] (P1, S) Wire intensity into filter value (compose CSS filter string)
- [ ] (P1, S) Persist intensity in localStorage + restore on load
- [ ] (P1, S) Include intensity in undo/redo snapshots
- [x] (P1, S) Persist filter state in localStorage
- [x] (P1, S) Export includes filters

### Layers
- [x] (P1, L) Introduce layer model for image + text elements
- [x] (P1, M) Reorder layers (UI list + drag or buttons)
- [ ] (P2, S) Toggle visibility per layer
- [ ] (P2, S) Add visible flag to layer model and defaults
- [ ] (P2, S) Hide text/image when layer is not visible
- [ ] (P2, S) Add UI control in layer row (eye icon or checkbox)
- [ ] (P1, S) Persist layer visibility
- [x] (P1, S) Persist layer order

### Theme
- [x] (P3, M) Add dark theme toggle (if it does not slow v1.2 delivery)

Exit criteria:
- Filters and layers work on upload + random color backgrounds.
- Exported image matches the canvas.
- Undo/redo covers filters and layers.
- Layer visibility and filter intensity are included.

Block-level done:
- Filters: selection + intensity + persistence + export
- Layers: order + visibility + persistence + export
- Theme: toggle + persistence

Out of scope for v1.2:
- Template gallery and presets (v1.3)
- Localization (v1.4)
- Backend/sharing (v2.0)

Risks/dependencies:
- Layer visibility impacts export, undo/redo, and localStorage schema.
- Filter intensity needs a stable mapping per filter type to avoid UX regressions.
- Canvas export must match on-screen render (watch for DPI scaling).

Quality metrics:
- Dragging text feels smooth (no visible lag on mid-range laptops).
- Export completes in under ~1s for 2x scale on typical images.
- Visual parity between canvas and exported image.

## Next: v1.3 (templates)

Goal: ship a template gallery and quick start flow.

- [ ] (P1, M) Template gallery with at least 8 starter memes
- [ ] (P1, S) One-click apply template to canvas
- [ ] (P2, M) Replace/clear template image without resetting text
- [ ] (P2, S) Persist last used template in localStorage

Exit criteria:
- User can pick, edit, and export a template in under 30 seconds.

## Later: v1.4 (polish + consistency)

Goal: establish visual consistency and improve performance.

- [ ] (P1, M) Define a visual theme (colors, typography, spacing)
- [ ] (P1, M) UI/UX polish across app (layout, controls, states)
- [ ] (P1, M) Accessibility pass (focus states, contrast, labels)
- [ ] (P2, L) Localization: EN/RU/CH
- [ ] (P1, L) Canvas refactor: retina rendering, resize behavior, render performance, save debounce

## Future: v2.0 (backend)

Goal: enable sharing and community features.

- [ ] (P1, L) User authentication
- [ ] (P1, L) Save and share memes
- [ ] (P2, L) Browse memes created by other users
