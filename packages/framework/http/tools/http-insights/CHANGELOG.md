# @inversifyjs/http-insights

## 0.6.0

### Minor Changes

- Updated call lifecycle elements with service plans

### Patch Changes

- Updated dependencies
  - @inversifyjs/http-instrumentation-core@5.10.0
  - @inversifyjs/http-insights-ui@0.5.0
  - @inversifyjs/http-core@5.10.0
  - @inversifyjs/http-validation@5.10.0
  - @inversifyjs/standard-schema-validation@3.6.12

## 0.5.1

### Patch Changes

- Updated dependencies
  - @inversifyjs/http-core@5.9.3
  - @inversifyjs/http-validation@5.9.3
  - @inversifyjs/standard-schema-validation@3.6.11
  - @inversifyjs/http-instrumentation-core@5.9.3

## 0.5.0

### Minor Changes

- Added optional URL pattern options to `HttpInsightsProvider`. Calls that do not match the pattern are not stored. The default pattern keeps every call except `.inversify` endpoints.

## 0.4.1

### Patch Changes

- Parity version.
- Updated dependencies
  - @inversifyjs/http-core@5.9.2
  - @inversifyjs/http-insights-ui@0.4.1
  - @inversifyjs/http-instrumentation-core@5.9.2
  - @inversifyjs/http-validation@5.9.2
  - @inversifyjs/standard-schema-validation@3.6.10
  - inversify@8.2.4

## 0.4.0

### Minor Changes

- Error location sourcemaps are now followed.

### Patch Changes

- Updated dependencies
  - @inversifyjs/http-insights-ui@0.4.0

## 0.3.0

### Minor Changes

- Updated insights with better error traces.

### Patch Changes

- Updated dependencies
  - @inversifyjs/http-insights-ui@0.3.0

## 0.2.0

### Minor Changes

- Added `HttpInsightsProvider`.

### Patch Changes

- Updated dependencies
  - @inversifyjs/http-instrumentation-core@5.9.1
  - @inversifyjs/http-core@5.9.1
  - @inversifyjs/http-insights-ui@0.2.0
  - @inversifyjs/http-validation@5.9.1
  - @inversifyjs/standard-schema-validation@3.6.9
