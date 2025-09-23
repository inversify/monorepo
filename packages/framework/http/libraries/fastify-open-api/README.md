[![Test coverage](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Ffastify-open-api)](https://codecov.io/gh/inversify/monorepo/branch/main/graph/badge.svg?flag=%40inversifyjs%2Ffastify-open-api)
[![npm version](https://img.shields.io/github/package-json/v/inversify/monorepo?filename=packages%2Fframework%2Flibraries%2Ffastify-open-api%2Fpackage.json&style=plastic)](https://www.npmjs.com/package/@inversifyjs/fastify-open-api)

# @inversifyjs/fastify-open-api

InversifyJS HTTP Fastify OpenAPI integration package.

This package provides OpenAPI/Swagger UI integration for Fastify-based InversifyJS HTTP applications.

## Installation

```bash
npm install @inversifyjs/fastify-open-api @inversifyjs/http-open-api fastify
```

## Usage

```typescript
import { Container } from 'inversify';
import { SwaggerUiFastifyProvider } from '@inversifyjs/fastify-open-api';

const container = new Container();

const swaggerUiProvider = new SwaggerUiFastifyProvider({
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
- `fastify` (peer dependency)
- `inversify` (peer dependency)