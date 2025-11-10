import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildHonoServer } from '../../server/adapter/hono/actions/buildHonoServer';
import { Server } from '../../server/models/Server';
import {
  BodyMultipartHonoController,
  UploadResult,
} from './decoratorApiBodyMultipartHono';

describe('Decorator API (Body Multipart Hono)', () => {
  let server: Server;

  beforeAll(async () => {
    const container: Container = new Container();
    container.bind(BodyMultipartHonoController).toSelf().inSingletonScope();

    server = await buildHonoServer(container);
  });

  afterAll(async () => {
    await server.shutdown();
  });

  it('should parse multipart/form-data body', async () => {
    const formData: FormData = new FormData();
    formData.append('username', 'john');
    formData.append('file', new Blob(['test content']), 'test.txt');

    const response: Response = await fetch(
      `http://${server.host}:${server.port.toString()}/uploads`,
      {
        body: formData,
        method: 'POST',
      },
    );
    const responseBody: UploadResult = (await response.json()) as UploadResult;

    expect(responseBody.username).toBe('john');
    expect(responseBody.fileName).toBe('test.txt');
  });
});
