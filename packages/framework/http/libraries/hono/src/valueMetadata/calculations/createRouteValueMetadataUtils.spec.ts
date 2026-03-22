import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/http-core'));

import { routeValueMetadata } from '@inversifyjs/http-core';
import type { Context } from 'hono';

import { createRouteValueMetadataUtils } from './createRouteValueMetadataUtils.js';

describe(createRouteValueMetadataUtils, () => {
  describe('decorator', () => {
    let metadataKeyFixture: string;
    let metadataValueFixture: string[];
    let decoratorFixture: MethodDecorator;
    let decoratorResult: MethodDecorator;
    let result: [
      decorator: (value: string[]) => MethodDecorator,
      getter: (context: Context) => string[] | undefined,
    ];

    beforeAll(() => {
      metadataKeyFixture = 'roles';
      metadataValueFixture = ['admin'];
      decoratorFixture = vitest.fn() as MethodDecorator;

      vitest.mocked(routeValueMetadata).mockReturnValueOnce(decoratorFixture);

      result = createRouteValueMetadataUtils<string[]>(metadataKeyFixture);

      decoratorResult = result[0](metadataValueFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('when called, should delegate to routeValueMetadata', () => {
      expect(routeValueMetadata).toHaveBeenCalledExactlyOnceWith(
        metadataKeyFixture,
        metadataValueFixture,
      );
    });

    it('when called, should return routeValueMetadata result', () => {
      expect(decoratorResult).toBe(decoratorFixture);
    });
  });

  describe('getter', () => {
    describe('having context with metadata with key and value', () => {
      let metadataKeyFixture: string;
      let metadataValueFixture: string[];
      let contextFixture: Context;

      beforeAll(() => {
        metadataKeyFixture = 'roles';
        metadataValueFixture = ['admin'];

        contextFixture = {
          get: vitest
            .fn()
            .mockReturnValueOnce(
              new Map([[metadataKeyFixture, metadataValueFixture]]),
            ),
        } as Partial<Context> as Context;
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          const [, getter]: [
            (value: string[]) => MethodDecorator,
            (context: Context) => string[] | undefined,
          ] = createRouteValueMetadataUtils<string[]>(metadataKeyFixture);

          result = getter(contextFixture);
        });

        it('should return expected value', () => {
          expect(result).toBe(metadataValueFixture);
        });
      });
    });

    describe('having context with no metadata', () => {
      let metadataKeyFixture: string;
      let contextFixture: Context;

      beforeAll(() => {
        metadataKeyFixture = 'roles';

        contextFixture = {
          get: vitest.fn().mockReturnValueOnce(undefined),
        } as Partial<Context> as Context;
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          const [, getter]: [
            (value: string[]) => MethodDecorator,
            (context: Context) => string[] | undefined,
          ] = createRouteValueMetadataUtils<string[]>(metadataKeyFixture);

          result = getter(contextFixture);
        });

        it('should return expected value', () => {
          expect(result).toBeUndefined();
        });
      });
    });

    describe('having context with empty metadata', () => {
      let metadataKeyFixture: string;
      let contextFixture: Context;

      beforeAll(() => {
        metadataKeyFixture = 'roles';

        contextFixture = {
          get: vitest.fn().mockReturnValueOnce(new Map()),
        } as Partial<Context> as Context;
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          const [, getter]: [
            (value: string[]) => MethodDecorator,
            (context: Context) => string[] | undefined,
          ] = createRouteValueMetadataUtils<string[]>(metadataKeyFixture);

          result = getter(contextFixture);
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });
  });
});
