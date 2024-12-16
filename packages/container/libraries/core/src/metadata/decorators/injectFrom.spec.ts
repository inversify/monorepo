import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';

jest.mock('@inversifyjs/reflect-metadata-utils');

import { Newable } from '@inversifyjs/common';
import { updateReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

jest.mock('../calculations/getClassMetadata');

import { classMetadataReflectKey } from '../../reflectMetadata/data/classMetadataReflectKey';
import { getClassMetadata } from '../calculations/getClassMetadata';
import { getDefaultClassMetadata } from '../calculations/getDefaultClassMetadata';
import { ClassMetadataFixtures } from '../fixtures/ClassMetadataFixtures';
import { InjectFromOptions } from '../models/InjectFromOptions';
import { injectFrom } from './injectFrom';

describe(injectFrom.name, () => {
  describe('when called, and getClassMetadata() returns metadata', () => {
    let optionsFixture: InjectFromOptions;
    let typeFixture: Newable;

    beforeAll(() => {
      optionsFixture = {
        type: class {},
      };

      (
        getClassMetadata as jest.Mock<typeof getClassMetadata>
      ).mockReturnValueOnce(ClassMetadataFixtures.any);

      typeFixture = class {};

      injectFrom(optionsFixture)(typeFixture);
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should call getClassMetadata()', () => {
      expect(getClassMetadata).toHaveBeenCalledTimes(1);
      expect(getClassMetadata).toHaveBeenCalledWith(optionsFixture.type);
    });

    it('should call updateReflectMetadata()', () => {
      expect(updateReflectMetadata).toHaveBeenCalledTimes(1);
      expect(updateReflectMetadata).toHaveBeenCalledWith(
        typeFixture,
        classMetadataReflectKey,
        getDefaultClassMetadata,
        expect.any(Function),
      );
    });
  });
});