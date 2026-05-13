# Permissions

## Current State
- No authentication is implemented.
- No role enforcement is implemented.
- Workspace data is local to a single browser/device through `localStorage`.
- Sharing currently depends on JSON export/import rather than live shared access.

## Future Planned Roles
| Role | Planned Direction |
| --- | --- |
| Owner | Workspace creator/admin with full control over workspace settings, members, data, export, and destructive actions. |
| Editor | Can participate in meeting operations and update workspace content. |
| Viewer | Can read workspace content with limited or no mutation rights. |

## Open Items Before Cloud Launch
- Exact owner/editor/viewer permissions.
- Invitation and membership model.
- Workspace transfer or recovery behavior.
- Export/import behavior for each role.
- Whether realtime collaboration is part of initial cloud launch.

This file documents future planning only. Do not implement permissions unless a future scoped task explicitly requests it on the correct branch.
