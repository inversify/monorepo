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
import {
  AuthenticatedHeroService,
  AuthenticationGuard,
  GuardedHeroService,
  HeroIdGuard,
} from './guard.js';
import { type HeroResponse } from './loadHeroServiceDefinition.js';

describe('guard', () => {
  it('should allow a hero id and deny a forbidden id', async () => {
    await withServer(
      (container: Container): void => {
        container.bind(HeroIdGuard).toSelf();
        container.bind(GuardedHeroService).toSelf();
      },
      async (address: string): Promise<void> => {
        await usingClient(
          connectHeroClient(address),
          async (client: HeroClient): Promise<void> => {
            const response: HeroResponse = await getHero(client, 'hero-1');

            expect(response).toStrictEqual({
              name: 'hero-1',
            });

            const denied: ServiceError = await captureServiceError(
              async (): Promise<void> => {
                await getHero(client, 'forbidden');
              },
            );

            expect(denied.code).toBe(status.PERMISSION_DENIED);
            expect(denied.details).toBe('Permission Denied');
          },
        );
      },
    );
  });

  it('should send UNAUTHENTICATED when the guard throws', async () => {
    await withServer(
      (container: Container): void => {
        container.bind(AuthenticationGuard).toSelf();
        container.bind(AuthenticatedHeroService).toSelf();
      },
      async (address: string): Promise<void> => {
        await usingClient(
          connectHeroClient(address),
          async (client: HeroClient): Promise<void> => {
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

            const rejected: ServiceError = await captureServiceError(
              async (): Promise<void> => {
                await getHero(client, 'hero-1');
              },
            );

            expect(rejected.code).toBe(status.UNAUTHENTICATED);
          },
        );
      },
    );
  });
});
