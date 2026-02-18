import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import { type Newable } from '@inversifyjs/common';
import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

vitest.mock(import('../calculations/getClassMetadata.js'));

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey.js';
import { getClassMetadata } from '../calculations/getClassMetadata.js';
import { getDefaultClassMetadata } from '../calculations/getDefaultClassMetadata.js';
import { ClassMetadataFixtures } from '../fixtures/ClassMetadataFixtures.js';
import { type InjectFromOptions } from '../models/InjectFromOptions.js';
import { injectFrom } from './injectFrom.js';

describe(injectFrom, () => {
  describe('when called, and getClassMetadata() returns metadata', () => {
    let optionsFixture: InjectFromOptions;
    let typeFixture: Newable;

    beforeAll(() => {
      optionsFixture = {
        type: class {},
      };

      vitest
        .mocked(getClassMetadata)
        .mockReturnValueOnce(ClassMetadataFixtures.any);

      typeFixture = class {};

      injectFrom(optionsFixture)(typeFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getClassMetadata()', () => {
      expect(getClassMetadata).toHaveBeenCalledExactlyOnceWith(
        optionsFixture.type,
      );
    });

    it('should call updateOwnReflectMetadata()', () => {
      expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        typeFixture,
        classMetadataReflectKey,
        getDefaultClassMetadata,
        expect.any(Function),
      );
    });
  });
});
