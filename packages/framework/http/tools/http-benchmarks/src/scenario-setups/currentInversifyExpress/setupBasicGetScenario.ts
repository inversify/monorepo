import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import { Application } from 'express';
import { bindingScopeValues, Container } from 'inversify';

import { DEFAULT_PORT } from '../../constant/defaultPort';
import { AppController } from '../../scenario/currentInversify/AppController';

async function setUp(): Promise<void> {
  const container: Container = new Container({
    defaultScope: bindingScopeValues.Singleton,
  });

  container.bind(AppController).toSelf();

  const server: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(
    container,
    {
      logger: false,
      useCookies: false,
      useJson: false,
      useText: false,
      useUrlEncoded: false,
    },
  );

  const app: Application = await server.build();

  app.listen(DEFAULT_PORT);
}

void setUp();
