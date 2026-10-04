---
"@inversifyjs/grpc-core": major
---

Added `@inversifyjs/grpc-core`, with `@Service` and `@RPC` metadata discovery, `InversifyGrpcAdapter`, `GrpcError` classes for every gRPC status code, and `@Call`, `@Callback` and `createCustomParameterDecorator` parameter decorators that run pipes. Unary and client-streaming methods return their response, so interceptor transforms reach the client.
