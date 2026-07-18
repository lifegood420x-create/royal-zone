---
name: Ad reward flow bugs
description: Known bugs in the ad watch reward flow and their fixes
---

## Bug 1 — `err?.response?.data` always undefined (fixed)

`customFetch` throws `ApiError` where the parsed server JSON body is at `err.data`, NOT `err.response.data` (`err.response` is the raw `Response` object from fetch, which has no `.data` property). The earn.tsx `onError` handlers were checking `err?.response?.data?.error`, which was always `undefined`. Any server error (including `vpn_block`) showed as generic "Something went wrong while crediting your reward." instead of the correct UI.

**Fix:** Change all `err?.response?.data` → `err?.data` in earn.tsx error handlers.

## Bug 2 — VPN check `hosting` flag blocks Bangladesh mobile users (fixed)

ip-api.com's `hosting` field is true for IPs belonging to data centers and hosting providers. Bangladesh mobile carriers (Grameenphone, Robi, Banglalink) often route traffic through data centers, so their users' IPs show `hosting: true` even though they're legitimate mobile users. This was causing most regular users to get VPN-blocked.

**Fix:** Only check `proxy: true` in vpn-check.ts, never `hosting`. The `proxy` flag is specific to actual VPN/proxy services. See `artifacts/api-server/src/lib/vpn-check.ts`.

**Why:** `hosting` = IP belongs to a data center (could be mobile carrier NAT). `proxy` = confirmed anonymizer/VPN service.

## Bug 3 — Countdown overlay freezes at 0s, blocking ad SDK (fixed)

The countdown overlay (`countdown !== null`) kept showing even when `countdown === 0`. After the 15s countdown finished, the overlay remained visible (with "0s" text) until `showRewardedAd` resolved AND `finally` ran. This could block ad SDK close buttons and confuse users. Also: the countdown ran simultaneously with the ad SDK — if the SDK took longer than `durationSeconds`, users were stuck seeing a "0s remaining" screen with no way to proceed.

**Fix:** Change condition to `countdown !== null && countdown > 0` — overlay hides when countdown reaches 0, letting the ad SDK have full control of the screen.

## Bug 4 — No timeout on showRewardedAd (fixed)

If the Monetag or Adsgram SDK hangs (never resolves or rejects), the UI would freeze indefinitely — `Promise.all` never resolves, `finally` never runs, button stays disabled, user can't do anything.

**Fix:** Wrap the ad promise with a 3-minute timeout in `rewarded-ads.ts` using `withTimeout()`. Rejects with a user-friendly "Please try again" message.

## Pattern — server-side parse errors lose the error context

The original code called `WatchAdResponse.parse(...)` without try/catch. If it threw (e.g. schema mismatch after future API changes), Express's unhandled-error middleware would send a 500 with no useful message, AND the reward would already be credited (DB updated before parse). 

**Fix:** Wrap in try/catch, log the parse error with context, return a user-friendly 500 explaining "Reward was credited — please refresh."
