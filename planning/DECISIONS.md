# Durable Decisions

| Date | Decision | Rationale / Notes |
| --- | --- | --- |
| 2026-05-15 | Close stale Supabase Foundation PR work in favor of a fresh PR based on the updated `phase-2-cloud` branch. | Keeps Phase 2 cloud work aligned with the current long-running branch and avoids carrying forward drift from older PR context. |
| 2026-05-13 | Phase 1 remains localStorage-first. | Keeps the live operational beta simple while usability stabilizes. |
| 2026-05-13 | Deploy through Vercel. | Current production deployment path for the Next.js app. |
| 2026-05-13 | Keep JSON export/import backup even after cloud persistence is introduced. | Backup/restore protects users and supports migration/recovery. |
| 2026-05-13 | Keep UX lightweight and meeting-friendly. | The tool supports live weekly leadership meetings, not heavy project management. |
| 2026-05-13 | Supabase is the likely Phase 2 platform for cloud/auth/persistence. | Directional decision only; schema and migration design are unresolved. |
| 2026-05-13 | Use a separate long-running `phase-2-cloud` branch for cloud/auth/storage work. | Reduces risk to production/stable `main` while larger architecture work is planned. |
| 2026-05-13 | Treat `main` as production/stable and UX stabilization. | Main deploys to Vercel and should remain stable. |
