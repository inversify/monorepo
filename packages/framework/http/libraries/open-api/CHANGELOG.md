# @inversifyjs/http-open-api

## 4.0.0

### Patch Changes

- Updated dependencies
  - @inversifyjs/http-core@4.0.0

## 3.3.0

### Patch Changes

- Updated dependencies
  - @inversifyjs/http-core@3.3.0
  - inversify@7.10.4

## 3.2.0

### Patch Changes

- Updated dependencies
  - inversify@7.10.3
  - @inversifyjs/http-core@3.2.0

## 3.1.0

### Patch Changes

- Updated dependencies
  - @inversifyjs/http-core@3.1.0

## 3.0.1

### Patch Changes

- Updated dependencies
  - @inversifyjs/reflect-metadata-utils@1.4.1
  - @inversifyjs/http-core@3.0.1
  - inversify@7.10.2

## 3.0.0

### Major Changes

- 0112140: Removed library specific providers in favor of library specific package usage

  Instead of importing `SwaggerUiExpress4Provider`, import `SwaggerUiExpress4Provider` from `@inversifyjs/express-4-open-api`.
  Instead of importing `SwaggerUiExpressProvider`, import `SwaggerUiExpressProvider` from `@inversifyjs/express-open-api`.
  Instead of importing `SwaggerUiFastifyProvider`, import `SwaggerUiFastifyProvider` from `@inversifyjs/fastify-open-api`.
  Instead of importing `SwaggerUiHonoProvider`, import `SwaggerUiHonoProvider` from `@inversifyjs/hono-open-api`.

### Patch Changes

- @inversifyjs/http-core@3.0.0

## 2.0.0

### Minor Changes

- Added `SwaggerUiExpress4Provider`
- Added `SwaggerUiProviderOptions`
- Added `SwaggerUiHonoProvider`
- Added `SwaggerUiFastifyProvider`
- Added `SwaggerUiExpressProvider`
- Added `OasDeprecated` decorator
- Added `OasDescription` decorator
- Added `OasResponse` decorator
- Added `OasSchema` decorator
- Added `OasExternalDocs` decorator
- Added `ToSchemaFunction`
- Added `OasServer` decorator
- Added `OasSchemaOptionalProperty`
- Added `BuildOpenApiBlockFunction`
- Added `OasOperationId` decorator
- Added `OasParameter` decorator
- Added `OasSchemaProperty` decorator
- Added `OasSchemaDecoratorOptions`
- Added `OasRequestBody` decorator
- Added `OasSecurity` decorator
- Added `OasTag` decorator
- Added `OasSummary`

### Patch Changes

- Updated dependencies
  - @inversifyjs/http-core@2.0.0
