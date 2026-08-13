---
"@inversifyjs/create-http": patch
---

- Limited uWebSockets `@CaptureRequestValues` to POST and PATCH todo endpoints that read the request body.
- Added `@SetHeader('Content-Type', 'application/json')` on uWebSockets JSON todo endpoints.
