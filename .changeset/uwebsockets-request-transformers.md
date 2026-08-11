---
"@inversifyjs/http-uwebsockets": minor
---

- Added `RequestTransformer` and `UseRequestTransformers` so routes can run request transformers before middleware, with failures routed through `RouteParams.handleError`.
- Added `CaptureRequestValues` to snapshot selected request values behind a Proxy before any await, with explicit param name lists.
