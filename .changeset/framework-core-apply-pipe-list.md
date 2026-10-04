---
"@inversifyjs/framework-core": minor
"@inversifyjs/http-core": patch
---

Added `applyPipeList`, which runs a pipe list on one handler parameter. `InversifyHttpAdapter` now uses it instead of its own copy.
