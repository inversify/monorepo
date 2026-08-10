---
"@inversifyjs/http-uwebsockets": minor
---

- Added `CaptureRequestValues`.
- Added `RequestTransformer`.
- Added `RequestValueKind`.
- Added `UseRequestTransformers`.
- Updated `InversifyUwebSocketsHttpAdapter` to run request transformers before the route middleware list, handling their errors with the route error filters.
- Updated `InversifyUwebSocketsHttpAdapter` to serve captured route params and captured bodies on transformed requests.
