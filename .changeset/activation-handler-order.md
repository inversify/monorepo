---
"@inversifyjs/core": patch
"@inversifyjs/container": patch
"inversify": patch
---

- Fixed activation and deactivation handler order. Container activation handlers run from parent containers to child containers. Container deactivation handlers run from child containers to parent containers, before the binding handler and `@preDestroy`.
