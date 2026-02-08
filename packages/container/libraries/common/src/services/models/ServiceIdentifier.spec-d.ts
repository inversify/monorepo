import { beforeAll, describe, expect, it } from 'vitest';

import type { ServiceIdentifier } from './ServiceIdentifier';

// eslint-disable-next-line vitest/prefer-describe-function-title
describe('ServiceIdentifier', () => {
  describe('having an abstract class with public constructor', () => {
    abstract class AbstractFoo {}

    it('should be a valid ServiceIdentifier', () => {
      const identifier: ServiceIdentifier = AbstractFoo;

      expect(identifier).toBeInstanceOf(Function);
    });
  });

  describe('having an abstract class with protected constructor', () => {
    abstract class AbstractFoo {
      protected constructor() {}
    }

    it('should be a valid ServiceIdentifier', () => {
      // @ts-expect-error :: Type 'typeof AbstractFoo' is not assignable to type 'ServiceIdentifier'.
      const identifier: ServiceIdentifier = AbstractFoo;

      expect(identifier).toBeInstanceOf(Function);
    });
  });

  describe('having a class with public constructor', () => {
    class Foo {}

    it('should be a valid ServiceIdentifier', () => {
      const identifier: ServiceIdentifier = Foo;

      expect(identifier).toBeInstanceOf(Function);
    });
  });

  describe('having a class with protected constructor', () => {
    class Foo {
      protected constructor() {}
    }

    it('should be a valid ServiceIdentifier', () => {
      // @ts-expect-error :: Type 'typeof Foo' is not assignable to type 'ServiceIdentifier'.
      const identifier: ServiceIdentifier = Foo;

      expect(identifier).toBeInstanceOf(Function);
    });
  });

  describe('having a string', () => {
    let identifier: ServiceIdentifier;

    beforeAll(() => {
      identifier = 'Foo';
    });

    it('should be a valid ServiceIdentifier', () => {
      expect(identifier).toBeTypeOf('string');
    });
  });

  describe('having a symbol', () => {
    let identifier: ServiceIdentifier;

    beforeAll(() => {
      identifier = Symbol('Foo');
    });

    it('should be a valid ServiceIdentifier', () => {
      expect(identifier).toBeTypeOf('symbol');
    });
  });
});
