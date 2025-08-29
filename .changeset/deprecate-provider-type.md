---
"@inversifyjs/core": patch
---

Deprecated `Provider` type. Use `Factory` instead. Providers will be removed in v8. Providers exist for historical reasons from v5 when async dependencies weren't supported. Factories are more flexible and can handle both sync and async operations.