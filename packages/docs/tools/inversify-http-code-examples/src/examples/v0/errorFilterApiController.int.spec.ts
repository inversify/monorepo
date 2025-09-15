import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildExpressServer } from '../../server/adapter/express/actions/buildExpressServer';
import { Server } from '../../server/models/Server';
import { ProductController } from './errorFilterApiController';
import { InvalidOperationErrorFilter } from './errorFilterApiInvalidOperationErrorFilter';

describe('Error Filter API (Express 5)', () => {
  let server: Server;

  beforeAll(async () => {
    const container: Container = new Container();
    container.bind(InvalidOperationErrorFilter).toSelf().inSingletonScope();
    container.bind(ProductController).toSelf().inSingletonScope();

    server = await buildExpressServer(container);
  });

  afterAll(async () => {
    await server.shutdown();
  });

  it('should catch InvalidOperationError and return 422 Unprocessable Entity', async () => {
    const response: Response = await fetch(
      `http://${server.host}:${server.port.toString()}/products/123/validate`,
    );
    const body: string = await response.text();
    const jsonBody: {
      statusCode: number;
      error: string;
      message: string;
    } = JSON.parse(body);

    expect(response.status).toBe(422);
    expect(jsonBody.statusCode).toBe(422);
    expect(jsonBody.error).toBe('Unprocessable Entity');
    expect(jsonBody.message).toBe(
      '[InvalidOperationError]: Product validation failed',
    );
  });
});
