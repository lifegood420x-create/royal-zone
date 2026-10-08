# Monetage CMP

A Telegram Mini App where users watch rewarded ads, complete simple tasks, and refer friends to earn bKash/Nagad cash, with a hidden admin panel for payout approval and app management.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/earning-app run dev` — run the Telegram Mini App frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `node lib/db/scripts/seed.mjs` — seed the default app config row + starter tasks (safe to re-run)
- Required env/secrets: `DATABASE_URL` (Postgres), `TELEGRAM_BOT_TOKEN` (real bot token, used for initData verification and the Bot API)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- Frontend: React + Vite, wouter routing, shadcn/ui, TanStack Query via generated hooks
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec) — generated hooks/schemas live in `lib/api-client-react` and `lib/api-zod`
- Build: esbuild (CJS bundle) for the API server

## Where things live

- `lib/api-spec/openapi.yaml` — source-of-truth API contract; edit here then run codegen
- `lib/db/src/schema/` — Drizzle schema (users, tasks, task_completions, withdrawals, ad_watches, app_config)
- `artifacts/api-server/src/routes/` — Express route handlers, mirrors the OpenAPI paths (`admin/` subfolder for admin-only routes)
- `artifacts/api-server/src/middlewares/auth.ts` — Telegram auth + admin gate
- `artifacts/api-server/src/lib/telegram.ts` — initData verification + Telegram Bot API calls
- `artifacts/earning-app/src/lib/telegram.ts` — frontend Telegram WebApp bootstrap + auth token supplier
- `artifacts/earning-app/src/lib/rewarded-ads.ts` — Monetag/Adsgram rewarded-ad SDK loader

## Architecture decisions

- Auth: the frontend sends Telegram `initData` as a Bearer token; the API HMAC-verifies it server-side with `TELEGRAM_BOT_TOKEN` (no session cookies). See `.agents/memory/telegram-mini-app-auth.md`.
- A `dev:<id>` bearer token bypasses real Telegram verification when `NODE_ENV !== "production"`, so the app is testable from the Replit browser preview outside of real Telegram.
- Admin access is determined by comparing the authenticated Telegram username to `app_config.admin_username` (no separate roles table).
- Payouts are always manual — admin approves/rejects bKash/Nagad withdrawal requests by hand; there is no payment gateway integration.
- Rejecting a withdrawal refunds the balance and doubles that user's effective minimum withdrawal (`base_min_withdraw * 2^rejected_withdraw_count`).
- Self/fake-referral detection: a signup is flagged (not credited) when its registration IP matches its referrer's registration IP.
- Ad network zone/block IDs (Monetag, Adsgram) are configurable at runtime from the admin Settings tab, not hardcoded.

## Product

- User app: home (balance + quick actions), Earn (rewarded ads + task list), Refer (referral link/stats), Withdraw (bKash/Nagad payout requests + history), Profile.
- Admin app (hidden, gated by `admin_username`): dashboard stats, pending payout approval/rejection, user search/ban/unban, flagged-user review, task CRUD, app settings (rewards, limits, ad network IDs, admin username), broadcast messaging, webhook status/reset.

## User preferences

_None recorded yet._

## Gotchas

- `artifacts/api-server` and `lib/db`/`lib/api-zod` use TypeScript project references — after changing a lib, run `pnpm -w run typecheck:libs` (or `tsc --build` in the consuming package) before trusting a plain `tsc --noEmit`, or stale `dist/*.d.ts` will produce false "no exported member" errors.
- Concurrent first-requests for the same Telegram user can race on `users.telegram_id` (unique); `upsertTelegramUser` catches the `23505` conflict and re-reads the row instead of erroring.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
