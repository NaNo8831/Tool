# Architecture

## Current Architecture
- Application: existing Next.js app.
- Language: TypeScript.
- Styling: Tailwind CSS.
- Deployment: Vercel.
- Persistence: browser `localStorage`.
- Backup/restore: JSON export/import workspace backup.
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
Current workspace data is stored in browser `localStorage`, including the Meeting Setup completion flag and setup-backed workspace fields. Backup/export/import is the safety mechanism for moving or restoring workspace data.

## Phase 2 Boundary
Supabase is the likely platform for future cloud/auth/persistence work. Phase 2 should be planned on a separate branch such as `phase-2-cloud`; this documentation does not define a final schema, migration process, realtime model, or permission enforcement.
