---
name: Ad network postback verification pattern
description: Server-authoritative crediting for rewarded-ad flows (Monetag/Adsgram-style), preventing devtools-faked ad completions.
---

Client-side "ad watched" callbacks (Monetag/Adsgram SDK promises resolving) are not proof of a real view — a user can fake the resolution via devtools and get credited for nothing. If fraud-resistant crediting is required, don't trust the client call alone.

**Pattern:** claim → show → server postback confirms.
1. Client calls an authenticated `/claim` endpoint first. This reserves the day's rate-limit slot and creates a `pending` reward row keyed by a generated opaque `claimId`. No balance is credited yet.
2. Client passes `claimId` into the ad SDK's show call as a best-effort request-var/subid, then shows the ad.
3. The ad network's own server later calls a **public** `/postback` endpoint (no user auth — gate it with a `secret` query param configured in the network's dashboard) with the claim id echoed back. That call is what actually credits the balance, exactly once (idempotent by claim id / status transition).
4. The postback endpoint should always return HTTP 200 (even for bad secret/unknown/duplicate claims) so the ad network's retry logic doesn't loop — put the real outcome in the response body for your own logs, not the status code.

**Why:** ad SDKs only run in the browser, so their resolution is inherently spoofable; only a server-to-server call from the ad network itself is authoritative.

**How to apply:** Make this opt-in via a boolean flag (e.g. `requireAdPostback`, default off) so the simpler immediate-credit flow keeps working out of the box before the admin has configured a real postback URL in their ad network's dashboard. The exact macro/param name the network uses to echo back the claim id (e.g. `{click_id}`, `{subid}`) is dashboard-specific and must be confirmed by the user, not guessed — communicate this as a real external unknown.
