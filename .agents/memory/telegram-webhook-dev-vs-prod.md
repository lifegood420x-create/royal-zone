---
name: Telegram webhook must never auto-register from the dev workflow
description: Root cause of "bot stopped responding in production" recurring incident, and the prod/dev app_config data-sync gotcha.
---

## Rule
The api-server used to call `setWebhook` automatically on every process boot (any environment) via `ensureWebhookRegistered()` in `index.ts`, pointing Telegram's webhook at whatever `REPLIT_DOMAINS` resolved to for that process. In the dev workspace this is the `.replit.dev` preview domain, not production. Every dev workflow restart (which happens constantly while iterating on code) silently re-pointed the live webhook away from production and onto the dev domain — breaking the bot in production with no error visible anywhere except Telegram quietly delivering updates to the dev server instead.

Fix: auto-registration on boot is now gated on `NODE_ENV === "production"`. Dev/test webhook pointing must go through the admin panel's explicit "Reset Webhook" action only.

**Why:** Recurring "bot not responding" incidents traced back to this — not a crash, not a bad token, just the webhook target getting hijacked by routine dev restarts.

**How to apply:** If "bot stopped responding in production" recurs, check `getWebhookInfo` (via the admin panel's webhook status) for whether the registered URL is the prod domain or a `.replit.dev` dev domain before assuming a code/token/DB problem. Never add automatic `setWebhook` calls that run in non-production environments.

## Related: production vs. dev have separate databases
Production has its own Postgres database, separate from development. Publishing/republishing syncs *schema* migrations, not *data rows* — admin/bot settings configured in dev's `app_config` table (admin username, bot username, bot name, etc.) never automatically reach production. After every republish, someone must re-apply any config-table changes in the production admin panel itself (or via a seed/migration step) — it is not carried over by the deploy.
