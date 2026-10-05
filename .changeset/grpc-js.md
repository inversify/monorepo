---
"@inversifyjs/grpc-js": major
---

Added `@inversifyjs/grpc-js`, a `@grpc/grpc-js` server adapter. `InversifyGrpcJsAdapter.build()` registers `@Service` handlers on a `Server`, sends unary and client-streaming return values through the callback, and ends failed calls with their gRPC status.
