// Shift-line-spaces-2
import { serve } from '@hono/node-server';
import { InversifyHonoHttpAdapter } from '@inversifyjs/http-hono';
import { Hono } from 'hono';
import { Container } from 'inversify';

export async function adapterBasicUsageHono(): Promise<void> {
  // Begin-example
  // Create your container and bind controllers
  const container: Container = new Container();
  // ... bind your controllers, services, etc.

  // Create the adapter with options
  const adapter: InversifyHonoHttpAdapter = new InversifyHonoHttpAdapter(
    container,
    {
      logger: true,
    },
  );

  // Build the Hono application
  const app: Hono = await adapter.build();

  // Start the server (Node.js runtime)
  serve({
    fetch: app.fetch,
    port: 3000,
  });

  console.log('Server listening on port 3000');
  // End-example
}
