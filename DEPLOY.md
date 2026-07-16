# Deploying to Railway

This repo is set up to run as a single Railway service: the Express API
server also serves the built Mini App frontend from `/`. Build and start
commands are read automatically from `railway.json`.

## 1. Create the project

- Railway → New Project → **GitHub Repository** → pick this repo.
- Add a database: **Create → Database → PostgreSQL**.

## 2. Set service variables

On the app service → **Variables**:

| Variable                   | Value                                        |
| -------------------------- | -------------------------------------------- |
| `DATABASE_URL`             | `${{Postgres.DATABASE_URL}}` (reference)     |
| `TELEGRAM_BOT_TOKEN`       | your bot token from @BotFather               |
| `NODE_ENV`                 | `production`                                 |
| `ADMIN_BOOTSTRAP_USERNAME` | `shanto_As`                                  |

`PORT` is injected by Railway automatically. The public domain is picked
up from Railway's `RAILWAY_PUBLIC_DOMAIN` — no domain variable needed
(set `PUBLIC_DOMAIN` manually only on other hosts).

## 3. Generate a domain

Service → Settings → Networking → **Generate Domain**, then redeploy so
the domain variable is available to the app.

## 4. Database schema + data

Option A — migrate existing data from Replit:

```sh
# In the Replit shell:
pg_dump "$DATABASE_URL" --no-owner --no-privileges > backup.sql
# From your PC, using the Railway Postgres DATABASE_PUBLIC_URL:
psql "<railway-public-url>" < backup.sql
```

Option B — fresh database:

```sh
DATABASE_URL="<railway-public-url>" pnpm --filter @workspace/db run push
DATABASE_URL="<railway-public-url>" node lib/db/scripts/seed.mjs
```

## 5. Verify

- On boot in production the server auto-registers the Telegram webhook
  at `https://<domain>/api/telegram/webhook`.
- Send `/start` to the bot — the welcome message's button should open
  the Mini App at the Railway domain.
- If @BotFather has a menu-button URL configured, update it to the new
  domain. Also update Monetag/Adsgram postback URLs from the admin
  Settings tab (they are rebuilt from the current domain).
