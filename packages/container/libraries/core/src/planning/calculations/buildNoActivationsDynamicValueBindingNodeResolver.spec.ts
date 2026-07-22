import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

vitest.mock(
  import('../../resolution/actions/resolveScopedWithNoActivations.js'),
);
vitest.mock(import('../../resolution/actions/resolveServiceActivations.js'));

import { DynamicValueBindingFixtures } from '../../binding/fixtures/DynamicValueBindingFixtures.js';
import { type DynamicValueBinding } from '../../binding/models/DynamicValueBinding.js';
import { resolveScopedWithNoActivations } from '../../resolution/actions/resolveScopedWithNoActivations.js';
import { resolveServiceActivations } from '../../resolution/actions/resolveServiceActivations.js';
import { type ResolutionContext } from '../../resolution/models/ResolutionContext.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type LeafBindingNode } from '../models/LeafBindingNode.js';
import { buildNoActivationsDynamicValueBindingNodeResolver } from './buildNoActivationsDynamicValueBindingNodeResolver.js';

describe(buildNoActivationsDynamicValueBindingNodeResolver, () => {
  describe('having areServiceActivations false', () => {
    let nodeFixture: LeafBindingNode<unknown, DynamicValueBinding<unknown>>;
    let areServiceActivationsFixture: boolean;
    let valueMock: Mock<(context: ResolutionContext) => Resolved<unknown>>;

    beforeAll(() => {
      valueMock = vitest.fn();
      nodeFixture = {
        binding: {
          ...DynamicValueBindingFixtures.any,
          value: valueMock,
        },
        resolve: vitest.fn(),
      };
      areServiceActivationsFixture = false;
    });

    describe('when called', () => {
      let scopedResolveFixture: (params: ResolutionParams) => Resolved<unknown>;

      let result: unknown;
      let resolveNode: (params: ResolutionParams) => Resolved<unknown>;

      beforeAll(() => {
        scopedResolveFixture = vitest.fn();

        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsDynamicValueBindingNodeResolver(
          nodeFixture,
          areServiceActivationsFixture,
        );

        resolveNode = vitest.mocked(resolveScopedWithNoActivations).mock
          .calls[0]?.[1] as (params: ResolutionParams) => Resolved<unknown>;
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should not call resolveServiceActivations()', () => {
        expect(resolveServiceActivations).not.toHaveBeenCalled();
      });

      it('should call resolveScopedWithNoActivations()', () => {
        expect(resolveScopedWithNoActivations).toHaveBeenCalledExactlyOnceWith(
          nodeFixture.binding,
          expect.any(Function),
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(scopedResolveFixture);
      });

      describe('when resolveNode is called', () => {
        let contextFixture: ResolutionContext;
        let paramsFixture: ResolutionParams;
        let resolvedValueFixture: Resolved<unknown>;

        let resolveNodeResult: unknown;

        beforeAll(() => {
          contextFixture = Symbol() as unknown as ResolutionContext;
          paramsFixture = {
            context: contextFixture,
          } as Partial<ResolutionParams> as ResolutionParams;
          resolvedValueFixture = Symbol();

          valueMock.mockReturnValueOnce(resolvedValueFixture);

          resolveNodeResult = resolveNode(paramsFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call binding.value()', () => {
          expect(valueMock).toHaveBeenCalledExactlyOnceWith(contextFixture);
        });

        it('should return binding.value() result', () => {
          expect(resolveNodeResult).toBe(resolvedValueFixture);
        });
      });
    });
  });

  describe('having areServiceActivations true', () => {
    let nodeFixture: LeafBindingNode<unknown, DynamicValueBinding<unknown>>;
    let areServiceActivationsFixture: boolean;
    let valueMock: Mock<(context: ResolutionContext) => Resolved<unknown>>;
    let resolveActivationsMock: Mock<
      (params: ResolutionParams, value: Resolved<unknown>) => Resolved<unknown>
    >;

    beforeAll(() => {
      valueMock = vitest.fn();
      resolveActivationsMock = vitest.fn();
      nodeFixture = {
        binding: {
          ...DynamicValueBindingFixtures.any,
          value: valueMock,
        },
        resolve: vitest.fn(),
      };
      areServiceActivationsFixture = true;
    });

    describe('when called', () => {
      let scopedResolveFixture: (params: ResolutionParams) => Resolved<unknown>;

      let result: unknown;
      let resolveNode: (params: ResolutionParams) => Resolved<unknown>;

      beforeAll(() => {
        scopedResolveFixture = vitest.fn();

        vitest
          .mocked(resolveServiceActivations)
          .mockReturnValueOnce(resolveActivationsMock);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsDynamicValueBindingNodeResolver(
          nodeFixture,
          areServiceActivationsFixture,
        );

        resolveNode = vitest.mocked(resolveScopedWithNoActivations).mock
          .calls[0]?.[1] as (params: ResolutionParams) => Resolved<unknown>;
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveServiceActivations()', () => {
        expect(resolveServiceActivations).toHaveBeenCalledExactlyOnceWith(
          nodeFixture.binding.serviceIdentifier,
        );
      });

      it('should call resolveScopedWithNoActivations()', () => {
        expect(resolveScopedWithNoActivations).toHaveBeenCalledExactlyOnceWith(
          nodeFixture.binding,
          expect.any(Function),
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(scopedResolveFixture);
      });

      describe('when resolveNode is called', () => {
        let contextFixture: ResolutionContext;
        let paramsFixture: ResolutionParams;
        let resolvedValueFixture: Resolved<unknown>;
        let activatedValueFixture: Resolved<unknown>;

        let resolveNodeResult: unknown;

        beforeAll(() => {
          contextFixture = Symbol() as unknown as ResolutionContext;
          paramsFixture = {
            context: contextFixture,
          } as Partial<ResolutionParams> as ResolutionParams;
          resolvedValueFixture = Symbol();
          activatedValueFixture = Symbol();

          valueMock.mockReturnValueOnce(resolvedValueFixture);
          resolveActivationsMock.mockReturnValueOnce(activatedValueFixture);

          resolveNodeResult = resolveNode(paramsFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call binding.value()', () => {
          expect(valueMock).toHaveBeenCalledExactlyOnceWith(contextFixture);
        });

        it('should call resolveActivations()', () => {
          expect(resolveActivationsMock).toHaveBeenCalledExactlyOnceWith(
            paramsFixture,
            resolvedValueFixture,
          );
        });

        it('should return activated value', () => {
          expect(resolveNodeResult).toBe(activatedValueFixture);
        });
      });
    });
  });
});
