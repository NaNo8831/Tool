# Architecture

## Current Architecture

- Application: existing Next.js app.
- Language: TypeScript.
- Styling: Tailwind CSS.
- Deployment: Vercel.
- Workspace persistence: browser `localStorage`.
- Backup/restore: JSON export/import workspace backup.
- Authentication: optional Supabase email/password auth foundation on `phase-2-cloud`.
- Tester feedback: lightweight Supabase-backed feedback submissions with optional workspace snapshot metadata.
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

Current workspace data is stored in browser `localStorage`, including the Meeting Setup completion flag and setup-backed workspace fields. Backup/export/import is the safety mechanism for moving or restoring workspace data. Supabase Auth session data and feedback submissions are separate from workspace records and do not change workspace storage behavior.

## Phase 2 Boundary

Supabase is the Phase 2 platform direction. The current foundation enables email/password authentication, persisted auth sessions, and lightweight tester feedback on `phase-2-cloud`; it does not add cloud workspace persistence, a final workspace schema, migration process, realtime model, team sharing, or permission enforcement.
