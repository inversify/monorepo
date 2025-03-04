import { beforeAll, describe, expect, it } from 'vitest';

import { BindingConstraints } from '@inversifyjs/core';

import { BindingConstraintUtils } from './BindingConstraintUtils';

describe(BindingConstraintUtils.name, () => {
  describe('.allways', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = BindingConstraintUtils.always(
          Symbol() as unknown as BindingConstraints,
        );
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });
  });
});
