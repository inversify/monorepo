# @inversifyjs/framework-core

## 2.1.0

### Minor Changes

- Added the `@Discriminated` decorator for discriminator-based error filter matching.
- Re-exported `Discriminated` from `@inversifyjs/http-core`.
- Added `getErrorDiscriminatorMetadata` calculation that reads own discriminator metadata only.
- Updated `getErrorFilterForError` and `setErrorFilterToErrorFilterMap` to support discriminator-based error lookup, checking each constructor level's own discriminators before its type filter so more specific handlers win.

## 2.0.0

### Major Changes

- Updated packages to be ESM only
- Updated inversify peer dependency to `8.x`

### Patch Changes

- Updated dependencies
  - inversify@8.1.0

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
