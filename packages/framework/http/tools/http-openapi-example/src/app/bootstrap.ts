import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import { SwaggerUiProvider } from '@inversifyjs/http-open-api';
import express from 'express';
import { Container } from 'inversify';

import { LmdbContainerModule } from '../foundation/db/adapter/inversify/LmdbContainerModule';
import { UserContainerModule } from '../user/adapter/inversify/UserContainerModule';
import { UserLmdbContainerModule } from '../user/adapter/inversify/UserLmdbContainerModule';

const PORT: number = 3000;

export async function bootstrap(): Promise<void> {
  const container: Container = new Container();

  await container.load(
    new LmdbContainerModule(),
    new UserContainerModule(),
    new UserLmdbContainerModule(),
  );

  const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(
    container,
    {
      logger: true,
      useCookies: false,
      useJson: true,
    },
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

  const expressApplication: express.Application = await adapter.build();

  expressApplication.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT.toString()}`);
  });
}
