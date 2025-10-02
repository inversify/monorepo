import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { Newable } from '@inversifyjs/common';
import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

vitest.mock('../calculations/getClassMetadata');

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey';
import { getClassMetadata } from '../calculations/getClassMetadata';
import { getDefaultClassMetadata } from '../calculations/getDefaultClassMetadata';
import { ClassMetadataFixtures } from '../fixtures/ClassMetadataFixtures';
import { InjectFromOptions } from '../models/InjectFromOptions';
import { injectFrom } from './injectFrom';

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
