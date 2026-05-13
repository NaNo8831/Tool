# Project State

## Current Snapshot
- Product: Meeting Tool by LyArk in the `Meeting-Tool` repo.
- Status: live/deployed operational beta.
- Deployment: Vercel.
- Persistence: browser `localStorage`.
- Backup: JSON export/import workspace backup.
- Current focus: operational refinement and preparation for Phase 2 cloud planning.

## Production State
- The app supports lightweight leadership meeting operations around Playbook Definitions, Top Priority, Defining Objectives, tasks, Standard Operating Objectives, Strategic Topics, meeting sections, and Cascading Communication.
- Tasks follow the workflow `Planning → In Progress → Completed` and include details, descriptions, comments, activity history, and subtasks.
- RichTextEditor provides lightweight formatting for applicable descriptions/content.

## Active Work
- Adopt the 120x operating structure in this repo through planning and documentation files only.
- Keep `main` stable for production and UX stabilization.

## Parked Work
- PR #23 Meeting Setup flow is parked for later and should not be assumed merged unless the current branch contains it.
- Phase 2 cloud/auth/persistence work is planned for a separate long-running branch such as `phase-2-cloud`.

## Next Actions
- Use the planning files as the source of truth before future changes.
- Continue Phase 1 operational usability and stability improvements.
- Plan Supabase schema, permissions, and local-to-cloud migration before implementing cloud persistence.
