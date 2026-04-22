import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));
vitest.mock(import('../actions/setRouteValueMetadata.js'));

import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { routeValueMetadataReflectKey } from '../../reflectMetadata/data/routeValueMetadataReflectKey.js';
import { setRouteValueMetadata } from '../actions/setRouteValueMetadata.js';
import { routeValueMetadata } from './routeValueMetadata.js';

describe(routeValueMetadata, () => {
  describe('when called', () => {
    let controllerFixture: object;
    let controllerMethodKeyFixture: string | symbol;
    let descriptorFixture: PropertyDescriptor;
    let metadataKeyFixture: string;
    let valueFixture: string;
    let setRouteValueMetadataResultFixture: (
      metadata: Map<string | symbol, Map<string | symbol, unknown>>,
    ) => Map<string | symbol, Map<string | symbol, unknown>>;

    beforeAll(() => {
      controllerFixture = class Test {};
      controllerMethodKeyFixture = 'testMethod';
      descriptorFixture = {
        value: 'value-descriptor-example',
      };
      metadataKeyFixture = 'key-example';
      valueFixture = 'value-example';
      setRouteValueMetadataResultFixture = vitest.fn();

      vitest
        .mocked(setRouteValueMetadata)
        .mockReturnValueOnce(setRouteValueMetadataResultFixture);

      routeValueMetadata(metadataKeyFixture, valueFixture)(
        controllerFixture,
        controllerMethodKeyFixture,
        descriptorFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call setRouteValueMetadata', () => {
      expect(setRouteValueMetadata).toHaveBeenCalledExactlyOnceWith(
        controllerMethodKeyFixture,
        metadataKeyFixture,
        valueFixture,
      );
    });

    it('should call updateOwnReflectMetadata', () => {
      expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        controllerFixture.constructor,
        routeValueMetadataReflectKey,
        expect.any(Function),
        setRouteValueMetadataResultFixture,
      );
    });
  });
});
