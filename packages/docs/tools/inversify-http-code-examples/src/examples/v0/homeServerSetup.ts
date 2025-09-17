// Shift-line-spaces-2
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import express from 'express';
import { Container } from 'inversify';

export async function setupExpressServer(): Promise<void> {
  // Begin-example
  const container: Container = new Container();
  const app: express.Application = await new InversifyExpressHttpAdapter(
    container,
    {
      logger: true,
      useCookies: true,
    },
  ).build();

  app.listen();
  // End-example
}
