---
name: Orval schema/type naming collisions
description: Why TS2308 "ambiguous export" errors appear after orval codegen, and how schema naming avoids them.
---

Orval derives a type/const name for every operation response as `<OperationIdPascalCase>Response`. If an OpenAPI component schema happens to share that exact name (e.g. an operation `completeTask` produces `CompleteTaskResponse`, and you also named a reusable schema `CompleteTaskResponse`), the generated barrel re-exports both and TypeScript raises TS2308 ambiguous-export errors.

**Why:** the collision is invisible until codegen runs — nothing in the OpenAPI spec itself flags it, and both names are individually valid.

**How to apply:** name reusable component schemas after the entity/shape they represent (e.g. `TaskCompletionResult`, `AdWatchResult`), never after the operation they happen to back. If codegen fails with TS2308 on a `*Response` name, check for exactly this collision before investigating anything else.
