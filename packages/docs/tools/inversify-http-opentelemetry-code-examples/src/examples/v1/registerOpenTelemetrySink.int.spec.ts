import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { trace } from '@opentelemetry/api';
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  type ReadableSpan,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { type Hono } from 'hono';
import { Container } from 'inversify';

import { buildApplication } from './registerOpenTelemetrySink.js';

describe('registerOpenTelemetrySink', () => {
  let application: Hono;
  let exporter: InMemorySpanExporter;
  let provider: BasicTracerProvider;

  beforeAll(async () => {
    exporter = new InMemorySpanExporter();
    provider = new BasicTracerProvider({
      spanProcessors: [new SimpleSpanProcessor(exporter)],
    });
    trace.setGlobalTracerProvider(provider);

    application = await buildApplication(new Container());
  });

  afterAll(async () => {
    await provider.shutdown();
  });

  describe('when a request is served', () => {
    let response: Response;

    beforeAll(async () => {
      response = await application.request('/items');
    });

    it('should serve the controller', async () => {
      expect(response.status).toBe(200);
      await expect(response.text()).resolves.toBe('hero');
    });

    it('should record the server span and the controller span', () => {
      const finishedSpans: readonly ReadableSpan[] =
        exporter.getFinishedSpans();
      const serverSpan: ReadableSpan | undefined = finishedSpans.find(
        (span: ReadableSpan): boolean => span.name === 'HTTP GET',
      );
      const controllerSpan: ReadableSpan | undefined = finishedSpans.find(
        (span: ReadableSpan): boolean => span.name === 'ItemsController.get',
      );

      expect(serverSpan).toBeDefined();
      expect(controllerSpan).toBeDefined();
      expect(serverSpan?.attributes['http.response.status_code']).toBe(200);
      expect(serverSpan?.attributes['url.path']).toBe('/items');
      expect(controllerSpan?.parentSpanContext?.spanId).toBe(
        serverSpan?.spanContext().spanId,
      );
    });
  });
});
