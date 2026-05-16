# Permissions

## Current State
- Signed-out users can use Local Workspace with browser `localStorage` and JSON export/import backup.
- Supabase email/password auth is available on `phase-2-cloud` when environment variables are configured.
- Authenticated users can create and select owner-only cloud workspace containers.
- Selecting a Cloud Workspace does not save objectives, tasks, meetings, setup fields, or other full workspace data to Supabase yet.
- Tester feedback can be submitted to Supabase separately from workspace persistence.

## Current Supabase RLS

### `feedback`
- Anonymous and authenticated users can insert tester feedback.
- Authenticated feedback rows must either have `user_id` unset or match `auth.uid()`.

### `workspaces`
- Only authenticated users can insert workspace containers where `owner_id = auth.uid()`.
- Only authenticated users can select workspace containers they own.
- Only authenticated users can update the name or metadata for workspace containers they own.
- Anonymous users have no workspace-container access.

## Future Planned Roles
| Role | Planned Direction |
| --- | --- |
| Owner | Workspace creator/admin with full control over workspace settings, members, data, export, and destructive actions. |
| Editor | Can participate in meeting operations and update workspace content. |
| Viewer | Can read workspace content with limited or no mutation rights. |

## Open Items Before Cloud Persistence Launch
- Exact owner/editor/viewer permissions.
- Invitation and membership model.
- Workspace transfer or recovery behavior.
- Export/import behavior for each role.
- Whether realtime collaboration is part of initial cloud launch.
- Local-to-cloud migration and conflict behavior.

This file documents the current owner-only cloud workspace container foundation plus future planning. Do not implement broader permissions unless a future scoped task explicitly requests it on the correct branch.
