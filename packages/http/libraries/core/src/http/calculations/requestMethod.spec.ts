import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');
vitest.mock('./buildArrayMetadataWithElement');

import {
  buildArrayMetadataWithElement,
  buildDefaultArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodMetadataReflectKey';
import { RequestMethodType } from '../models/RequestMethodType';
import { requestMethod } from './requestMethod';

describe(requestMethod, () => {
  describe('having a path undefined', () => {
    describe('when called', () => {
      let targetFixture: object;
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];
      let keyFixture: string;

      beforeAll(() => {
        keyFixture = 'key-example';
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;
        targetFixture = {};

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

      it('should call buildArrayMetadataWithElement', () => {
        expect(buildArrayMetadataWithElement).toHaveBeenCalledTimes(1);
        expect(buildArrayMetadataWithElement).toHaveBeenCalledWith({
          methodKey: keyFixture,
          path: '/',
          requestMethodType: RequestMethodType.Get,
        });
      });

      it('should call updateOwnReflectMetadata', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledTimes(1);
        expect(updateOwnReflectMetadata).toHaveBeenCalledWith(
          targetFixture.constructor,
          controllerMethodMetadataReflectKey,
          buildDefaultArrayMetadata,
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

      beforeAll(() => {
        keyFixture = 'key-example';
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;
        pathFixture = '/example';
        targetFixture = {};

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

      it('should call buildArrayMetadataWithElement', () => {
        expect(buildArrayMetadataWithElement).toHaveBeenCalledTimes(1);
        expect(buildArrayMetadataWithElement).toHaveBeenCalledWith({
          methodKey: keyFixture,
          path: pathFixture,
          requestMethodType: RequestMethodType.Get,
        });
      });

      it('should call updateOwnReflectMetadata', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledTimes(1);
        expect(updateOwnReflectMetadata).toHaveBeenCalledWith(
          targetFixture.constructor,
          controllerMethodMetadataReflectKey,
          buildDefaultArrayMetadata,
          callbackFixture,
        );
      });
    });
  });
});
