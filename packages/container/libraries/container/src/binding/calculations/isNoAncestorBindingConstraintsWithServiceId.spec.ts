import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

import { BindingConstraints } from '@inversifyjs/core';

vitest.mock('./isBindingConstraintsWithServiceId');
vitest.mock('./isNoAncestorBindingConstraints');

import { ServiceIdentifier } from '@inversifyjs/common';

import { isBindingConstraintsWithServiceId } from './isBindingConstraintsWithServiceId';
import { isNoAncestorBindingConstraints } from './isNoAncestorBindingConstraints';
import { isNoAncestorBindingConstraintsWithServiceId } from './isNoAncestorBindingConstraintsWithServiceId';

describe(isNoAncestorBindingConstraintsWithServiceId.name, () => {
  let serviceIdFixture: ServiceIdentifier;

  beforeAll(() => {
    serviceIdFixture = 'name-fixture';
  });

  describe('when called', () => {
    let isBindingConstraintsWithNameResultMock: Mock<
      (constraints: BindingConstraints) => boolean
    >;
    let isNoAncestorBindingConstraintsResultMock: Mock<
      (constraints: BindingConstraints) => boolean
    >;

    let result: unknown;

    beforeAll(() => {
      isBindingConstraintsWithNameResultMock = vitest.fn();
      isNoAncestorBindingConstraintsResultMock = vitest.fn();

      vitest
        .mocked(isBindingConstraintsWithServiceId)
        .mockReturnValueOnce(isBindingConstraintsWithNameResultMock);

      vitest
        .mocked(isNoAncestorBindingConstraints)
        .mockReturnValueOnce(isNoAncestorBindingConstraintsResultMock);

      result = isNoAncestorBindingConstraintsWithServiceId(serviceIdFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call isBindingConstraintsWithServiceId()', () => {
      expect(isBindingConstraintsWithServiceId).toHaveBeenCalledTimes(1);
      expect(isBindingConstraintsWithServiceId).toHaveBeenCalledWith(
        serviceIdFixture,
      );
    });

    it('should call isNoAncestorBindingConstraints()', () => {
      expect(isNoAncestorBindingConstraints).toHaveBeenCalledTimes(1);
      expect(isNoAncestorBindingConstraints).toHaveBeenCalledWith(
        isBindingConstraintsWithNameResultMock,
      );
    });

    it('should return expected result', () => {
      expect(result).toBe(isNoAncestorBindingConstraintsResultMock);
    });
  });
});
