---
"@inversifyjs/http-insights": minor
---

- Added optional URL pattern options to `HttpInsightsProvider`. Calls that do not match the pattern are not stored. The default pattern keeps every call except `.inversify` endpoints.
