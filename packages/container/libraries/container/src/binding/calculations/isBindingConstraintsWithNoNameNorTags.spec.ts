import { beforeAll, describe, expect, it } from 'vitest';

import { BindingConstraints } from '@inversifyjs/core';

import { isBindingConstraintsWithNoNameNorTags } from './isBindingConstraintsWithNoNameNorTags';

describe(isBindingConstraintsWithNoNameNorTags.name, () => {
  describe('having a BindingConstraints with name', () => {
    let bindingConstraintsFixture: BindingConstraints;

    beforeAll(() => {
      bindingConstraintsFixture = {
        name: 'name-fixture',
        tags: new Map(),
      } as Partial<BindingConstraints> as BindingConstraints;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = isBindingConstraintsWithNoNameNorTags(
          bindingConstraintsFixture,
        );
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });
  });

  describe('having a BindingConstraints with tag', () => {
    let bindingConstraintsFixture: BindingConstraints;

    beforeAll(() => {
      bindingConstraintsFixture = {
        tags: new Map([['tag', Symbol()]]),
      } as Partial<BindingConstraints> as BindingConstraints;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = isBindingConstraintsWithNoNameNorTags(
          bindingConstraintsFixture,
        );
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });
  });

  describe('having a BindingConstraints with no name nor tags', () => {
    let bindingConstraintsFixture: BindingConstraints;

    beforeAll(() => {
      bindingConstraintsFixture = {
        name: undefined,
        tags: new Map(),
      } as Partial<BindingConstraints> as BindingConstraints;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = isBindingConstraintsWithNoNameNorTags(
          bindingConstraintsFixture,
        );
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });
  });
});
