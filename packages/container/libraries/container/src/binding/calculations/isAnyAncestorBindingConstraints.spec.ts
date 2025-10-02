import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  Mocked,
  vitest,
} from 'vitest';

import { BindingConstraints } from '@inversifyjs/core';

import { isAnyAncestorBindingConstraints } from './isAnyAncestorBindingConstraints';

describe(isAnyAncestorBindingConstraints, () => {
  let conditionMock: Mock<(constraints: BindingConstraints) => boolean>;
  let constraintsMock: Mocked<BindingConstraints>;

  beforeAll(() => {
    conditionMock = vitest.fn();
    constraintsMock = {
      getAncestor: vitest.fn(),
    } as Partial<Mocked<BindingConstraints>> as Mocked<BindingConstraints>;
  });

  describe('when called, and constraints.getAncestor() returns undefined', () => {
    let result: unknown;

    beforeAll(() => {
      constraintsMock.getAncestor.mockReturnValueOnce(undefined);

      result = isAnyAncestorBindingConstraints(conditionMock)(constraintsMock);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call constraints.getAncestor()', () => {
      expect(constraintsMock.getAncestor).toHaveBeenCalledExactlyOnceWith();
    });

    it('should not call constraint()', () => {
      expect(conditionMock).not.toHaveBeenCalled();
    });

    it('should return false', () => {
      expect(result).toBe(false);
    });
  });

  describe('when called, and constraints.getAncestor() returns BindingConstraints and then undefined and constraint() returns false', () => {
    let result: unknown;

    beforeAll(() => {
      constraintsMock.getAncestor
        .mockReturnValueOnce(constraintsMock)
        .mockReturnValueOnce(undefined);

      conditionMock.mockReturnValueOnce(false);

      result = isAnyAncestorBindingConstraints(conditionMock)(constraintsMock);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call constraints.getAncestor()', () => {
      expect(constraintsMock.getAncestor).toHaveBeenCalledTimes(2);
      expect(constraintsMock.getAncestor).toHaveBeenNthCalledWith(1);
      expect(constraintsMock.getAncestor).toHaveBeenNthCalledWith(2);
    });

    it('should call condition()', () => {
      expect(conditionMock).toHaveBeenCalledExactlyOnceWith(constraintsMock);
    });

    it('should return expected result', () => {
      expect(result).toBe(false);
    });
  });

  describe('when called, and constraints.getAncestor() returns BindingConstraints and constraint() returns true', () => {
    let result: unknown;

    beforeAll(() => {
      constraintsMock.getAncestor.mockReturnValueOnce(constraintsMock);

      conditionMock.mockReturnValueOnce(true);

      result = isAnyAncestorBindingConstraints(conditionMock)(constraintsMock);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call constraints.getAncestor()', () => {
      expect(constraintsMock.getAncestor).toHaveBeenCalledExactlyOnceWith();
    });

    it('should call condition()', () => {
      expect(conditionMock).toHaveBeenCalledExactlyOnceWith(constraintsMock);
    });

    it('should return expected result', () => {
      expect(result).toBe(true);
    });
  });
});
