import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodHeaderMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodHeaderMetadataReflectKey';
import { exploreControllerMethodHeaderMetadataList } from './exploreControllerMethodHeaderMetadataList';

describe(exploreControllerMethodHeaderMetadataList.name, () => {
  describe('when called', () => {
    let controllerFixture: NewableFunction;
    let controllerMethodKeyFixture: string | symbol;
    let headerListFixture: [string, string][];
    let headerMetadataFixture: Map<string, string>;
    let result: unknown;

    beforeAll(() => {
      controllerFixture = class Test {};
      controllerMethodKeyFixture = 'testMethod';
      headerListFixture = [['key-example', 'value-example']];
      headerMetadataFixture = new Map<string, string>(headerListFixture);

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValue(headerMetadataFixture);

      result = exploreControllerMethodHeaderMetadataList(
        controllerFixture,
        controllerMethodKeyFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledTimes(1);
      expect(getOwnReflectMetadata).toHaveBeenCalledWith(
        controllerFixture,
        controllerMethodHeaderMetadataReflectKey,
        controllerMethodKeyFixture,
      );
    });

    it('should return a [string, string]', () => {
      expect(result).toStrictEqual(headerListFixture);
    });
  });
});
