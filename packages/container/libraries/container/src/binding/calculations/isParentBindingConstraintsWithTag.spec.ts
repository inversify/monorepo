import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

import { type BindingConstraints, type MetadataTag } from '@inversifyjs/core';

vitest.mock(import('./isBindingConstraintsWithTag.js'));
vitest.mock(import('./isParentBindingConstraints.js'));

import { isBindingConstraintsWithTag } from './isBindingConstraintsWithTag.js';
import { isParentBindingConstraints } from './isParentBindingConstraints.js';
import { isParentBindingConstraintsWithTag } from './isParentBindingConstraintsWithTag.js';

describe(isParentBindingConstraintsWithTag, () => {
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
      expect(isBindingConstraintsWithTag).toHaveBeenCalledExactlyOnceWith(
        tagFixture,
        tagValueFixture,
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
