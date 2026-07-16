---
"@inversifyjs/core": patch
"inversify": patch
---

- Fixed resolved value binding resolution to respect the `jitless` container option, avoiding `Function` constructor usage in CSP-restricted environments.
