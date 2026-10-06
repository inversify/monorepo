import { describe, expect, it } from 'vitest';

import { type ServiceError, status } from '@grpc/grpc-js';
import { RPC, Service } from '@inversifyjs/grpc-core';
import { Container } from 'inversify';

import {
  captureServiceError,
  connectHeroClient,
  getHero,
  type HeroClient,
  usingClient,
  withServer,
} from '../../testing/grpcTestServer.js';
import { NotFoundHeroService } from './grpcError.js';
import {
  type HeroRequest,
  type HeroResponse,
  heroServiceDefinition,
} from './loadHeroServiceDefinition.js';

describe('grpcError', () => {
  it('should send NOT_FOUND when a handler throws NotFoundGrpcError', async () => {
    await withServer(
      (container: Container): void => {
        container.bind(NotFoundHeroService).toSelf();
      },
      async (address: string): Promise<void> => {
        await usingClient(
          connectHeroClient(address),
          async (client: HeroClient): Promise<void> => {
            const response: HeroResponse = await getHero(client, 'hero-1');

            expect(response).toStrictEqual({
              name: 'hero-1',
            });

            const missing: ServiceError = await captureServiceError(
              async (): Promise<void> => {
                await getHero(client, 'missing');
              },
            );

            expect(missing.code).toBe(status.NOT_FOUND);
            expect(missing.details).toBe('Hero missing was not found');
          },
        );
      },
    );
  });

  it('should send UNKNOWN for an error that is not a GrpcError', async () => {
    @Service(heroServiceDefinition)
    class UnexpectedHeroService {
      @RPC('GetHero')
      public getHero(_call: { request: HeroRequest }): HeroResponse {
        throw new Error('boom');
      }
    }

    await withServer(
      (container: Container): void => {
        container.bind(UnexpectedHeroService).toSelf();
      },
      async (address: string): Promise<void> => {
        await usingClient(
          connectHeroClient(address),
          async (client: HeroClient): Promise<void> => {
            const unexpected: ServiceError = await captureServiceError(
              async (): Promise<void> => {
                await getHero(client, 'hero-1');
              },
            );

            expect(unexpected.code).toBe(status.UNKNOWN);
            expect(unexpected.details).toBe('Unknown');
          },
        );
      },
    );
  });
});
