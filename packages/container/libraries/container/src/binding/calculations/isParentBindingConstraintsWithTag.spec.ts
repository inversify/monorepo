import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

import { BindingConstraints, MetadataTag } from '@inversifyjs/core';

vitest.mock('./isBindingConstraintsWithTag');
vitest.mock('./isParentBindingConstraints');

import { isBindingConstraintsWithTag } from './isBindingConstraintsWithTag';
import { isParentBindingConstraints } from './isParentBindingConstraints';
import { isParentBindingConstraintsWithTag } from './isParentBindingConstraintsWithTag';

describe(isParentBindingConstraintsWithTag.name, () => {
  let tagFixture: MetadataTag;
  let tagValueFixture: unknown;

  beforeAll(() => {
    tagFixture = 'tag-fixture';
    tagValueFixture = Symbol();
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
        .mocked(isBindingConstraintsWithTag)
        .mockReturnValueOnce(isBindingConstraintsWithNameResultMock);

      vitest
        .mocked(isParentBindingConstraints)
        .mockReturnValueOnce(isParentBindingConstraintsResultMock);

      result = isParentBindingConstraintsWithTag(tagFixture, tagValueFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call isBindingConstraintsWithTag()', () => {
      expect(isBindingConstraintsWithTag).toHaveBeenCalledTimes(1);
      expect(isBindingConstraintsWithTag).toHaveBeenCalledWith(
        tagFixture,
        tagValueFixture,
      );
    });

    it('should call isParentBindingConstraints()', () => {
      expect(isParentBindingConstraints).toHaveBeenCalledTimes(1);
      expect(isParentBindingConstraints).toHaveBeenCalledWith(
        isBindingConstraintsWithNameResultMock,
      );
    });

    it('should return expected result', () => {
      expect(result).toBe(isParentBindingConstraintsResultMock);
    });
  });
});
