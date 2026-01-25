# Investigation: Integration Bug

## Bug Summary
The Resume Builder was not correctly integrated with the Candidate Portal at the desired path `/build`. The Candidate Portal was proxying `/builder` instead of `/build`, and the Resume Builder was configured with a base path of `/builder`. Additionally, there was a mismatch in the route directory names and hardcoded paths.

## Root Cause Analysis
1. **Path Mismatch**: The user wanted `/build` but the codebase was using `/builder` in several places:
   - `next.config.mjs` in the candidate portal.
   - `.env` in the resume builder.
   - Route directory `src/routes/builder` in the resume builder.
   - Hardcoded `navigate` calls in `src/dialogs/resume/index.tsx`.
2. **Route Generation**: The `src/routeTree.gen.ts` file was out of sync after directory renaming.

## Affected Components
- `juvakel-candidate/next.config.mjs`
- `Juvakel-Resume-Builder/.env`
- `Juvakel-Resume-Builder/src/routes/builder` (renamed to `src/routes/build`)
- `Juvakel-Resume-Builder/src/dialogs/resume/index.tsx`
- `Juvakel-Resume-Builder/src/routeTree.gen.ts`

## Proposed (and Implemented) Solution
1. Rename `src/routes/builder` to `src/routes/build` in `Juvakel-Resume-Builder`.
2. Update `VITE_APP_BASE_PATH` and related URLs in `Juvakel-Resume-Builder/.env` to use `/build`.
3. Update `next.config.mjs` in `juvakel-candidate` to proxy `/build` instead of `/builder`.
4. Update hardcoded navigation paths in `src/dialogs/resume/index.tsx`.
5. Regenerate the route tree using `npx tsr generate`.
