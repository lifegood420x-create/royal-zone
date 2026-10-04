---
name: pnpm version bootstrap
description: Local package-manager self-upgrade behavior for this workspace's pnpm version pin.
---

The repository pins pnpm 10.15.0, while the Replit environment provides pnpm 10.26.1. Automatic switching tries to install the pinned version and aborts. Temporarily disabling `manage-package-manager-versions` allowed lockfile-frozen dependency installation and project checks with the available pnpm. Do not commit that workaround unless the project intentionally adopts it.

**Why:** the package-manager auto-switch fails before the app's own scripts run, which can look like a broken build or preview.

**How to apply:** when pnpm aborts while trying to install 10.15.0, disable package-manager version management only for the install/check session, then restore the project config. Keep the lockfile unchanged.