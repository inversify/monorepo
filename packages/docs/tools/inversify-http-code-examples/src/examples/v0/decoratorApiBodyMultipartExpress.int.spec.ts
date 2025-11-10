import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildExpressServerWithMulter } from '../../server/adapter/express/actions/buildExpressServerWithMulter';
import { buildExpress4ServerWithMulter } from '../../server/adapter/express4/actions/buildExpress4ServerWithMulter';
import { Server } from '../../server/models/Server';
import {
  MultipartExpressController,
  MultipartResult,
} from './decoratorApiBodyMultipartExpress';

describe.each<[(container: Container) => Promise<Server>]>([
  [buildExpress4ServerWithMulter],
  [buildExpressServerWithMulter],
])(
  'Decorator API (Body Multipart Express)',
  (buildServer: (container: Container) => Promise<Server>) => {
    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();
      container.bind(MultipartExpressController).toSelf().inSingletonScope();

      server = await buildServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    it('should handle multipart/form-data with Express adapters', async () => {
      const formData: FormData = new FormData();
      formData.append('username', 'alice');
      formData.append(
        'avatar',
        new Blob(['fake-image-data'], { type: 'image/png' }),
        'avatar.png',
      );

      const response: Response = await fetch(
        `http://${server.host}:${server.port.toString()}/users`,
        {
          body: formData,
          method: 'POST',
        },
      );

      expect(response.status).toBe(200);

      const data: MultipartResult = (await response.json()) as MultipartResult;

      expect(data.username).toBe('alice');
      expect(data.fileCount).toBe(1); // Only the file, text fields go to body
    });
  },
);
