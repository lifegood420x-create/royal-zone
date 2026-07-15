---
name: Ad reward countdown gate
description: How the earning-app enforces a minimum wait before crediting a video-ad reward, on top of the ad network's own SDK.
---

## Rule
`handleWatchAd` in `artifacts/earning-app/src/pages/earn.tsx` only calls the reward-crediting mutation (or, in postback mode, shows the "watched" toast) after `Promise.all([showRewardedAd(...), runCountdown(durationSeconds)])` resolves — never on the ad SDK's promise alone. `durationSeconds` comes from admin-configurable `adDurationSeconds` in `app_config` (default 15s), surfaced via `/config/public`. A full-screen overlay with a live countdown and progress bar shows while this is pending, with no close button.

**Why:** User-reported concern that rewards could be granted before the ad "finished" — relying solely on the ad network's SDK promise isn't enough because different networks/configs vary. Adding an app-owned minimum-wait timer guarantees consistent behavior regardless of SDK quirks, independent of the separate postback-verification anti-fraud layer (`requireAdPostback`).

**How to apply:** If ad reward timing feels off again, check `adDurationSeconds` in Admin → Config → Ads & Limits, not just the ad network's own settings. Any new ad network flow should route through the same `runCountdown` gate before requesting a reward.
