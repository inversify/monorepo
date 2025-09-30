# @inversifyjs/framework-core

## 1.0.1

### Patch Changes

- Updated dependencies
  - @inversifyjs/reflect-metadata-utils@1.4.1
  - inversify@7.10.2

## 1.0.0

### Minor Changes

- Adds decorators for middleware (`ApplyMiddleware`) and guards (`UseGuard`).
- Defines models and utilities for Guards, Interceptor, Middleware, Pipes, and their metadata.
- Provides utilities to explore and build class/method-level middleware, guard and interceptor lists.
- Exports key types and enums such as `MiddlewarePhase`, `ApplyMiddlewareOptions`, `Guard`, `Interceptor`, `Pipe`, `PipeMetadata`, and typeguard utilities.
- Add CatchError decorator.
- Add UseErrorFilter decorator.
