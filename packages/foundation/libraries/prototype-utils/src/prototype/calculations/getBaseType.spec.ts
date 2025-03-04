import { beforeAll, describe, expect, it } from 'vitest';

import { Newable } from '@inversifyjs/common';

import { getBaseType } from './getBaseType';

describe(getBaseType.name, () => {
  describe('having a type with base type', () => {
    let baseTypeFixture: Newable;
    let typeFixture: Newable;

    beforeAll(() => {
      class BaseType {}

      baseTypeFixture = BaseType;
      typeFixture = class extends BaseType {};
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getBaseType(typeFixture);
      });

      it('should return base type', () => {
        expect(result).toBe(baseTypeFixture);
      });
    });
  });

  describe('having a type with no base type', () => {
    let typeFixture: Newable;

    beforeAll(() => {
      typeFixture = Object;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getBaseType(typeFixture);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
