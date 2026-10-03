---
"@inversifyjs/framework-core": minor
"@inversifyjs/http-core": patch
---

Added `InversifyServerAdapter`, the shared server registry and build lifecycle. `InversifyHttpAdapter` now extends it, and each HTTP adapter still installs global middleware on its own stack.
