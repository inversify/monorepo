import { beforeAll, describe, expect, it } from 'vitest';

import { BindingConstraints, MetadataName } from '@inversifyjs/core';

import { isBindingConstraintsWithTag } from './isBindingConstraintsWithTag';

describe(isBindingConstraintsWithTag.name, () => {
  describe('having a BindingConstraints with same tag and tag value', () => {
    let tagFixture: MetadataName;
    let tagValueFixture: unknown;

    let bindingConstraintsFixture: BindingConstraints;

    beforeAll(() => {
      tagFixture = 'name-fixture';
      tagValueFixture = Symbol();

      bindingConstraintsFixture = {
        tags: new Map([[tagFixture, tagValueFixture]]),
      } as Partial<BindingConstraints> as BindingConstraints;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = isBindingConstraintsWithTag(
          tagFixture,
          tagValueFixture,
        )(bindingConstraintsFixture);
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });
  });

  describe('having a BindingConstraints with same tag but different tag value', () => {
    let tagFixture: MetadataName;
    let tagValueFixture: unknown;

    let bindingConstraintsFixture: BindingConstraints;

    beforeAll(() => {
      tagFixture = 'name-fixture';
      tagValueFixture = Symbol();

      bindingConstraintsFixture = {
        tags: new Map([[tagFixture, Symbol()]]),
      } as Partial<BindingConstraints> as BindingConstraints;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = isBindingConstraintsWithTag(
          tagFixture,
          tagValueFixture,
        )(bindingConstraintsFixture);
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });
  });

  describe('having a BindingConstraints with no different tag', () => {
    let tagFixture: MetadataName;
    let tagValueFixture: unknown;

    let bindingConstraintsFixture: BindingConstraints;

    beforeAll(() => {
      tagFixture = 'name-fixture';
      tagValueFixture = Symbol();

      bindingConstraintsFixture = {
        tags: new Map(),
      } as Partial<BindingConstraints> as BindingConstraints;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = isBindingConstraintsWithTag(
          tagFixture,
          tagValueFixture,
        )(bindingConstraintsFixture);
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });
  });
});
