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
vitest.mock('./isNoAncestorBindingConstraints');

import { isBindingConstraintsWithTag } from './isBindingConstraintsWithTag';
import { isNoAncestorBindingConstraints } from './isNoAncestorBindingConstraints';
import { isNoAncestorBindingConstraintsWithTag } from './isNoAncestorBindingConstraintsWithTag';

describe(isNoAncestorBindingConstraintsWithTag, () => {
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
    let isNoAncestorBindingConstraintsResultMock: Mock<
      (constraints: BindingConstraints) => boolean
    >;

    let result: unknown;

    beforeAll(() => {
      isBindingConstraintsWithNameResultMock = vitest.fn();
      isNoAncestorBindingConstraintsResultMock = vitest.fn();

      vitest
        .mocked(isBindingConstraintsWithTag)
        .mockReturnValueOnce(isBindingConstraintsWithNameResultMock);

      vitest
        .mocked(isNoAncestorBindingConstraints)
        .mockReturnValueOnce(isNoAncestorBindingConstraintsResultMock);

      result = isNoAncestorBindingConstraintsWithTag(
        tagFixture,
        tagValueFixture,
      );
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

    it('should call isNoAncestorBindingConstraints()', () => {
      expect(isNoAncestorBindingConstraints).toHaveBeenCalledExactlyOnceWith(
        isBindingConstraintsWithNameResultMock,
      );
    });

    it('should return expected result', () => {
      expect(result).toBe(isNoAncestorBindingConstraintsResultMock);
    });
  });
});
