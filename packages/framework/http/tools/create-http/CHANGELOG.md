# @inversifyjs/create-http

## 0.5.0

### Minor Changes

Version the scaffolded todo and status APIs under `/v1`, use camelCase domain timestamps, return versioned API models via `Builder` mappings, and nest adapter files under role folders (`adapters`, `builders`, `containerModules`).

## 0.4.1

### Patch Changes

Include the scaffold `.gitignore` in the published package by shipping it as `.gitignore.template`, and stop packing compiled tests and fixtures.

## 0.4.0

### Minor Changes

- Scaffolded apps bind a `ConsoleLogger` factory whose log levels come from `LOG_LEVELS`.
- Replaced `HttpAdapter`, `DbAdapter`, and `PackageManager` string unions with enums.
- Updated Yarn scaffolds to pin Yarn Berry via Corepack (`packageManager`) and a Renovate-tracked berry version catalog.

### Patch Changes

- Limited uWebSockets `@CaptureRequestValues` to POST and PATCH todo endpoints that read the request body.
- Added `@SetHeader('Content-Type', 'application/json')` on uWebSockets JSON todo endpoints.
- Updated uWebsockets.js integration with missing captured values

## 0.3.0

### Minor Changes

- Updated `createHttpApp` with db config.

### Patch Changes

- Updated `createHttpApp` to rely on config package.

## 0.2.0

### Minor Changes

- Added `create-inversify-http` bin.
