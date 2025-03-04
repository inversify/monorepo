import { beforeAll, describe, expect, it } from 'vitest';

import { BindingConstraints, MetadataName } from '@inversifyjs/core';

import { isBindingConstraintsWithName } from './isBindingConstraintsWithName';

describe(isBindingConstraintsWithName.name, () => {
  describe('having a BindingConstraints with same name as name', () => {
    let nameFixture: MetadataName;

    let bindingConstraintsFixture: BindingConstraints;

    beforeAll(() => {
      nameFixture = 'name-fixture';

      bindingConstraintsFixture = {
        name: nameFixture,
      } as Partial<BindingConstraints> as BindingConstraints;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = isBindingConstraintsWithName(nameFixture)(
          bindingConstraintsFixture,
        );
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });
  });

  describe('having a BindingConstraints with different name than name', () => {
    let nameFixture: MetadataName;

    let bindingConstraintsFixture: BindingConstraints;

    beforeAll(() => {
      nameFixture = 'name-fixture';

      bindingConstraintsFixture = {
        name: 'another-name-fixture',
      } as Partial<BindingConstraints> as BindingConstraints;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = isBindingConstraintsWithName(nameFixture)(
          bindingConstraintsFixture,
        );
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });
  });
});
