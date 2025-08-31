import { serve } from '@hono/node-server';
import { Context, Hono } from 'hono';

import { DEFAULT_PORT } from '../../constant/defaultPort';

async function setUp(): Promise<void> {
  const app: Hono = new Hono();

  app.get('/', (ctx: Context) => {
    return ctx.text('ok');
  });

  serve({
    fetch: app.fetch,
    port: DEFAULT_PORT,
  });
}

void setUp();
