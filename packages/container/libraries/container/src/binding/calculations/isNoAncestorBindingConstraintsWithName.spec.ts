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
vitest.mock('./isNoAncestorBindingConstraints');

import { isBindingConstraintsWithName } from './isBindingConstraintsWithName';
import { isNoAncestorBindingConstraints } from './isNoAncestorBindingConstraints';
import { isNoAncestorBindingConstraintsWithName } from './isNoAncestorBindingConstraintsWithName';

describe(isNoAncestorBindingConstraintsWithName.name, () => {
  let nameFixture: MetadataName;

  beforeAll(() => {
    nameFixture = 'name-fixture';
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
        .mocked(isBindingConstraintsWithName)
        .mockReturnValueOnce(isBindingConstraintsWithNameResultMock);

      vitest
        .mocked(isNoAncestorBindingConstraints)
        .mockReturnValueOnce(isNoAncestorBindingConstraintsResultMock);

      result = isNoAncestorBindingConstraintsWithName(nameFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call isBindingConstraintsWithName()', () => {
      expect(isBindingConstraintsWithName).toHaveBeenCalledTimes(1);
      expect(isBindingConstraintsWithName).toHaveBeenCalledWith(nameFixture);
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
