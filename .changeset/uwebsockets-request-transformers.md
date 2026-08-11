---
"@inversifyjs/http-uwebsockets": minor
---

- Added `RequestTransformer` and `UseRequestTransformers` so routes can run request transformers before middleware, with failures routed through `RouteParams.handleError`.
