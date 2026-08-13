---
"@inversifyjs/http-uwebsockets": patch
---

- Resolved `@CaptureRequestValues` options so capturing `url` also captures `query`, which the adapter needs to rebuild the URL.
