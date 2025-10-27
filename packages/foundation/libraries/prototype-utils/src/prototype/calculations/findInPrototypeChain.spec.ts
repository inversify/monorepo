import { beforeAll, describe, expect, it } from 'vitest';

import { type Newable } from '@inversifyjs/common';

import { findInPrototypeChain } from './findInPrototypeChain';

describe(findInPrototypeChain, () => {
  describe('having a prototype chain with a value in the base type', () => {
    let baseTypeFixture: Newable;
    let typeFixture: Newable;
    let readerFixture: (type: Newable) => string | undefined;

    beforeAll(() => {
      class BaseType {}
      class MiddleType extends BaseType {}
      class DerivedType extends MiddleType {}

      baseTypeFixture = BaseType;
      typeFixture = DerivedType;

      readerFixture = (type: Newable): string | undefined => {
        if (type === baseTypeFixture) {
          return 'base-value';
        }
        return undefined;
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = findInPrototypeChain(typeFixture, readerFixture);
      });

      it('should return expected result', () => {
        expect(result).toBe('base-value');
      });
    });
  });

  describe('having a prototype chain with a value in the middle type', () => {
    let middleTypeFixture: Newable;
    let typeFixture: Newable;
    let readerFixture: (type: Newable) => string | undefined;

    beforeAll(() => {
      class BaseType {}
      class MiddleType extends BaseType {}
      class DerivedType extends MiddleType {}

      middleTypeFixture = MiddleType;
      typeFixture = DerivedType;

      readerFixture = (type: Newable): string | undefined => {
        if (type === middleTypeFixture) {
          return 'middle-value';
        }
        return undefined;
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = findInPrototypeChain(typeFixture, readerFixture);
      });

      it('should return expected result', () => {
        expect(result).toBe('middle-value');
      });
    });
  });

  describe('having a prototype chain with a value in the derived type', () => {
    let typeFixture: Newable;
    let readerFixture: (type: Newable) => string | undefined;

    beforeAll(() => {
      class BaseType {}
      class MiddleType extends BaseType {}
      class DerivedType extends MiddleType {}

      typeFixture = DerivedType;

      readerFixture = (type: Newable): string | undefined => {
        if (type === typeFixture) {
          return 'derived-value';
        }
        return undefined;
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = findInPrototypeChain(typeFixture, readerFixture);
      });

      it('should return expected result', () => {
        expect(result).toBe('derived-value');
      });
    });
  });

  describe('having a prototype chain with values in multiple types', () => {
    let baseTypeFixture: Newable;
    let middleTypeFixture: Newable;
    let typeFixture: Newable;
    let readerFixture: (type: Newable) => string | undefined;

    beforeAll(() => {
      class BaseType {}
      class MiddleType extends BaseType {}
      class DerivedType extends MiddleType {}

      baseTypeFixture = BaseType;
      middleTypeFixture = MiddleType;
      typeFixture = DerivedType;

      readerFixture = (type: Newable): string | undefined => {
        if (type === typeFixture) {
          return 'derived-value';
        }
        if (type === middleTypeFixture) {
          return 'middle-value';
        }
        if (type === baseTypeFixture) {
          return 'base-value';
        }
        return undefined;
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = findInPrototypeChain(typeFixture, readerFixture);
      });

      it('should return expected result', () => {
        expect(result).toBe('derived-value');
      });
    });
  });

  describe('having a prototype chain with no value', () => {
    let typeFixture: Newable;
    let readerFixture: (type: Newable) => string | undefined;

    beforeAll(() => {
      class BaseType {}
      class MiddleType extends BaseType {}
      class DerivedType extends MiddleType {}

      typeFixture = DerivedType;

      readerFixture = (): string | undefined => {
        return undefined;
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = findInPrototypeChain(typeFixture, readerFixture);
      });

      it('should return expected result', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a single type with no base type and a value', () => {
    let typeFixture: Newable;
    let readerFixture: (type: Newable) => string | undefined;

    beforeAll(() => {
      class SingleType {}

      typeFixture = SingleType;

      readerFixture = (type: Newable): string | undefined => {
        if (type === typeFixture) {
          return 'single-value';
        }
        return undefined;
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = findInPrototypeChain(typeFixture, readerFixture);
      });

      it('should return expected result', () => {
        expect(result).toBe('single-value');
      });
    });
  });

  describe('having a single type with no base type and no value', () => {
    let typeFixture: Newable;
    let readerFixture: (type: Newable) => string | undefined;

    beforeAll(() => {
      class SingleType {}

      typeFixture = SingleType;

      readerFixture = (): string | undefined => {
        return undefined;
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = findInPrototypeChain(typeFixture, readerFixture);
      });

      it('should return expected result', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a reader that returns different types', () => {
    let typeFixture: Newable;
    let readerFixture: (type: Newable) => number | undefined;

    beforeAll(() => {
      class TestType {}

      typeFixture = TestType;

      readerFixture = (type: Newable): number | undefined => {
        if (type === typeFixture) {
          return 42;
        }
        return undefined;
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = findInPrototypeChain(typeFixture, readerFixture);
      });

      it('should return expected result', () => {
        expect(result).toBe(42);
      });
    });
  });

  describe('having a reader that returns complex objects', () => {
    let typeFixture: Newable;
    let complexValueFixture: { key: string; nested: { value: number } };
    let readerFixture: (
      type: Newable,
    ) => { key: string; nested: { value: number } } | undefined;

    beforeAll(() => {
      class TestType {}

      typeFixture = TestType;
      complexValueFixture = { key: 'test', nested: { value: 123 } };

      readerFixture = (
        type: Newable,
      ): { key: string; nested: { value: number } } | undefined => {
        if (type === typeFixture) {
          return complexValueFixture;
        }
        return undefined;
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = findInPrototypeChain(typeFixture, readerFixture);
      });

      it('should return expected result', () => {
        expect(result).toBe(complexValueFixture);
      });
    });
  });
});
