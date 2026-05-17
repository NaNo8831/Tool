# Architecture

## Current Architecture

- Application: existing Next.js app.
- Language: TypeScript.
- Styling: Tailwind CSS.
- Deployment: Vercel.
- Workspace persistence: Local Workspace uses browser `localStorage`; selected Cloud Workspaces can save/load the full workspace backup JSON in Supabase.
- Backup/restore: JSON export/import workspace backup.
- Authentication: optional Supabase email/password auth foundation on `phase-2-cloud`.
- Tester feedback: lightweight Supabase-backed feedback submissions with optional workspace snapshot metadata.
- Workspace mode: local-first selector with optional Supabase Cloud Workspace persistence for signed-in owners.
- Current status: live/deployed operational beta.

## Current App Areas

- Meeting Setup first-run / edit flow for team or meeting name, playbook prompts, and Top Priority.
- Playbook Definitions.
- Top Priority / Thematic Goal.
- Defining Objectives.
- Tasks with `Planning → In Progress → Completed` workflow.
- Task details modal with descriptions, comments, activity history, and subtasks.
- Standard Operating Objectives.
- Strategic Topics.
- Meeting sections including Agenda Items, Decisions / Actions, and Cascading Communication.
- Backup / Restore.
- RichTextEditor with lightweight formatting.

## Persistence Boundary

Local Workspace data remains stored in browser `localStorage`, including the Meeting Setup completion flag and setup-backed workspace fields. Backup/export/import remains the safety mechanism for moving or restoring workspace data. In Cloud Workspace mode, the app uses per-workspace browser fallback keys for the active client state and saves/loads the same full workspace backup object to the selected owner-only Supabase `workspaces.workspace_data` JSONB column. Selecting a Cloud Workspace does not auto-migrate local data or silently overwrite the local workspace.

## Phase 2 Boundary

Supabase is the Phase 2 platform direction. The current foundation enables email/password authentication, persisted auth sessions, lightweight tester feedback, and owner-only Cloud Workspace persistence on `phase-2-cloud`; it does not force local-to-cloud migration, add realtime collaboration, add team sharing, add editor/viewer roles, or replace export/import backup.
