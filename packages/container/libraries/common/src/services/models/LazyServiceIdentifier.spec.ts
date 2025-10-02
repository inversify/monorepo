import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

import { LazyServiceIdentifier } from './LazyServiceIdentifier';
import { ServiceIdentifier } from './ServiceIdentifier';

describe(LazyServiceIdentifier, () => {
  let buildServiceIdMock: Mock<() => ServiceIdentifier<unknown>>;

  let lazyServiceIdentifier: LazyServiceIdentifier;

  beforeAll(() => {
    buildServiceIdMock = vitest.fn();

    lazyServiceIdentifier = new LazyServiceIdentifier(buildServiceIdMock);
  });

  describe('.is', () => {
    describe('having a non object', () => {
      let valueFixture: unknown;

      beforeAll(() => {
        valueFixture = Symbol();
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = LazyServiceIdentifier.is(valueFixture);
        });

        it('should return false', () => {
          expect(result).toBe(false);
        });
      });
    });

    describe('having a null object', () => {
      let valueFixture: null;

      beforeAll(() => {
        valueFixture = null;
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = LazyServiceIdentifier.is(valueFixture);
        });

        it('should return false', () => {
          expect(result).toBe(false);
        });
      });
    });

    describe('having an object with islazyServiceIdentifierSymbol property', () => {
      let valueFixture: LazyServiceIdentifier;

      beforeAll(() => {
        valueFixture = new LazyServiceIdentifier(() => 'service-id');
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = LazyServiceIdentifier.is(valueFixture);
        });

        it('should return true', () => {
          expect(result).toBe(true);
        });
      });
    });

    describe('having an object without islazyServiceIdentifierSymbol property', () => {
      let valueFixture: unknown;

      beforeAll(() => {
        valueFixture = {
          foo: 'bar',
        };
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = LazyServiceIdentifier.is(valueFixture);
        });

        it('should return false', () => {
          expect(result).toBe(false);
        });
      });
    });
  });

  describe('.unwrap', () => {
    describe('when called', () => {
      let serviceIdFixure: ServiceIdentifier;

      let result: unknown;

      beforeAll(() => {
        serviceIdFixure = Symbol();

        buildServiceIdMock.mockReturnValueOnce(serviceIdFixure);

        result = lazyServiceIdentifier.unwrap();
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildServiceId()', () => {
        expect(buildServiceIdMock).toHaveBeenCalledExactlyOnceWith();
      });

      it('should return expected result', () => {
        expect(result).toBe(serviceIdFixure);
      });
    });
  });
});
