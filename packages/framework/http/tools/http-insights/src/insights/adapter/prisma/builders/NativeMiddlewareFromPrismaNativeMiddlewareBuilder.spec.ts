import { beforeAll, describe, expect, it } from 'vitest';

import { type NativeMiddleware as PrismaNativeMiddleware } from '../../../../generated/prisma/client.js';
import { type NativeMiddleware } from '../../../domain/models/NativeMiddleware.js';
import { PrismaNativeMiddlewareFixtures } from '../fixtures/PrismaNativeMiddlewareFixtures.js';
import { NativeMiddlewareFromPrismaNativeMiddlewareBuilder } from './NativeMiddlewareFromPrismaNativeMiddlewareBuilder.js';

describe(NativeMiddlewareFromPrismaNativeMiddlewareBuilder, () => {
  let nativeMiddlewareFromPrismaNativeMiddlewareBuilder: NativeMiddlewareFromPrismaNativeMiddlewareBuilder;

  beforeAll(() => {
    nativeMiddlewareFromPrismaNativeMiddlewareBuilder =
      new NativeMiddlewareFromPrismaNativeMiddlewareBuilder();
  });

  describe('.build', () => {
    describe('when called', () => {
      let prismaNativeMiddlewareFixture: PrismaNativeMiddleware;

      let result: unknown;

      beforeAll(() => {
        prismaNativeMiddlewareFixture = PrismaNativeMiddlewareFixtures.any;

        result = nativeMiddlewareFromPrismaNativeMiddlewareBuilder.build(
          prismaNativeMiddlewareFixture,
        );
      });

      it('should return a NativeMiddleware', () => {
        const expected: NativeMiddleware = {
          endedAt: prismaNativeMiddlewareFixture.ended_at,
          error: prismaNativeMiddlewareFixture.error,
          id: prismaNativeMiddlewareFixture.id,
          name: prismaNativeMiddlewareFixture.name,
          startedAt: prismaNativeMiddlewareFixture.started_at,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
