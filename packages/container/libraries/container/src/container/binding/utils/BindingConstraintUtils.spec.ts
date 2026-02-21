import { beforeAll, describe, expect, it } from 'vitest';

import { type BindingConstraints } from '@inversifyjs/core';

import { BindingConstraintUtils } from './BindingConstraintUtils.js';

describe(BindingConstraintUtils, () => {
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
