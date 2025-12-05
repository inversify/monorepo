// Shift-line-spaces-2
/* eslint-disable @typescript-eslint/no-magic-numbers */

import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express-v4';
import express from 'express4';
import { Container } from 'inversify';

export async function adapterBasicUsageExpress4(): Promise<void> {
  // Begin-example
  // Create your container and bind controllers
  const container: Container = new Container();
  // ... bind your controllers, services, etc.

  // Create the adapter with options
  const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(
    container,
    {
      logger: true,
      useCookies: true,
      useJson: true,
      useUrlEncoded: true,
    },
  );

  // Build the Express 4 application
  const app: express.Application = await adapter.build();

  // Start the server
  app.listen(3000, () => {
    console.log('Server listening on port 3000');
  });
  // End-example
}
