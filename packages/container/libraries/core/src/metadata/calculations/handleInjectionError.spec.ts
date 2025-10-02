import { beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('../../decorator/calculations/getDecoratorInfo');
vitest.mock('../../decorator/calculations/stringifyDecoratorInfo');

import { getDecoratorInfo } from '../../decorator/calculations/getDecoratorInfo';
import { stringifyDecoratorInfo } from '../../decorator/calculations/stringifyDecoratorInfo';
import { DecoratorInfo } from '../../decorator/models/DecoratorInfo';
import { DecoratorInfoKind } from '../../decorator/models/DecoratorInfoKind';
import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { handleInjectionError } from './handleInjectionError';

describe(handleInjectionError, () => {
  describe('having an InversifyCoreError of kind injectionDecoratorConflict', () => {
    let targetFixture: object;
    let propertyKeyFixture: string | symbol | undefined;
    let parameterIndexFixture: number | undefined;
    let errorFixture: InversifyCoreError;

    beforeAll(() => {
      targetFixture = class {};
      propertyKeyFixture = undefined;
      parameterIndexFixture = 0;
      errorFixture = new InversifyCoreError(
        InversifyCoreErrorKind.injectionDecoratorConflict,
        'error message fixture',
      );
    });

    describe('when called', () => {
      let decoratorInfoFixture: DecoratorInfo;
      let decoratorInfoStringifiedFixture: string;

      let result: unknown;

      beforeAll(() => {
        decoratorInfoFixture = {
          index: 0,
          kind: DecoratorInfoKind.parameter,
          targetClass: class {},
        };

        decoratorInfoStringifiedFixture = 'decorator-info-stringified-fixture';

        vitest
          .mocked(getDecoratorInfo)
          .mockReturnValueOnce(decoratorInfoFixture);

        vitest
          .mocked(stringifyDecoratorInfo)
          .mockReturnValueOnce(decoratorInfoStringifiedFixture);

        try {
          handleInjectionError(
            targetFixture,
            propertyKeyFixture,
            parameterIndexFixture,
            errorFixture,
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should call getDecoratorInfo()', () => {
        expect(getDecoratorInfo).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          propertyKeyFixture,
          parameterIndexFixture,
        );
      });

      it('should call stringifyDecoratorInfo()', () => {
        expect(stringifyDecoratorInfo).toHaveBeenCalledExactlyOnceWith(
          decoratorInfoFixture,
        );
      });

      it('should throw an InversifyCoreError', () => {
        const expectedErrorProperties: Partial<InversifyCoreError> = {
          cause: errorFixture,
          kind: InversifyCoreErrorKind.injectionDecoratorConflict,
          message: `Unexpected injection error.

Cause:

${errorFixture.message}

Details

${decoratorInfoStringifiedFixture}`,
        };

        expect(result).toBeInstanceOf(InversifyCoreError);
        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });
  });

  describe('having a non InversifyCoreError', () => {
    let targetFixture: object;
    let propertyKeyFixture: string | symbol | undefined;
    let parameterIndexFixture: number | undefined;
    let errorFixture: Error;

    beforeAll(() => {
      targetFixture = class {};
      propertyKeyFixture = undefined;
      parameterIndexFixture = 0;
      errorFixture = new Error('error message fixture');
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          handleInjectionError(
            targetFixture,
            propertyKeyFixture,
            parameterIndexFixture,
            errorFixture,
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an Error', () => {
        expect(result).toBe(errorFixture);
      });
    });
  });
});
