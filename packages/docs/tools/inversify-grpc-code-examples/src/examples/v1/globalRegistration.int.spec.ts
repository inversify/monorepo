import { describe, expect, it } from 'vitest';

import { Metadata, type ServiceError, status } from '@grpc/grpc-js';
import { type InversifyGrpcJsAdapter } from '@inversifyjs/grpc-js';
import { type Container } from 'inversify';

import {
  captureServiceError,
  connectHeroClient,
  getHero,
  type HeroClient,
  usingClient,
  withServer,
} from '../../testing/grpcTestServer.js';
import { HeroNotFoundErrorFilter } from './errorFilter.js';
import { GlobalHeroService } from './globalHeroService.js';
import { registerGlobalHandlers } from './globalRegistration.js';
import { HeroIdGuard } from './guard.js';
import { SuffixInterceptor } from './interceptor.js';
import { type HeroResponse } from './loadHeroServiceDefinition.js';
import { AuthorizationMiddleware } from './middleware.js';
import { PrefixPipe, UppercasePipe } from './pipe.js';

describe('globalRegistration', () => {
  it('should apply middleware, guards, pipes, filters, and interceptors', async () => {
    await withServer(
      (container: Container, adapter: InversifyGrpcJsAdapter): void => {
        container.bind(AuthorizationMiddleware).toSelf();
        container.bind(GlobalHeroService).toSelf();
        container.bind(HeroIdGuard).toSelf();
        container.bind(HeroNotFoundErrorFilter).toSelf();
        container.bind(PrefixPipe).toSelf();
        container.bind(SuffixInterceptor).toSelf();
        container.bind(UppercasePipe).toSelf();
        registerGlobalHandlers(adapter);
      },
      async (address: string): Promise<void> => {
        await usingClient(
          connectHeroClient(address),
          async (client: HeroClient): Promise<void> => {
            const metadata: Metadata = new Metadata();

            metadata.set('authorization', 'Bearer token');

            const unauthorized: ServiceError = await captureServiceError(
              async (): Promise<void> => {
                await getHero(client, 'abc');
              },
            );

            expect(unauthorized.code).toBe(status.UNAUTHENTICATED);

            const forbidden: ServiceError = await captureServiceError(
              async (): Promise<void> => {
                await getHero(client, 'forbidden', metadata);
              },
            );

            expect(forbidden.code).toBe(status.PERMISSION_DENIED);

            const missing: ServiceError = await captureServiceError(
              async (): Promise<void> => {
                await getHero(client, 'missing', metadata);
              },
            );

            expect(missing.code).toBe(status.NOT_FOUND);

            const response: HeroResponse = await getHero(
              client,
              'abc',
              metadata,
            );

            expect(response).toStrictEqual({
              name: 'hero:ABC!',
            });
          },
        );
      },
    );
  });
});
