---
"@inversifyjs/core": patch
---

- Fixed JIT resolution for transient instance bindings with more than four constructor and property injections combined, which could throw a `SyntaxError` or resolve with the wrong arity when `jitless` was `false`.
