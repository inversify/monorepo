import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('../../resolution/actions/resolveScoped.js'));

import { ConstantValueBindingFixtures } from '../../binding/fixtures/ConstantValueBindingFixtures.js';
import { type ConstantValueBinding } from '../../binding/models/ConstantValueBinding.js';
import { resolveScoped } from '../../resolution/actions/resolveScoped.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { ConstantValueBindingNode } from './ConstantValueBindingNode.js';
import { type LeafBindingNode } from './LeafBindingNode.js';

describe(ConstantValueBindingNode, () => {
  describe('having ConstantValueBinding', () => {
    let bindingFixture: ConstantValueBinding<unknown>;
    let resolveFixture: (params: ResolutionParams) => Resolved<unknown>;

    beforeAll(() => {
      bindingFixture = ConstantValueBindingFixtures.any;
      resolveFixture = vitest.fn();
    });

    describe('when called', () => {
      let constantValueBindingNode: ConstantValueBindingNode<unknown>;
      let resolveCallback: (
        params: ResolutionParams,
        node: LeafBindingNode<unknown, ConstantValueBinding<unknown>>,
      ) => Resolved<unknown>;

      beforeAll(() => {
        vitest.mocked(resolveScoped).mockReturnValueOnce(resolveFixture);

        constantValueBindingNode = new ConstantValueBindingNode(bindingFixture);

        resolveCallback = vitest.mocked(resolveScoped).mock.calls[0]?.[1] as (
          params: ResolutionParams,
          node: LeafBindingNode<unknown, ConstantValueBinding<unknown>>,
        ) => Resolved<unknown>;
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveScoped()', () => {
        expect(resolveScoped).toHaveBeenCalledExactlyOnceWith(
          constantValueBindingNode,
          expect.any(Function),
        );
      });

      it('should set resolve', () => {
        expect(constantValueBindingNode.resolve).toBe(resolveFixture);
      });

      it('should set binding', () => {
        expect(constantValueBindingNode.binding).toBe(bindingFixture);
      });

      describe('when resolve callback is called', () => {
        let paramsFixture: ResolutionParams;

        let result: unknown;

        beforeAll(() => {
          paramsFixture = Symbol() as unknown as ResolutionParams;

          result = resolveCallback(paramsFixture, constantValueBindingNode);
        });

        it('should return binding.value', () => {
          expect(result).toBe(bindingFixture.value);
        });
      });
    });
  });
});
