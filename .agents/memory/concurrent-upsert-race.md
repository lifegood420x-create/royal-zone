---
name: Concurrent user upsert race
description: A check-then-insert upsert-by-external-id pattern fails under concurrent first requests; how to make it safe.
---

A naive "select by external id, insert if missing" upsert (e.g. registering a user by `telegram_id` on first authenticated request) is racy: a client that fires several requests at once before the row exists (multiple hooks mounting simultaneously) can have two requests both see "no row" and both attempt the insert. The loser hits the unique-constraint violation (Postgres code `23505`) and the request 500s.

**Why:** the select-then-insert isn't atomic; nothing prevents two concurrent requests from both passing the "does it exist" check before either commits.

**How to apply:** wrap the insert in a try/catch, and on a `23505` conflict (check both `error.code` and `error.cause?.code`, since ORMs like Drizzle often wrap the underlying driver error), re-select the row the winner created and return that instead of propagating the error. Prefer this over `ON CONFLICT DO UPDATE` when you need to run one-time side effects (e.g. referral crediting) only for the actual creator.
