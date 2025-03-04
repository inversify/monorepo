import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

import { BindingConstraints, MetadataName } from '@inversifyjs/core';

vitest.mock('./isBindingConstraintsWithName');
vitest.mock('./isAnyAncestorBindingConstraints');

import { isAnyAncestorBindingConstraints } from './isAnyAncestorBindingConstraints';
import { isAnyAncestorBindingConstraintsWithName } from './isAnyAncestorBindingConstraintsWithName';
import { isBindingConstraintsWithName } from './isBindingConstraintsWithName';

describe(isAnyAncestorBindingConstraintsWithName.name, () => {
  let nameFixture: MetadataName;

  beforeAll(() => {
    nameFixture = 'name-fixture';
  });

  describe('when called', () => {
    let isBindingConstraintsWithNameResultMock: Mock<
      (constraints: BindingConstraints) => boolean
    >;
    let isAnyAncestorBindingConstraintsResultMock: Mock<
      (constraints: BindingConstraints) => boolean
    >;

    let result: unknown;

    beforeAll(() => {
      isBindingConstraintsWithNameResultMock = vitest.fn();
      isAnyAncestorBindingConstraintsResultMock = vitest.fn();

      vitest
        .mocked(isBindingConstraintsWithName)
        .mockReturnValueOnce(isBindingConstraintsWithNameResultMock);

      vitest
        .mocked(isAnyAncestorBindingConstraints)
        .mockReturnValueOnce(isAnyAncestorBindingConstraintsResultMock);

      result = isAnyAncestorBindingConstraintsWithName(nameFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call isBindingConstraintsWithName()', () => {
      expect(isBindingConstraintsWithName).toHaveBeenCalledTimes(1);
      expect(isBindingConstraintsWithName).toHaveBeenCalledWith(nameFixture);
    });

    it('should call isAnyAncestorBindingConstraints()', () => {
      expect(isAnyAncestorBindingConstraints).toHaveBeenCalledTimes(1);
      expect(isAnyAncestorBindingConstraints).toHaveBeenCalledWith(
        isBindingConstraintsWithNameResultMock,
      );
    });

    it('should return expected result', () => {
      expect(result).toBe(isAnyAncestorBindingConstraintsResultMock);
    });
  });
});
