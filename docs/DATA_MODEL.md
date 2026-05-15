# Data Model

## Current Storage
The current app persists workspace data as JSON in browser `localStorage`. Export/import backs up and restores local workspace keys. The future cloud schema is unresolved.

## Logical Entities
| Entity | Current Meaning |
| --- | --- |
| Workspace | The local collection of Meeting Tool data stored in browser storage. |
| Meeting Setup State | Browser-local completion flag plus setup-backed fields used to personalize the workspace. |
| Playbook Definitions | Organizational context and definitions used to guide leadership alignment. |
| Top Priority | Current short-term rallying priority / thematic goal. |
| Defining Objective | Temporary qualitative objective that supports the Top Priority. |
| Task | Action item with title, description, assignee, due date, status, subtasks, comments, and activity history. |
| Subtask | Smaller checklist item within a task. |
| Comment | Note attached to a task. |
| Activity History | Timestamped task history such as subtask and due-date changes. |
| Standard Operating Objective | Ongoing operating priority that persists beyond the current Top Priority. |
| Strategic Topic | Persistent strategic holding item not intended to be resolved in tactical meetings. |
| Meeting | A meeting record/date containing section items. |
| Meeting Section Item | Agenda, topic, decision/action, or cascade item captured during meeting workflow. |

## Phase 2 Open Design Items
- Whether to store workspace data as JSONB initially or normalize into separate tables.
- How to migrate local workspace data without duplicates or overwrites.
- How owner/editor/viewer permissions affect entity access and mutation.
- Whether realtime collaboration is required with the first cloud release.

## Phase 2 Feedback Table

Tester feedback is intentionally lightweight and non-ticket-based. It is stored separately from workspace data so feedback collection does not change the existing `localStorage` workspace behavior.

Supabase migration: `supabase/migrations/20260515000000_create_feedback.sql`.

```sql
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid null references auth.users(id) on delete set null,
  user_email text null,
  type text not null check (type in ('Bug', 'UX Friction', 'Suggestion', 'Confusing Workflow')),
  severity text not null check (severity in ('Minor', 'Blocking')),
  note text not null,
  intent text null,
  page text null,
  browser text null,
  app_version text null,
  workspace_snapshot jsonb null,
  metadata_json jsonb null
);

alter table public.feedback enable row level security;

create policy "Allow tester feedback inserts"
  on public.feedback
  for insert
  to anon, authenticated
  with check (user_id is null or auth.uid() = user_id);
```

No admin dashboard, ticket status, assignment, notifications, threaded comments, file upload, or screenshot data is part of this foundation.
