---
name: Telegram Mini App auth pattern
description: How to authenticate a Telegram Mini App against a custom backend without session cookies, plus a safe way to test outside real Telegram.
---

Send the Telegram `initData` string as an `Authorization: Bearer <initData>` header on every API request (reuse the app's existing auth-token-getter mechanism rather than inventing a new transport). The server verifies it with the documented HMAC scheme (secret = HMAC-SHA256("WebAppData", bot_token), then HMAC-SHA256(secret, sorted "key=value" pairs) must equal the `hash` param) and rejects stale `auth_date` (e.g. >24h).

**Why:** Telegram Mini Apps aren't loaded in a normal browser session — there's no cookie jar you control, and initData is the only tamper-proof identity signal Telegram gives you. HMAC verification is required because initData is otherwise just a client-suppliable string.

**How to apply:** Add a `dev:<id>` bypass token accepted only when `NODE_ENV !== "production"`, so the app can be exercised from the Replit browser preview (which is not real Telegram and has no initData). Never allow this bypass in production. Give the dev identity a fixed username matching whatever the app treats as "admin" so the admin panel is also reachable during dev testing.
