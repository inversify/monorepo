import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { serviceMetadataReflectKey } from '../../reflectMetadata/data/serviceMetadataReflectKey.js';
import { type ServiceMetadata } from '../models/ServiceMetadata.js';
import { getServiceMetadataList } from './getServiceMetadataList.js';

describe(getServiceMetadataList, () => {
  describe('when called', () => {
    let serviceMetadataListFixture: ServiceMetadata[];
    let result: unknown;

    beforeAll(() => {
      serviceMetadataListFixture = [
        {
          definition: {},
          serviceIdentifier: Symbol('hero-service'),
          target: class HeroService {},
        },
      ];

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(serviceMetadataListFixture);

      result = getServiceMetadataList();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        Reflect,
        serviceMetadataReflectKey,
      );
    });

    it('should return the service metadata list', () => {
      expect(result).toBe(serviceMetadataListFixture);
    });
  });
});
