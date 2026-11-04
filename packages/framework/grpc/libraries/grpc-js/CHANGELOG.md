# @inversifyjs/grpc-js

## 1.0.2

### Patch Changes

- Parity version.
- Updated dependencies
  - @inversifyjs/grpc-core@1.0.2
  - inversify@8.2.4

## 1.0.1

### Patch Changes

- Updated dependencies
  - @inversifyjs/grpc-core@1.0.1

## 1.0.0

### Major Changes

Added `@inversifyjs/grpc-js`, a `@grpc/grpc-js` server adapter. `InversifyGrpcJsAdapter.build()` registers `@Service` handlers on a `Server`, sends unary and client-streaming return values through the callback, and ends failed calls with their gRPC status.

### Patch Changes

- Updated dependencies
  - @inversifyjs/grpc-core@1.0.0
