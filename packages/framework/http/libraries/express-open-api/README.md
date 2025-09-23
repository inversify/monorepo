[![Test coverage](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Fexpress-open-api)](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Fexpress-open-api)
[![npm version](https://img.shields.io/github/package-json/v/inversify/monorepo?filename=packages%2Fframework%2Flibraries%2Fexpress-open-api%2Fpackage.json&style=plastic)](https://www.npmjs.com/package/@inversifyjs/express-open-api)

# @inversifyjs/express-open-api

InversifyJS HTTP Express OpenAPI integration package.

This package provides OpenAPI/Swagger UI integration for Express-based InversifyJS HTTP applications.

## Installation

```bash
npm install @inversifyjs/express-open-api @inversifyjs/http-open-api express
```

## Usage

```typescript
import { Container } from 'inversify';
import { SwaggerUiExpressProvider } from '@inversifyjs/express-open-api';

const container = new Container();

const swaggerUiProvider = new SwaggerUiExpressProvider({
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
- `express` (peer dependency)
- `inversify` (peer dependency)