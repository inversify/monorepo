[![Test coverage](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Fhono-open-api)](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Fhono-open-api)
[![npm version](https://img.shields.io/github/package-json/v/inversify/monorepo?filename=packages%2Fframework%2Fhttp%2Flibraries%2Fhono-open-api%2Fpackage.json&style=plastic)](https://www.npmjs.com/package/@inversifyjs/hono-open-api)

# @inversifyjs/hono-open-api

InversifyJS HTTP Hono OpenAPI integration package.

This package provides OpenAPI/Swagger UI integration for Hono-based InversifyJS HTTP applications.

## Installation

```bash
npm install @inversifyjs/hono-open-api @inversifyjs/http-open-api hono
```

## Usage

```typescript
import { Container } from 'inversify';
import { SwaggerUiHonoProvider } from '@inversifyjs/hono-open-api';

const container = new Container();

const swaggerUiProvider = new SwaggerUiHonoProvider({
  api: {
    path: '/docs',
    openApiObject: {
      openapi: '3.1.0',
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      paths: {},
    },
  },
  ui: {
    title: 'My API Documentation',
  },
});

swaggerUiProvider.provide(container);
```

## Requirements

- `@inversifyjs/http-open-api` (peer dependency)
- `hono` (peer dependency)
- `inversify` (peer dependency)
