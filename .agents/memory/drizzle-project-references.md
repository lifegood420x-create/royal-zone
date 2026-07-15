---
name: TS project references need a build, not just noEmit
description: Why "no exported member" errors show up in a consuming package right after editing a shared lib's schema/exports.
---

In this monorepo, packages like `lib/db` are TS project-reference composite packages that emit declaration files to `dist/*.d.ts`; consumers resolve types from those `.d.ts` files, not live from `src/`. Editing `lib/db/src/schema/*.ts` and then running `tsc --noEmit` in a consumer (e.g. `artifacts/api-server`) checks against the *stale* `dist` declarations and reports "Module has no exported member X" for things you just added.

**Why:** `--noEmit` skips the reference-build step that `tsc --build` performs, so it never regenerates the shared lib's `.d.ts` files.

**How to apply:** after changing any `lib/*` package, run `pnpm -w run typecheck:libs` (or `tsc --build` directly in the consuming package) before trusting a "no exported member" error — it may just mean the lib's declarations are stale, not that the export is missing.
