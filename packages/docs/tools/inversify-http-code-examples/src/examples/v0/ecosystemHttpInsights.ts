import { Controller, Get } from '@inversifyjs/http-core';
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import { HttpInsightsProvider } from '@inversifyjs/http-insights';
import type express from 'express';
import { Container } from 'inversify';

@Controller('/ping')
export class PingController {
  @Get()
  public get(): string {
    return 'pong';
  }
}

export async function bootstrap(): Promise<express.Application> {
  const container: Container = new Container();

  container.bind(PingController).toSelf().inSingletonScope();

  const insightsProvider: HttpInsightsProvider = new HttpInsightsProvider();

  await insightsProvider.provide(container);

  const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(
    container,
    {
      instrumentation: [insightsProvider.getEventSink()],
    },
  );

  return adapter.build();
}
