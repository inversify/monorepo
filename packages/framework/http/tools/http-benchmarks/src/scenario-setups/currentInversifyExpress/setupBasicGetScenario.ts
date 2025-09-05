import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import { Application } from 'express';
import { Container } from 'inversify';

import { DEFAULT_PORT } from '../../constant/defaultPort';
import { AppController } from '../../scenario/currentInversify/AppController';

async function setUp(): Promise<void> {
  const container: Container = new Container({ defaultScope: 'Singleton' });

  container.bind(AppController).toSelf();

  const server: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(
    container,
    {
      logger: false,
    },
  );

  const app: Application = await server.build();

  app.listen(DEFAULT_PORT);
}

void setUp();
