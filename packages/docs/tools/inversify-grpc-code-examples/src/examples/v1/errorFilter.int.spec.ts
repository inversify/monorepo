import { describe, expect, it } from 'vitest';

import { type ServiceError, status } from '@grpc/grpc-js';
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
import {
  FilteredHeroService,
  HeroNotFoundErrorFilter,
  UnfilteredHeroService,
} from './errorFilter.js';

async function captureNotFound(address: string): Promise<ServiceError> {
  return captureServiceError(async (): Promise<void> => {
    await usingClient(
      connectHeroClient(address),
      async (client: HeroClient): Promise<void> => {
        await getHero(client, 'missing');
      },
    );
  });
}

describe('errorFilter', () => {
  it('should translate a service error with @UseErrorFilter()', async () => {
    await withServer(
      (container: Container): void => {
        container.bind(FilteredHeroService).toSelf();
        container.bind(HeroNotFoundErrorFilter).toSelf();
      },
      async (address: string): Promise<void> => {
        const error: ServiceError = await captureNotFound(address);

        expect(error.code).toBe(status.NOT_FOUND);
        expect(error.details).toBe('Hero missing was not found');
      },
    );
  });

  it('should translate a service error with a global filter', async () => {
    await withServer(
      (container: Container, adapter: InversifyGrpcJsAdapter): void => {
        container.bind(HeroNotFoundErrorFilter).toSelf();
        container.bind(UnfilteredHeroService).toSelf();
        adapter.useGlobalFilters(HeroNotFoundErrorFilter);
      },
      async (address: string): Promise<void> => {
        const error: ServiceError = await captureNotFound(address);

        expect(error.code).toBe(status.NOT_FOUND);
        expect(error.details).toBe('Hero missing was not found');
      },
    );
  });
});
