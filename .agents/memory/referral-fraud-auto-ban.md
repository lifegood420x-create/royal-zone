---
name: Referral fraud flagging (no longer auto-bans)
description: How the earning-app flags fake referral chains by IP and blocks their perks, and a gotcha about testing IP-based logic in this workspace.
---

## Rule
On signup (`upsertTelegramUser` in `artifacts/api-server/src/lib/users.ts`), a referred user is only **flagged** (`isFlagged: true`), never auto-banned, whether it's a same-IP-as-referrer signup or a repeat signup reusing an IP already seen under the same referrer. Flagged accounts are denied the referral bonus and blocked from ad rewards (`/ads/watch`, `/ads/claim` return 403), but can otherwise use the app normally.

**Why:** Product decision — auto-banning collateral-damaged otherwise-normal accounts (e.g. genuine friends sharing a home wifi/router). Removing the financial incentive (bonus + ad rewards) achieves the anti-farming goal without the ban's downside.

**How to apply:** Any change to referral crediting/reward-eligibility logic should preserve "flag, deny bonus, block ad rewards — never auto-ban" for this fraud signal. It's a check-then-insert (no DB uniqueness constraint on `(referredBy, registrationIp)`), so truly simultaneous concurrent first-signups from the same IP could theoretically both slip through unflagged — accepted as low-risk since farming is normally sequential.

## Testing gotcha
Spoofing `X-Forwarded-For` via curl against `$REPLIT_DEV_DOMAIN` from inside the workspace shell does **not** simulate distinct client IPs — Replit's proxy layer overwrites/normalizes the header with the real (single) egress path, so all such curl calls collapse to the same effective IP server-side. This made an initial manual test look like a false positive (an unrelated first signup got flagged as "same IP as referrer") when actually the proxy was just handing every request the same real IP.

**How to apply:** To verify IP-differentiated logic, either test the DB/business logic directly (bypassing HTTP), or validate the SQL/query conditions in isolation — don't trust `X-Forwarded-For` spoofing over curl inside this workspace as a way to simulate multiple distinct users.
