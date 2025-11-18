import { InversifyUwebSocketsHttpAdapter } from '@inversifyjs/http-uwebsockets';
import { bindingScopeValues, Container } from 'inversify';
import { TemplatedApp } from 'uWebSockets.js';

import { DEFAULT_PORT } from '../../constant/defaultPort';
import { AppController } from '../../scenario/currentInversify/AppController';

async function setUp(): Promise<void> {
  const container: Container = new Container({
    defaultScope: bindingScopeValues.Singleton,
  });

  container.bind(AppController).toSelf();

  const adapter: InversifyUwebSocketsHttpAdapter =
    new InversifyUwebSocketsHttpAdapter(container, {
      logger: false,
    });

  const app: TemplatedApp = await adapter.build();

  app.listen('0.0.0.0', DEFAULT_PORT, () => undefined);
}

void setUp();
