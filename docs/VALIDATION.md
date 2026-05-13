# Validation

## Current Validation Approach
- Manual PR testing for changed user flows.
- Vercel preview testing for user-facing changes.
- `npm run lint` for linting.
- `npx tsc --noEmit` for TypeScript checking.
- `npm run build` for production build verification.
- Backup/export/import testing for changes that touch persistence, localStorage keys, or workspace restoration.

## Pre-Merge Checklist
- Confirm branch context is correct for the work.
- Review `git diff --name-only` for unexpected app or config changes.
- For documentation-only changes, confirm no app behavior changed; lint/type/build are not required.
- For app-code changes, run lint, typecheck, and build when practical.
- Manually test affected meeting-critical flows.
- Verify Backup/Restore still works after persistence-related changes.
- Use Vercel preview for user-facing changes before merge.
