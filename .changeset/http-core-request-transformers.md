---
"@inversifyjs/http-core": minor
---

- Added `RequestTransformer`.
- Added `RouterExplorerControllerMetadata`.
- Added `RouterExplorerControllerMethodMetadata`.
- Updated `InversifyHttpAdapter` with a protected `_resolveRequestTransformerList()` hook resolving to `undefined` by default.
- Updated `RouteParams` with mandatory `handleError` and `requestTransformerList` properties.
