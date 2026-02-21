import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

import { type BindingConstraints } from '@inversifyjs/core';

vitest.mock(import('./isBindingConstraintsWithServiceId.js'));
vitest.mock(import('./isParentBindingConstraints.js'));

import { type ServiceIdentifier } from '@inversifyjs/common';

import { isBindingConstraintsWithServiceId } from './isBindingConstraintsWithServiceId.js';
import { isParentBindingConstraints } from './isParentBindingConstraints.js';
import { isParentBindingConstraintsWithServiceId } from './isParentBindingConstraintsWithServiceId.js';

describe(isParentBindingConstraintsWithServiceId, () => {
  let serviceIdFixture: ServiceIdentifier;

  beforeAll(() => {
    serviceIdFixture = 'name-fixture';
  });

  describe('when called', () => {
    let isBindingConstraintsWithNameResultMock: Mock<
      (constraints: BindingConstraints) => boolean
    >;
    let isParentBindingConstraintsResultMock: Mock<
      (constraints: BindingConstraints) => boolean
    >;

    let result: unknown;

    beforeAll(() => {
      isBindingConstraintsWithNameResultMock = vitest.fn();
      isParentBindingConstraintsResultMock = vitest.fn();

      vitest
        .mocked(isBindingConstraintsWithServiceId)
        .mockReturnValueOnce(isBindingConstraintsWithNameResultMock);

      vitest
        .mocked(isParentBindingConstraints)
        .mockReturnValueOnce(isParentBindingConstraintsResultMock);

      result = isParentBindingConstraintsWithServiceId(serviceIdFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call isBindingConstraintsWithServiceId()', () => {
      expect(isBindingConstraintsWithServiceId).toHaveBeenCalledExactlyOnceWith(
        serviceIdFixture,
      );
    });

    it('should call isParentBindingConstraints()', () => {
      expect(isParentBindingConstraints).toHaveBeenCalledExactlyOnceWith(
        isBindingConstraintsWithNameResultMock,
      );
    });

    it('should return expected result', () => {
      expect(result).toBe(isParentBindingConstraintsResultMock);
    });
  });
});
