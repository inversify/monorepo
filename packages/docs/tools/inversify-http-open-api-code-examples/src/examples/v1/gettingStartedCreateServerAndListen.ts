// Shift-line-spaces-2
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import { SwaggerUiProvider } from '@inversifyjs/http-open-api';
import express from 'express';
import { Container } from 'inversify';

void (async () => {
  // Begin-example
  const container: Container = new Container();

  const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(
    container,
  );

  const swaggerProvider: SwaggerUiProvider = new SwaggerUiProvider({
    api: {
      openApiObject: {
        info: {
          title: 'My awesome API',
          version: '1.0.0',
        },
        openapi: '3.1.1',
      },
      path: '/docs',
    },
    ui: {
      title: 'My awesome API docs',
    },
  });

  swaggerProvider.provide(container);

  const application: express.Application = await adapter.build();

  application.listen(3000);
  // End-example
})();
