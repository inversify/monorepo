---
"@inversifyjs/http-hono": patch
---

- Fixed urlencoded body keys that also exist on `Object.prototype`, such as `toString` or `constructor`, being parsed into arrays
