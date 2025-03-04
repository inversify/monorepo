import { beforeAll, describe, expect, it } from 'vitest';

import { Right } from '@inversifyjs/common';

import { ConstantValueBindingFixtures } from '../../binding/fixtures/ConstantValueBindingFixtures';
import { BindingScope } from '../../binding/models/BindingScope';
import { BindingType } from '../../binding/models/BindingType';
import { ScopedBinding } from '../../binding/models/ScopedBinding';
import { cacheResolvedValue } from './cacheResolvedValue';

describe(cacheResolvedValue.name, () => {
  describe('having a non promise resolved value', () => {
    let bindingFixture: ScopedBinding<BindingType, BindingScope, unknown>;
    let resolvedValueFixture: unknown;

    beforeAll(() => {
      bindingFixture = ConstantValueBindingFixtures.withCacheWithIsRightFalse;

      resolvedValueFixture = Symbol();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = cacheResolvedValue(bindingFixture, resolvedValueFixture);
      });

      it('should cache the resolved value', () => {
        const expectedCache: Right<unknown> = {
          isRight: true,
          value: resolvedValueFixture,
        };

        expect(bindingFixture.cache).toStrictEqual(expectedCache);
      });

      it('should return the resolved value', () => {
        expect(result).toBe(resolvedValueFixture);
      });
    });
  });

  describe('having a promise resolved value', () => {
    let bindingFixture: ScopedBinding<BindingType, BindingScope, unknown>;
    let resolvedValueFixture: unknown;

    beforeAll(() => {
      bindingFixture = ConstantValueBindingFixtures.withCacheWithIsRightFalse;

      resolvedValueFixture = Symbol();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(async () => {
        result = await cacheResolvedValue(
          bindingFixture,
          Promise.resolve(resolvedValueFixture),
        );
      });

      it('should cache the resolved value', () => {
        const expectedCache: Right<unknown> = {
          isRight: true,
          value: resolvedValueFixture,
        };

        expect(bindingFixture.cache).toStrictEqual(expectedCache);
      });

      it('should return the resolved value', () => {
        expect(result).toBe(resolvedValueFixture);
      });
    });
  });
});
