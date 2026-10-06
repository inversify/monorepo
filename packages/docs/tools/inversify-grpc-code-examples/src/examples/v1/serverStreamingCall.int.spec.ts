import { describe, expect, it } from 'vitest';

import { type sendUnaryData, type ServerWritableStream } from '@grpc/grpc-js';
import {
  Call,
  Callback,
  InversifyGrpcAdapterError,
  RPC,
  Service,
} from '@inversifyjs/grpc-core';
import { Container } from 'inversify';

import {
  connectHeroListClient,
  type HeroListClient,
  readHeroes,
  usingClient,
  withServer,
} from '../../testing/grpcTestServer.js';
import {
  heroListServiceDefinition,
  type HeroRequest,
  type HeroResponse,
} from './loadHeroServiceDefinition.js';
import { CallHeroListService } from './serverStreamingCall.js';

describe('serverStreamingCall', () => {
  it('should stream two hero names from the call', async () => {
    await withServer(
      (container: Container): void => {
        container.bind(CallHeroListService).toSelf();
      },
      async (address: string): Promise<void> => {
        await usingClient(
          connectHeroListClient(address),
          async (client: HeroListClient): Promise<void> => {
            const responses: HeroResponse[] = await readHeroes(
              client,
              'hero-1',
            );

            expect(responses).toStrictEqual([
              {
                name: 'hero-1-a',
              },
              {
                name: 'hero-1-b',
              },
            ]);
          },
        );
      },
    );
  });

  it('should reject @Callback() on a response stream', async () => {
    @Service(heroListServiceDefinition)
    class InvalidCallbackListService {
      @RPC('ListHeroes')
      public listHeroes(
        @Call() _call: ServerWritableStream<HeroRequest, HeroResponse>,
        @Callback() _callback: sendUnaryData<HeroResponse>,
      ): void {
        return undefined;
      }
    }

    await expect(
      withServer(
        (container: Container): void => {
          container.bind(InvalidCallbackListService).toSelf();
        },
        async (): Promise<void> => undefined,
      ),
    ).rejects.toBeInstanceOf(InversifyGrpcAdapterError);
  });
});
