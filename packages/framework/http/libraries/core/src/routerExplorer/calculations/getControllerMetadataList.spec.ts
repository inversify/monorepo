import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMetadataReflectKey } from '../../reflectMetadata/data/controllerMetadataReflectKey';
import { ControllerMetadata } from '../model/ControllerMetadata';
import { getControllerMetadataList } from './getControllerMetadataList';

describe(getControllerMetadataList, () => {
  describe('when called, and no metadata exists', () => {
    let controllerMetadataFixture: undefined;
    let result: unknown;

    beforeAll(() => {
      controllerMetadataFixture = undefined;

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(controllerMetadataFixture);

      result = getControllerMetadataList();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        Reflect,
        controllerMetadataReflectKey,
      );
    });

    it('should return undefined', () => {
      expect(result).toBe(controllerMetadataFixture);
    });
  });

  describe('when called, and metadata exists with different priorities', () => {
    let lowControllerClass: NewableFunction;
    let highControllerClass: NewableFunction;
    let defaultControllerClass: NewableFunction;
    let mediumControllerClass: NewableFunction;
    let controllerMetadataListFixture: ControllerMetadata[];
    let result: unknown;

    beforeAll(() => {
      lowControllerClass = class LowController {};
      highControllerClass = class HighController {};
      defaultControllerClass = class DefaultController {};
      mediumControllerClass = class MediumController {};

      controllerMetadataListFixture = [
        {
          path: '/low',
          priority: -100,
          serviceIdentifier: lowControllerClass,
          target: lowControllerClass,
        },
        {
          path: '/high',
          priority: 100,
          serviceIdentifier: highControllerClass,
          target: highControllerClass,
        },
        {
          path: '/default',
          priority: 0,
          serviceIdentifier: defaultControllerClass,
          target: defaultControllerClass,
        },
        {
          path: '/medium',
          priority: 50,
          serviceIdentifier: mediumControllerClass,
          target: mediumControllerClass,
        },
      ];

      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce([...controllerMetadataListFixture]);

      result = getControllerMetadataList();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata()', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        Reflect,
        controllerMetadataReflectKey,
      );
    });

    it('should return sorted controller metadata by priority (descending)', () => {
      const expected: ControllerMetadata[] = [
        {
          path: '/high',
          priority: 100,
          serviceIdentifier: highControllerClass,
          target: highControllerClass,
        },
        {
          path: '/medium',
          priority: 50,
          serviceIdentifier: mediumControllerClass,
          target: mediumControllerClass,
        },
        {
          path: '/default',
          priority: 0,
          serviceIdentifier: defaultControllerClass,
          target: defaultControllerClass,
        },
        {
          path: '/low',
          priority: -100,
          serviceIdentifier: lowControllerClass,
          target: lowControllerClass,
        },
      ];

      expect(result).toStrictEqual(expected);
    });
  });
});
