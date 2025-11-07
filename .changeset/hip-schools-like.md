---
"@inversifyjs/http-hono": patch
---

- Updated `InversifyHonoHttpAdapter._getBody` to properly handled `text/plain`, `application/x-www-form-urlencoded` and `multipart/form-data` bodies
