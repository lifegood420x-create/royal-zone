---
name: Earning app config-driven contact links
description: Where the Profile page's Help & Support / App Rules entries get their destinations, so they don't regress into placeholder links.
---

## Rule
- "Help & Support" opens `https://t.me/<adminUsername>` where `adminUsername` comes from `app_config` (exposed via `GET /config/public`) — the same field used to identify the admin account. Do not hardcode a `t.me/...` support handle.
- "App Rules" navigates to the in-app `/rules` route (a real React page with rules content), not an external Telegram link.

**Why:** An earlier version hardcoded both to nonexistent placeholder Telegram links (`t.me/as_earning_support`, `t.me/as_earning_rules`), so both buttons opened dead pages. The fix reuses config the admin already maintains instead of inventing new fields, so the two stay accurate without extra admin-panel upkeep.

**How to apply:** If asked to change the support contact, it's the same "Admin Contact Username" field in Admin → Config — no code change needed. If rules content changes, edit `artifacts/earning-app/src/pages/rules.tsx` directly.
