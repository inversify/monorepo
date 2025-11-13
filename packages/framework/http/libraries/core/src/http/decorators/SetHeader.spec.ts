import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');
vitest.mock('../calculations/buildSetHeaderMetadata');

import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodHeaderMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodHeaderMetadataReflectKey';
import { buildSetHeaderMetadata } from '../calculations/buildSetHeaderMetadata';
import { SetHeader } from './SetHeader';

describe(SetHeader, () => {
  describe('when called', () => {
    let controllerFixture: NewableFunction;
    let controllerMethodKeyFixture: string | symbol;
    let descriptorFixture: PropertyDescriptor;
    let keyFixture: string;
    let valueFixture: string;
    let callbackFixture: (
      mapMetadata: Record<string, string>,
    ) => Record<string, string>;

    beforeAll(() => {
      controllerFixture = class Test {};
      controllerMethodKeyFixture = 'testMethod';
      descriptorFixture = {
        value: 'value-descriptor-example',
      } as PropertyDescriptor;
      keyFixture = 'key-example';
      valueFixture = 'value-example';
      callbackFixture = (
        mapMetadata: Record<string, string>,
      ): Record<string, string> => mapMetadata;

      vitest
        .mocked(buildSetHeaderMetadata)
        .mockReturnValueOnce(callbackFixture);

      SetHeader(keyFixture, valueFixture)(
        controllerFixture,
        controllerMethodKeyFixture,
        descriptorFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call buildSetHeaderMetadata', () => {
      expect(buildSetHeaderMetadata).toHaveBeenCalledExactlyOnceWith(
        keyFixture,
        valueFixture,
      );
    });

    it('should call setReflectMetadata', () => {
      expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        controllerFixture.constructor,
        controllerMethodHeaderMetadataReflectKey,
        expect.any(Function),
        callbackFixture,
        controllerMethodKeyFixture,
      );
    });
  });
});
