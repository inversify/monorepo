// Begin-example
import { Controller, Get } from '@inversifyjs/http-core';
import { InversifyHonoHttpAdapter } from '@inversifyjs/http-hono';
import { createHttpOpenTelemetrySink } from '@inversifyjs/http-opentelemetry';
// Exclude-from-example
import { type Hono } from 'hono';
import { Container } from 'inversify';

@Controller('/items')
export class ItemsController {
  @Get()
  public get(): string {
    return 'hero';
  }
}

export function createInstrumentedAdapter(
  container: Container,
): InversifyHonoHttpAdapter {
  container.bind(ItemsController).toSelf().inSingletonScope();

  return new InversifyHonoHttpAdapter(container, {
    instrumentation: [createHttpOpenTelemetrySink()],
    logger: false,
  });
}
// End-example

export async function buildApplication(container: Container): Promise<Hono> {
  return createInstrumentedAdapter(container).build();
}
