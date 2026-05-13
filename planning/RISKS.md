# Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| `localStorage` is browser/device-specific. | Users may not see the same workspace on another browser or device. | Keep backup/export visible; plan cloud migration carefully. |
| No shared live collaboration. | Leadership teams cannot safely co-edit one live workspace yet. | Treat collaboration as Phase 2 planning unless explicitly prioritized. |
| Data loss without regular exports. | Browser reset or device loss can remove workspace data. | Encourage JSON backup exports and retain import/export after cloud launch. |
| Cloud migration could overwrite or duplicate local data. | Users may lose or duplicate workspace records. | Design migration with preview, dedupe rules, and rollback/export path before implementation. |
| Multiple Codex PRs can drift. | Work may target the wrong branch or stale assumptions. | Confirm branch context and update planning state/decisions. |
| Rich text editing can be fragile. | Formatting or editing may break meeting flow. | Keep formatting lightweight and regression-test editor flows. |
| Drag/drop can conflict with editing/selecting text. | Users may accidentally move items while editing. | Test pointer/selection behavior around draggable content. |
| Permission model is unresolved. | Cloud launch could expose or restrict data incorrectly. | Define owner/editor/viewer behavior before cloud implementation. |
