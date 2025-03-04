import { beforeAll, describe, expect, it } from 'vitest';

import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { DecoratorInfo } from '../models/DecoratorInfo';
import { DecoratorInfoKind } from '../models/DecoratorInfoKind';
import { getDecoratorInfo } from './getDecoratorInfo';

describe(getDecoratorInfo.name, () => {
  describe('having a propertyKey undefined and parameterIndex undefined', () => {
    let targetFixture: object;
    let propertyKeyFixture: undefined;
    let parameterIndexFixture: undefined;

    beforeAll(() => {
      targetFixture = class {};
      propertyKeyFixture = undefined;
      parameterIndexFixture = undefined;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          getDecoratorInfo(
            targetFixture,
            propertyKeyFixture,
            parameterIndexFixture,
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an InversifyCoreError', () => {
        const expectedErrorProperties: Partial<InversifyCoreError> = {
          kind: InversifyCoreErrorKind.unknown,
          message: 'Unexpected undefined property and index values',
        };

        expect(result).toBeInstanceOf(InversifyCoreError);
        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });
  });

  describe('having a propertyKey not undefined and parameterIndex undefined', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetFixture: Function;
    let propertyKeyFixture: string | symbol;
    let parameterIndexFixture: undefined;

    beforeAll(() => {
      targetFixture = class {};
      propertyKeyFixture = Symbol.for('property');
      parameterIndexFixture = undefined;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getDecoratorInfo(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          targetFixture.prototype,
          propertyKeyFixture,
          parameterIndexFixture,
        );
      });

      it('should return DecoratorInfo', () => {
        const expected: DecoratorInfo = {
          kind: DecoratorInfoKind.property,
          property: propertyKeyFixture,
          targetClass: targetFixture,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a propertyKey undefined and parameterIndex number', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetFixture: Function;
    let propertyKeyFixture: undefined;
    let parameterIndexFixture: number;

    beforeAll(() => {
      targetFixture = class {};
      propertyKeyFixture = undefined;
      parameterIndexFixture = 0;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getDecoratorInfo(
          targetFixture,
          propertyKeyFixture,
          parameterIndexFixture,
        );
      });

      it('should return DecoratorInfo', () => {
        const expected: DecoratorInfo = {
          index: parameterIndexFixture,
          kind: DecoratorInfoKind.parameter,
          targetClass: targetFixture,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a propertyKey not undefined and descriptor', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetFixture: Function;
    let propertyKeyFixture: string | symbol;
    let descriptorFixture: TypedPropertyDescriptor<unknown>;

    beforeAll(() => {
      targetFixture = class {};
      propertyKeyFixture = Symbol.for('method-fixture');
      descriptorFixture = {
        configurable: true,
        enumerable: true,
        value: Symbol(),
        writable: true,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getDecoratorInfo(
          targetFixture,
          propertyKeyFixture,
          descriptorFixture,
        );
      });

      it('should return DecoratorInfo', () => {
        const expected: DecoratorInfo = {
          kind: DecoratorInfoKind.method,
          method: propertyKeyFixture,
          targetClass: targetFixture,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
