# File Inventory

## Repo Files
| Path | Type | Purpose |
| --- | --- | --- |
| `AGENTS.md` | Repo instruction | Canonical project operating instructions for Codex/builders. |
| `CODEX.md` | Repo instruction | Thin Codex adapter pointing to `AGENTS.md` and planning files. |
| `README.md` | Documentation | Local setup, validation commands, deployment, and Phase 2 environment boundary. |
| `planning/STATE.md` | Planning | Current project snapshot, active/parked work, next actions. |
| `planning/DECISIONS.md` | Planning | Durable decisions only. |
| `planning/DOMAIN.md` | Planning | Business/product terminology and meeting model. |
| `planning/RISKS.md` | Planning | Known risks and mitigation notes. |
| `planning/QUESTIONS.md` | Planning | Open questions that should not be assumed answered. |
| `planning/sprints/001-operational-stabilization/` | Planning | Operating-structure sprint requirements, blueprint, acceptance, and handoff prompt. |
| `docs/ARCHITECTURE.md` | Documentation | Current architecture and Phase 2 boundary. |
| `docs/DATA_MODEL.md` | Documentation | Current logical data entities and storage notes. |
| `docs/VALIDATION.md` | Documentation | Validation and pre-merge checks. |
| `docs/PERMISSIONS.md` | Documentation | Current no-auth state and future role planning. |
| `app/` | Source | Existing Next.js app; do not move during planning-only work. |
| `app/hooks/useLocalStorage.ts` | Source | Browser localStorage hook. |
| `app/lib/workspaceBackup.ts` | Source | JSON workspace backup/export/import utilities. |
| `app/types/` | Source | Current TypeScript logical data shapes. |
| `package.json` | Config | Next.js, TypeScript, Tailwind, lint/build scripts. |

## External / Uploaded Reference Materials
| Reference | Type | Status / Use |
| --- | --- | --- |
| 120x architect/builder philosophy | External reference | Used as operating-structure context when available; not stored in repo by this PR. |
| 120x scaffold instructions | External reference | Used to shape planning/docs structure; not stored in repo by this PR. |
| 120x quickstart | External reference | Used as process context when available; not stored in repo by this PR. |
| Table Group thematic goal reference | External reference | Domain influence for Top Priority / Thematic Goal terminology; not stored in repo by this PR. |
| Table Group tactical meeting guide | External reference | Domain influence for tactical meeting flow; not stored in repo by this PR. |
