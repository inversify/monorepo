# @inversifyjs/http-uwebsockets

## 4.6.0

### Minor Changes

- Added `pipeKnownSizeStreamOverResponse`
- Updated HTTP adapter with `_sendBodySeparator`

### Patch Changes

Add support for custom native parameter decorators

- Updated `InversifyUwebSocketsHttpAdapter` to no longer send wrong content lengths on stream responses
- Updated dependencies
  - @inversifyjs/http-core@4.6.0

## 4.5.0

### Patch Changes

- Updated dependencies
  - @inversifyjs/http-core@4.5.0

## 4.4.0

### Patch Changes

- Updated dependencies
  - @inversifyjs/http-core@4.4.0

## 4.3.0

### Patch Changes

- Updated dependencies
  - @inversifyjs/http-core@4.3.0

## 4.2.0

### Patch Changes

- Updated `InversifyUwebSocketsHttpAdapter` to improve body parse performance.
- Updated `InversifyUwebSocketsHttpAdapter` body parse flow to properly parse url encoded and plain bodies.
- Updated dependencies
  - @inversifyjs/http-core@4.2.0

## 4.1.0

### Minor Changes

- Added `InversifyUwebSocketsHttpAdapter`
- Added `UwebSocketsHttpAdapterOptions`
- Added `UwebSocketsErrorFilter`
- Added `UwebSocketsGuard`
- Added `UwebSocketsInterceptor`
- Added `UwebSocketsMiddleware`

### Patch Changes

- Updated dependencies
  - @inversifyjs/http-core@4.1.0
