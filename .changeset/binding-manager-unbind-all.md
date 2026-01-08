---
"@inversifyjs/core": major
---

- **BREAKING CHANGE**: `BindingManager.unbindAll()` now returns `void | Promise<void>` instead of always returning `Promise<void>`. The method will only return a Promise if at least one deactivation is asynchronous, otherwise it returns void synchronously.
