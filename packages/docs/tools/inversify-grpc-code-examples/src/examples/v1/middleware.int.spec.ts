import { describe, expect, it } from 'vitest';

import { Metadata, type ServiceError, status } from '@grpc/grpc-js';
import { type Container } from 'inversify';

import {
  captureServiceError,
  connectHeroClient,
  getHero,
  type HeroClient,
  usingClient,
  withServer,
} from '../../testing/grpcTestServer.js';
import { type HeroResponse } from './loadHeroServiceDefinition.js';
import {
  AuditMiddleware,
  AuthorizationMiddleware,
  MiddlewareHeroService,
} from './middleware.js';

describe('middleware', () => {
  it('should reject a call without authorization and audit an allowed call', async () => {
    await withServer(
      (container: Container): void => {
        container.bind(AuditMiddleware).toSelf();
        container.bind(AuthorizationMiddleware).toSelf();
        container.bind(MiddlewareHeroService).toSelf();
      },
      async (address: string, container: Container): Promise<void> => {
        await usingClient(
          connectHeroClient(address),
          async (client: HeroClient): Promise<void> => {
            const rejected: ServiceError = await captureServiceError(
              async (): Promise<void> => {
                await getHero(client, 'hero-1');
              },
            );

            expect(rejected.code).toBe(status.UNAUTHENTICATED);

            const metadata: Metadata = new Metadata();

            metadata.set('authorization', 'Bearer token');

            const response: HeroResponse = await getHero(
              client,
              'hero-1',
              metadata,
            );

            expect(response).toStrictEqual({
              name: 'hero-1',
            });
          },
        );

        const audit: AuditMiddleware =
          await container.getAsync(AuditMiddleware);

        expect(audit.ids).toStrictEqual(['hero-1']);
      },
    );
  });
});
