import { serve } from '@hono/node-server';
import { InversifyHonoHttpAdapter } from '@inversifyjs/http-hono';
import { Hono } from 'hono';
import { bindingScopeValues, Container } from 'inversify';

import { DEFAULT_PORT } from '../../constant/defaultPort';
import { AppController } from '../../scenario/currentInversify/AppController';

async function setUp(): Promise<void> {
  const container: Container = new Container({
    defaultScope: bindingScopeValues.Singleton,
  });

  container.bind(AppController).toSelf();

  const adapter: InversifyHonoHttpAdapter = new InversifyHonoHttpAdapter(
    container,
    {
      logger: false,
    },
  );

  const app: Hono = await adapter.build();

  serve({
    fetch: app.fetch,
    port: DEFAULT_PORT,
  });
}

void setUp();
