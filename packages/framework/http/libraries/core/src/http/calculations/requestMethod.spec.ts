import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');
vitest.mock('./buildArrayMetadataWithElement');
vitest.mock('./buildNormalizedPath');

import {
  buildArrayMetadataWithElement,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodMetadataReflectKey';
import { RequestMethodType } from '../models/RequestMethodType';
import { buildNormalizedPath } from './buildNormalizedPath';
import { requestMethod } from './requestMethod';

describe(requestMethod, () => {
  describe('having a path undefined', () => {
    describe('when called', () => {
      let targetFixture: object;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];
      let keyFixture: string;
      let normalizedPathFixture: string;

      beforeAll(() => {
        keyFixture = 'key-example';
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;
        targetFixture = {};
        normalizedPathFixture = '/';

        vitest
          .mocked(buildNormalizedPath)
          .mockReturnValueOnce(normalizedPathFixture);

        vitest
          .mocked(buildArrayMetadataWithElement)
          .mockReturnValueOnce(callbackFixture);

        requestMethod(RequestMethodType.Get)(
          targetFixture,
          keyFixture,
          {} as TypedPropertyDescriptor<unknown>,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildNormalizedPath()', () => {
        expect(buildNormalizedPath).toHaveBeenCalledExactlyOnceWith('/');
      });

      it('should call buildArrayMetadataWithElement', () => {
        expect(buildArrayMetadataWithElement).toHaveBeenCalledExactlyOnceWith({
          methodKey: keyFixture,
          path: normalizedPathFixture,
          requestMethodType: RequestMethodType.Get,
        });
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture.constructor,
          controllerMethodMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
        );
      });
    });
  });

  describe('having a path defined', () => {
    describe('when called', () => {
      let targetFixture: object;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];
      let pathFixture: string;
      let keyFixture: string;
      let normalizedPathFixture: string;

      beforeAll(() => {
        keyFixture = 'key-example';
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;
        pathFixture = '/example';
        targetFixture = {};
        normalizedPathFixture = '/example';

        vitest
          .mocked(buildNormalizedPath)
          .mockReturnValueOnce(normalizedPathFixture);

        vitest
          .mocked(buildArrayMetadataWithElement)
          .mockReturnValueOnce(callbackFixture);

        requestMethod(RequestMethodType.Get, pathFixture)(
          targetFixture,
          keyFixture,
          {} as TypedPropertyDescriptor<unknown>,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildNormalizedPath()', () => {
        expect(buildNormalizedPath).toHaveBeenCalledExactlyOnceWith(
          pathFixture,
        );
      });

      it('should call buildArrayMetadataWithElement', () => {
        expect(buildArrayMetadataWithElement).toHaveBeenCalledExactlyOnceWith({
          methodKey: keyFixture,
          path: normalizedPathFixture,
          requestMethodType: RequestMethodType.Get,
        });
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture.constructor,
          controllerMethodMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
        );
      });
    });
  });
});
