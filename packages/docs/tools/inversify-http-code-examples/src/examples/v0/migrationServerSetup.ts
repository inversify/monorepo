// Shift-line-spaces-2
/* eslint-disable @typescript-eslint/no-magic-numbers */

import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import type express from 'express';
import { Container } from 'inversify';

import { FooController } from './migrationServerSetupFooController.js';
import { FooService } from './migrationServerSetupFooService.js';

export async function migrationServerSetup(): Promise<void> {
  // Begin-example
  const container: Container = new Container();

  // Bind services
  container.bind('FooService').to(FooService);

  // Bind controllers
  container.bind(FooController).toSelf();

  // Create the adapter with options
  const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(
    container,
    {
      logger: true,
      useJson: true,
      useUrlEncoded: true,
    },
  );

  // Build the Express application
  const app: express.Application = await adapter.build();

  // Start the server
  app.listen(3000, () => {
    console.log('Server listening on port 3000');
  });
  // End-example
}
