import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

vitest.mock('@inversifyjs/prototype-utils');

import { Newable } from '@inversifyjs/common';
import { getBaseType } from '@inversifyjs/prototype-utils';

vitest.mock('./injectFrom');

import { InjectFromHierarchyOptions } from '../models/InjectFromHierarchyOptions';
import { InjectFromOptions } from '../models/InjectFromOptions';
import { injectFrom } from './injectFrom';
import { injectFromHierarchy } from './injectFromHierarchy';

describe(injectFromHierarchy, () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  let targetFixture: Function;

  beforeAll(() => {
    targetFixture = class {};
  });

  describe('when called, and getBaseType returns a chain of Newables', () => {
    let optionsFixture: InjectFromHierarchyOptions;

    let base1Fixture: Newable;
    let base2Fixture: Newable;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let injectFromResultMock: Mock<(target: Function) => void>;

    beforeAll(() => {
      optionsFixture = {
        extendConstructorArguments: true,
        extendProperties: true,
      };

      base1Fixture = class Base1 {};
      base2Fixture = class Base2 {};

      injectFromResultMock = vitest.fn();

      // Setup getBaseType chain: target -> base1 -> base2 -> undefined
      vitest
        .mocked(getBaseType)
        .mockReturnValueOnce(base1Fixture)
        .mockReturnValueOnce(base2Fixture)
        .mockReturnValueOnce(undefined);

      vitest.mocked(injectFrom).mockReturnValue(injectFromResultMock);

      injectFromHierarchy(optionsFixture)(targetFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should traverse the full prototype chain', () => {
      expect(getBaseType).toHaveBeenCalledTimes(3);
      expect(getBaseType).toHaveBeenNthCalledWith(1, targetFixture);
      expect(getBaseType).toHaveBeenNthCalledWith(2, base1Fixture);
      expect(getBaseType).toHaveBeenNthCalledWith(3, base2Fixture);
    });

    it('should call injectFrom top-down (farthest ancestor first)', () => {
      const expectedFirst: InjectFromOptions = {
        ...optionsFixture,
        type: base2Fixture,
      };
      const expectedSecond: InjectFromOptions = {
        ...optionsFixture,
        type: base1Fixture,
      };

      // injectFrom called twice, then their returned decorators applied to target
      expect(injectFrom).toHaveBeenCalledTimes(2);
      expect(injectFrom).toHaveBeenNthCalledWith(1, expectedFirst);
      expect(injectFrom).toHaveBeenNthCalledWith(2, expectedSecond);

      expect(injectFromResultMock).toHaveBeenCalledTimes(2);
      expect(injectFromResultMock).toHaveBeenNthCalledWith(1, targetFixture);
      expect(injectFromResultMock).toHaveBeenNthCalledWith(2, targetFixture);
    });
  });

  describe('when called with lifecycle options, and getBaseType returns a chain of Newables', () => {
    let optionsFixture: InjectFromHierarchyOptions;

    let base1Fixture: Newable;
    let base2Fixture: Newable;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let injectFromResultMock: Mock<(target: Function) => void>;

    beforeAll(() => {
      optionsFixture = {
        extendConstructorArguments: false,
        extendProperties: false,
        lifecycle: {
          extendPostConstructMethods: true,
          extendPreDestroyMethods: false,
        },
      };

      base1Fixture = class Base1 {};
      base2Fixture = class Base2 {};

      injectFromResultMock = vitest.fn();

      // Setup getBaseType chain: target -> base1 -> base2 -> undefined
      vitest
        .mocked(getBaseType)
        .mockReturnValueOnce(base1Fixture)
        .mockReturnValueOnce(base2Fixture)
        .mockReturnValueOnce(undefined);

      vitest.mocked(injectFrom).mockReturnValue(injectFromResultMock);

      injectFromHierarchy(optionsFixture)(targetFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should traverse the full prototype chain', () => {
      expect(getBaseType).toHaveBeenCalledTimes(3);
      expect(getBaseType).toHaveBeenNthCalledWith(1, targetFixture);
      expect(getBaseType).toHaveBeenNthCalledWith(2, base1Fixture);
      expect(getBaseType).toHaveBeenNthCalledWith(3, base2Fixture);
    });

    it('should call injectFrom top-down with lifecycle options', () => {
      const expectedFirst: InjectFromOptions = {
        ...optionsFixture,
        type: base2Fixture,
      };
      const expectedSecond: InjectFromOptions = {
        ...optionsFixture,
        type: base1Fixture,
      };

      // injectFrom called twice, then their returned decorators applied to target
      expect(injectFrom).toHaveBeenCalledTimes(2);
      expect(injectFrom).toHaveBeenNthCalledWith(1, expectedFirst);
      expect(injectFrom).toHaveBeenNthCalledWith(2, expectedSecond);

      expect(injectFromResultMock).toHaveBeenCalledTimes(2);
      expect(injectFromResultMock).toHaveBeenNthCalledWith(1, targetFixture);
      expect(injectFromResultMock).toHaveBeenNthCalledWith(2, targetFixture);
    });
  });

  describe('when called, and getBaseType() returns Object', () => {
    let optionsFixture: InjectFromHierarchyOptions;

    beforeAll(() => {
      optionsFixture = {
        extendConstructorArguments: true,
        extendProperties: true,
      };

      vitest
        .mocked(getBaseType)
        .mockReturnValueOnce(Object as unknown as Newable);

      injectFromHierarchy(optionsFixture)(targetFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should stop traversal at Object and not call injectFrom', () => {
      expect(getBaseType).toHaveBeenCalledTimes(1);
      expect(getBaseType).toHaveBeenNthCalledWith(1, targetFixture);

      expect(injectFrom).not.toHaveBeenCalled();
    });
  });

  describe('when called, and the chain ends with Object', () => {
    let optionsFixture: InjectFromHierarchyOptions;

    let base1Fixture: Newable;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let injectFromResultMock: Mock<(target: Function) => void>;

    beforeAll(() => {
      optionsFixture = {
        extendConstructorArguments: true,
        extendProperties: true,
      };

      base1Fixture = class Base1 {};
      injectFromResultMock = vitest.fn();

      vitest
        .mocked(getBaseType)
        .mockReturnValueOnce(base1Fixture)
        .mockReturnValueOnce(Object as unknown as Newable);

      vitest.mocked(injectFrom).mockReturnValue(injectFromResultMock);

      injectFromHierarchy(optionsFixture)(targetFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should inject only from Base1 and not proceed to Object', () => {
      expect(getBaseType).toHaveBeenCalledTimes(2);
      expect(getBaseType).toHaveBeenNthCalledWith(1, targetFixture);
      expect(getBaseType).toHaveBeenNthCalledWith(2, base1Fixture);

      expect(injectFrom).toHaveBeenCalledExactlyOnceWith({
        ...optionsFixture,
        type: base1Fixture,
      } satisfies InjectFromOptions);

      expect(injectFromResultMock).toHaveBeenCalledExactlyOnceWith(
        targetFixture,
      );
    });
  });
});
