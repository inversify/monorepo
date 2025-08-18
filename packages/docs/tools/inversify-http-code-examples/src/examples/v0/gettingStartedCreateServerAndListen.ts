// Shift-line-spaces-2
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import express from 'express';
import { Container } from 'inversify';

void (async () => {
  // Begin-example
  const container: Container = new Container();

  const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(
    container,
  );

  const application: express.Application = await adapter.build();

  application.listen(3000);
  // End-example
})();
