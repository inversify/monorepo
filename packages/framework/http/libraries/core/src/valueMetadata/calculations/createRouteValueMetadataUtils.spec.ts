import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('../../http/decorators/routeValueMetadata.js'));

import { routeValueMetadata } from '../../http/decorators/routeValueMetadata.js';
import { routeValueMetadataSymbol } from '../../http/models/routeValueMetadataSymbol.js';
import { createRouteValueMetadataUtils } from './createRouteValueMetadataUtils.js';

describe(createRouteValueMetadataUtils, () => {
  describe('decorator', () => {
    let metadataKeyFixture: string;
    let metadataValueFixture: string[];
    let decoratorFixture: MethodDecorator;
    let decoratorResult: MethodDecorator;
    let result: [
      decorator: (value: string[]) => MethodDecorator,
      getter: (
        request: Record<string | symbol, unknown>,
      ) => string[] | undefined,
    ];

    beforeAll(() => {
      metadataKeyFixture = 'roles';
      metadataValueFixture = ['admin'];
      decoratorFixture = vitest.fn() as MethodDecorator;

      vitest.mocked(routeValueMetadata).mockReturnValueOnce(decoratorFixture);

      result = createRouteValueMetadataUtils<
        Record<string | symbol, unknown>,
        string[]
      >(metadataKeyFixture);

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
    describe('having request with metadata with key and value', () => {
      let metadataKeyFixture: string;
      let metadataValueFixture: string[];
      let requestFixtureWithMetadata: Record<string | symbol, unknown>;

      beforeAll(() => {
        metadataKeyFixture = 'roles';
        metadataValueFixture = ['admin'];

        requestFixtureWithMetadata = {
          [routeValueMetadataSymbol]: new Map([
            [metadataKeyFixture, metadataValueFixture],
          ]),
        };
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          const [, getter]: [
            (value: string[]) => MethodDecorator,
            (request: Record<string | symbol, unknown>) => string[] | undefined,
          ] = createRouteValueMetadataUtils<
            Record<string | symbol, unknown>,
            string[]
          >(metadataKeyFixture);

          result = getter(requestFixtureWithMetadata);
        });

        it('should return expected value', () => {
          expect(result).toBe(metadataValueFixture);
        });
      });
    });

    describe('having request with no metadata', () => {
      let metadataKeyFixture: string;
      let requestFixtureWithMetadata: Record<string | symbol, unknown>;

      beforeAll(() => {
        metadataKeyFixture = 'roles';
        requestFixtureWithMetadata = {};
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          const [, getter]: [
            (value: string[]) => MethodDecorator,
            (request: Record<string | symbol, unknown>) => string[] | undefined,
          ] = createRouteValueMetadataUtils<
            Record<string | symbol, unknown>,
            string[]
          >(metadataKeyFixture);

          result = getter(requestFixtureWithMetadata);
        });

        it('should return expected value', () => {
          expect(result).toBeUndefined();
        });
      });
    });

    describe('having request with empty metadata', () => {
      let metadataKeyFixture: string;
      let requestFixtureWithMetadata: Record<string | symbol, unknown>;

      beforeAll(() => {
        metadataKeyFixture = 'roles';
        requestFixtureWithMetadata = {};
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          const [, getter]: [
            (value: string[]) => MethodDecorator,
            (request: Record<string | symbol, unknown>) => string[] | undefined,
          ] = createRouteValueMetadataUtils<
            Record<string | symbol, unknown>,
            string[]
          >(metadataKeyFixture);

          result = getter(requestFixtureWithMetadata);
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });
  });
});
