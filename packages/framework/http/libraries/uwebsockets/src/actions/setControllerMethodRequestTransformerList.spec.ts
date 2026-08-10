import { beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import {
  buildArrayMetadataWithArray,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { type RequestTransformer } from '../models/RequestTransformer.js';
import { requestTransformerMetadataReflectKey } from '../reflectMetadata/data/requestTransformerMetadataReflectKey.js';
import { setControllerMethodRequestTransformerList } from './setControllerMethodRequestTransformerList.js';

describe(setControllerMethodRequestTransformerList, () => {
  describe('having a controller constructor, a method key and a request transformer list', () => {
    let controllerConstructorFixture: NewableFunction;
    let methodKeyFixture: string;
    let requestTransformerListFixture: RequestTransformer[];

    beforeAll(() => {
      controllerConstructorFixture = class TestController {};
      methodKeyFixture = 'testMethod';
      requestTransformerListFixture = [vitest.fn()];
    });

    describe('when called', () => {
      let callbackFixture: (
        metadata: RequestTransformer[],
      ) => RequestTransformer[];

      beforeAll(() => {
        callbackFixture = (
          metadata: RequestTransformer[],
        ): RequestTransformer[] => metadata;

        vitest
          .mocked(buildArrayMetadataWithArray)
          .mockReturnValueOnce(
            callbackFixture as (metadata: unknown[]) => unknown[],
          );

        setControllerMethodRequestTransformerList(
          controllerConstructorFixture,
          methodKeyFixture,
          requestTransformerListFixture,
        );
      });

      it('should call buildArrayMetadataWithArray()', () => {
        expect(buildArrayMetadataWithArray).toHaveBeenCalledExactlyOnceWith(
          requestTransformerListFixture,
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          controllerConstructorFixture,
          requestTransformerMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
          methodKeyFixture,
        );
      });
    });
  });
});
