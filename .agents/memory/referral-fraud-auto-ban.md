---
name: Referral fraud auto-ban
description: How the earning-app auto-bans fake referral chains by IP, and a gotcha about testing IP-based logic in this workspace.
---

## Rule
On signup (`upsertTelegramUser` in `artifacts/api-server/src/lib/users.ts`), a referred user is auto-banned (`isBanned: true`) only if another account already exists with the same `referredBy` **and** the same `registrationIp` (i.e. this is the 2nd+ signup reusing an IP under one referrer). The *first* signup from a given IP under a referrer is let through, even if that IP happens to equal the referrer's own `registrationIp` — it's only flagged (`isFlagged`) in that case, not banned, and is denied the referral bonus.

**Why:** Product decision — referral farming looks like one person creating account A, then spinning up B, C, D... from the same device/IP using A's referral code. Banning only repeats (not the first) avoids punishing genuine friends who happen to share a home wifi/router.

**How to apply:** Any change to referral crediting or ban logic should preserve this "first IP occurrence per referrer is OK, repeats are banned" invariant. It's a check-then-insert (no DB uniqueness constraint on `(referredBy, registrationIp)`), so truly simultaneous concurrent first-signups from the same IP could theoretically both slip through unbanned — accepted as low-risk since farming is normally sequential.

## Testing gotcha
Spoofing `X-Forwarded-For` via curl against `$REPLIT_DEV_DOMAIN` from inside the workspace shell does **not** simulate distinct client IPs — Replit's proxy layer overwrites/normalizes the header with the real (single) egress path, so all such curl calls collapse to the same effective IP server-side. This made an initial manual test look like a false positive (an unrelated first signup got flagged as "same IP as referrer") when actually the proxy was just handing every request the same real IP.

**How to apply:** To verify IP-differentiated logic, either test the DB/business logic directly (bypassing HTTP), or validate the SQL/query conditions in isolation — don't trust `X-Forwarded-For` spoofing over curl inside this workspace as a way to simulate multiple distinct users.
