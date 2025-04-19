import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import {
  getReflectMetadata,
  setReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodMetadataReflectKey';
import { RequestMethodType } from '../models/RequestMethodType';
import { requestMethod } from './requestMethod';

describe(requestMethod.name, () => {
  describe('having a undefined path', () => {
    describe('when called', () => {
      let targetFixture: object;
      let keyFixture: string;

      beforeAll(() => {
        keyFixture = 'key-example';
        targetFixture = {};

        requestMethod(RequestMethodType.GET)(
          targetFixture,
          keyFixture,
          {} as TypedPropertyDescriptor<unknown>,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getReflectMetadata', () => {
        expect(getReflectMetadata).toHaveBeenCalledTimes(1);
        expect(getReflectMetadata).toHaveBeenCalledWith(
          targetFixture.constructor,
          controllerMethodMetadataReflectKey,
        );
      });

      it('should call setReflectMetadata', () => {
        expect(setReflectMetadata).toHaveBeenCalledTimes(1);
        expect(setReflectMetadata).toHaveBeenCalledWith(
          targetFixture.constructor,
          controllerMethodMetadataReflectKey,
          [
            {
              methodKey: keyFixture,
              path: '/',
              requestMethodType: RequestMethodType.GET,
            },
          ],
        );
      });
    });
  });

  describe('having a defined path', () => {
    describe('when called and getReflectMetadata returns metadata', () => {
      let pathFixture: string;
      let targetFixture: object;
      let keyFixture: string;

      beforeAll(() => {
        pathFixture = 'path-example';
        keyFixture = 'key-example';
        targetFixture = {};

        vitest.mocked(getReflectMetadata).mockReturnValueOnce([]);

        requestMethod(RequestMethodType.GET, pathFixture)(
          targetFixture,
          keyFixture,
          {} as TypedPropertyDescriptor<unknown>,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getReflectMetadata', () => {
        expect(getReflectMetadata).toHaveBeenCalledTimes(1);
        expect(getReflectMetadata).toHaveBeenCalledWith(
          targetFixture.constructor,
          controllerMethodMetadataReflectKey,
        );
      });

      it('should call setReflectMetadata', () => {
        expect(setReflectMetadata).toHaveBeenCalledTimes(1);
        expect(setReflectMetadata).toHaveBeenCalledWith(
          targetFixture.constructor,
          controllerMethodMetadataReflectKey,
          [
            {
              methodKey: keyFixture,
              path: pathFixture,
              requestMethodType: RequestMethodType.GET,
            },
          ],
        );
      });
    });
  });
});
