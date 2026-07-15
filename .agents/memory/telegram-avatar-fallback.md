---
name: Telegram avatar broken-image fallback
description: Why every place that renders a Telegram user's photoUrl needs an onError fallback, not just a null-check.
---

## Rule
Any `<img src={someUser.photoUrl}>` in the earning-app must have an `onError` handler that flips to a per-item "failed" state, falling back to the initial-letter avatar div — not just an `{photoUrl ? <img/> : <fallback/>}` null-check. Applied in `home.tsx` (own avatar), `profile.tsx` (own avatar), and `refer.tsx` (referral list, keyed by referral id in a `Set<number>`).

**Why:** `photoUrl` being present doesn't guarantee the image actually loads — Telegram's `t.me/i/userpic/...` URLs can 302-redirect through paths that fail intermittently, expire, or get blocked by the client's network. Without `onError`, a failed load renders the browser's native broken-image icon (a distinct visual bug users will report as "the picture is still not fixed").

**How to apply:** When adding any new avatar/photo `<img>` sourced from Telegram data, always wire up the same `onError → state → fallback` pattern from the start.
