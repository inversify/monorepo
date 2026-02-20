import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

vitest.mock(import('@inversifyjs/prototype-utils'));

import { type Newable } from '@inversifyjs/common';
import { getBaseType } from '@inversifyjs/prototype-utils';

vitest.mock(import('./injectFrom.js'));

import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { type InjectFromBaseOptions } from '../models/InjectFromBaseOptions.js';
import { type InjectFromOptions } from '../models/InjectFromOptions.js';
import { injectFrom } from './injectFrom.js';
import { injectFromBase } from './injectFromBase.js';

describe(injectFromBase, () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  let targetFixture: Function;

  beforeAll(() => {
    targetFixture = class {};
  });

  describe('when called, and getBaseType returns Newable', () => {
    let injectFromBaseOptionsFixture: InjectFromBaseOptions;

    let baseTypefixture: Newable;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let injectFromResultMock: Mock<(target: Function) => void>;

    let result: unknown;

    beforeAll(() => {
      injectFromBaseOptionsFixture = {
        extendConstructorArguments: true,
        extendProperties: true,
      };
      baseTypefixture = class Base {};
      injectFromResultMock = vitest.fn().mockReturnValueOnce(undefined);

      vitest.mocked(getBaseType).mockReturnValueOnce(baseTypefixture);

      vitest.mocked(injectFrom).mockReturnValueOnce(injectFromResultMock);

      result = injectFromBase(injectFromBaseOptionsFixture)(targetFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getBaseType()', () => {
      expect(getBaseType).toHaveBeenCalledExactlyOnceWith(targetFixture);
    });

    it('should call injectFrom()', () => {
      const expected: InjectFromOptions = {
        ...injectFromBaseOptionsFixture,
        type: baseTypefixture,
      };

      expect(injectFrom).toHaveBeenCalledExactlyOnceWith(expected);

      expect(injectFromResultMock).toHaveBeenCalledExactlyOnceWith(
        targetFixture,
      );
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });

  describe('when called with lifecycle options, and getBaseType returns Newable', () => {
    let injectFromBaseOptionsFixture: InjectFromBaseOptions;

    let baseTypefixture: Newable;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let injectFromResultMock: Mock<(target: Function) => void>;

    let result: unknown;

    beforeAll(() => {
      injectFromBaseOptionsFixture = {
        extendConstructorArguments: false,
        extendProperties: false,
        lifecycle: {
          extendPostConstructMethods: true,
          extendPreDestroyMethods: false,
        },
      };
      baseTypefixture = class Base {};
      injectFromResultMock = vitest.fn().mockReturnValueOnce(undefined);

      vitest.mocked(getBaseType).mockReturnValueOnce(baseTypefixture);

      vitest.mocked(injectFrom).mockReturnValueOnce(injectFromResultMock);

      result = injectFromBase(injectFromBaseOptionsFixture)(targetFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getBaseType()', () => {
      expect(getBaseType).toHaveBeenCalledExactlyOnceWith(targetFixture);
    });

    it('should call injectFrom() with lifecycle options', () => {
      const expected: InjectFromOptions = {
        ...injectFromBaseOptionsFixture,
        type: baseTypefixture,
      };

      expect(injectFrom).toHaveBeenCalledExactlyOnceWith(expected);

      expect(injectFromResultMock).toHaveBeenCalledExactlyOnceWith(
        targetFixture,
      );
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });

  describe('when called, and getBaseType returns undefined', () => {
    let injectFromBaseOptionsFixture: InjectFromBaseOptions;

    let result: unknown;

    beforeAll(() => {
      injectFromBaseOptionsFixture = {
        extendConstructorArguments: true,
        extendProperties: true,
      };

      vitest.mocked(getBaseType).mockReturnValueOnce(undefined);

      try {
        injectFromBase(injectFromBaseOptionsFixture)(targetFixture);
      } catch (error: unknown) {
        result = error;
      }
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getBaseType()', () => {
      expect(getBaseType).toHaveBeenCalledExactlyOnceWith(targetFixture);
    });

    it('should return undefined', () => {
      const expectedErrorProperties: Partial<InversifyCoreError> = {
        kind: InversifyCoreErrorKind.injectionDecoratorConflict,
        message: `Expected base type for type "${targetFixture.name}", none found.`,
      };

      expect(result).toBeInstanceOf(InversifyCoreError);
      expect(result).toStrictEqual(
        expect.objectContaining(expectedErrorProperties),
      );
    });
  });
});
