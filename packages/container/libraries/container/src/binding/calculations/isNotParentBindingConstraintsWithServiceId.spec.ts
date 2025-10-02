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
vitest.mock('./isNotParentBindingConstraints');

import { ServiceIdentifier } from '@inversifyjs/common';

import { isBindingConstraintsWithServiceId } from './isBindingConstraintsWithServiceId';
import { isNotParentBindingConstraints } from './isNotParentBindingConstraints';
import { isNotParentBindingConstraintsWithServiceId } from './isNotParentBindingConstraintsWithServiceId';

describe(isNotParentBindingConstraintsWithServiceId, () => {
  let serviceIdFixture: ServiceIdentifier;

  beforeAll(() => {
    serviceIdFixture = 'name-fixture';
  });

  describe('when called', () => {
    let isBindingConstraintsWithNameResultMock: Mock<
      (constraints: BindingConstraints) => boolean
    >;
    let isNotParentBindingConstraintsResultMock: Mock<
      (constraints: BindingConstraints) => boolean
    >;

    let result: unknown;

    beforeAll(() => {
      isBindingConstraintsWithNameResultMock = vitest.fn();
      isNotParentBindingConstraintsResultMock = vitest.fn();

      vitest
        .mocked(isBindingConstraintsWithServiceId)
        .mockReturnValueOnce(isBindingConstraintsWithNameResultMock);

      vitest
        .mocked(isNotParentBindingConstraints)
        .mockReturnValueOnce(isNotParentBindingConstraintsResultMock);

      result = isNotParentBindingConstraintsWithServiceId(serviceIdFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call isBindingConstraintsWithServiceId()', () => {
      expect(isBindingConstraintsWithServiceId).toHaveBeenCalledExactlyOnceWith(
        serviceIdFixture,
      );
    });

    it('should call isNotParentBindingConstraints()', () => {
      expect(isNotParentBindingConstraints).toHaveBeenCalledExactlyOnceWith(
        isBindingConstraintsWithNameResultMock,
      );
    });

    it('should return expected result', () => {
      expect(result).toBe(isNotParentBindingConstraintsResultMock);
    });
  });
});
