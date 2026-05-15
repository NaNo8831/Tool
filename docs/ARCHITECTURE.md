# Architecture

## Current Architecture

- Application: existing Next.js app.
- Language: TypeScript.
- Styling: Tailwind CSS.
- Deployment: Vercel.
- Workspace persistence: browser `localStorage`.
- Backup/restore: JSON export/import workspace backup.
- Authentication: optional Supabase email/password auth foundation on `phase-2-cloud`.
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

Current workspace data is stored in browser `localStorage`, including the Meeting Setup completion flag and setup-backed workspace fields. Backup/export/import is the safety mechanism for moving or restoring workspace data. Supabase Auth session data is separate from workspace records and does not change workspace storage behavior.

## Phase 2 Boundary

Supabase is the Phase 2 platform direction. The current foundation only enables email/password authentication and persisted auth sessions on `phase-2-cloud`; it does not add cloud workspace persistence, a final schema, migration process, realtime model, team sharing, or permission enforcement.
