import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));
vitest.mock(import('../calculations/buildErrorDiscriminatorMetadata.js'));

import {
  buildEmptyArrayMetadata,
  updateReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { errorDiscriminatorMetadataReflectKey } from '../../reflectMetadata/data/errorDiscriminatorMetadataReflectKey.js';
import { buildErrorDiscriminatorMetadata } from '../calculations/buildErrorDiscriminatorMetadata.js';
import { Discriminated } from './Discriminated.js';

describe(Discriminated, () => {
  describe('having a class target', () => {
    let discriminatorFixture: string;
    let targetFixture: NewableFunction;
    let callbackFixture: (arr: (string | symbol)[]) => (string | symbol)[];

    describe('when called', () => {
      beforeAll(() => {
        discriminatorFixture = 'my-error-discriminator';
        targetFixture = class TestError extends Error {};
        callbackFixture = (arr: (string | symbol)[]) => arr;

        vitest
          .mocked(buildErrorDiscriminatorMetadata)
          .mockReturnValueOnce(callbackFixture);

        Discriminated(discriminatorFixture)(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildErrorDiscriminatorMetadata', () => {
        expect(buildErrorDiscriminatorMetadata).toHaveBeenCalledExactlyOnceWith(
          discriminatorFixture,
        );
      });

      it('should call updateReflectMetadata', () => {
        expect(updateReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          errorDiscriminatorMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
        );
      });
    });
  });
});
