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
vitest.mock('./isNotParentBindingConstraints');

import { isBindingConstraintsWithName } from './isBindingConstraintsWithName';
import { isNotParentBindingConstraints } from './isNotParentBindingConstraints';
import { isNotParentBindingConstraintsWithName } from './isNotParentBindingConstraintsWithName';

describe(isNotParentBindingConstraintsWithName, () => {
  let nameFixture: MetadataName;

  beforeAll(() => {
    nameFixture = 'name-fixture';
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
        .mocked(isBindingConstraintsWithName)
        .mockReturnValueOnce(isBindingConstraintsWithNameResultMock);

      vitest
        .mocked(isNotParentBindingConstraints)
        .mockReturnValueOnce(isNotParentBindingConstraintsResultMock);

      result = isNotParentBindingConstraintsWithName(nameFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call isBindingConstraintsWithName()', () => {
      expect(isBindingConstraintsWithName).toHaveBeenCalledExactlyOnceWith(
        nameFixture,
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
