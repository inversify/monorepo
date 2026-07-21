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
vitest.mock(
  import('../../resolution/actions/resolveResolvedValueBindingNode.js'),
);
vitest.mock(import('./buildFourResolvedValueArgumentResolver.js'));
vitest.mock(import('./buildOneResolvedValueArgumentResolver.js'));
vitest.mock(import('./buildThreeResolvedValueArgumentResolver.js'));
vitest.mock(import('./buildTwoResolvedValueArgumentResolver.js'));
vitest.mock(import('./buildZeroResolvedValueArgumentsResolver.js'));

import { ResolvedValueBindingFixtures } from '../../binding/fixtures/ResolvedValueBindingFixtures.js';
import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ResolvedValueElementMetadata } from '../../metadata/models/ResolvedValueElementMetadata.js';
import { resolveResolvedValueBindingNode } from '../../resolution/actions/resolveResolvedValueBindingNode.js';
import { resolveScopedWithNoActivations } from '../../resolution/actions/resolveScopedWithNoActivations.js';
import { resolveServiceActivations } from '../../resolution/actions/resolveServiceActivations.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode.js';
import { buildFourResolvedValueArgumentResolver } from './buildFourResolvedValueArgumentResolver.js';
import { buildNoActivationsResolvedValueBindingNodeResolver } from './buildNoActivationsResolvedValueBindingNodeResolver.js';
import { buildOneResolvedValueArgumentResolver } from './buildOneResolvedValueArgumentResolver.js';
import { buildThreeResolvedValueArgumentResolver } from './buildThreeResolvedValueArgumentResolver.js';
import { buildTwoResolvedValueArgumentResolver } from './buildTwoResolvedValueArgumentResolver.js';
import { buildZeroResolvedValueArgumentsResolver } from './buildZeroResolvedValueArgumentsResolver.js';

function buildNodeFixture(
  argumentsLength: number,
): ResolvedValueBindingNode<ResolvedValueBinding<unknown>> {
  return {
    binding: {
      ...ResolvedValueBindingFixtures.any,
      metadata: {
        arguments: new Array<ResolvedValueElementMetadata>(
          argumentsLength,
        ).fill(Symbol() as unknown as ResolvedValueElementMetadata),
      },
    },
    params: [],
  } as Partial<
    ResolvedValueBindingNode<ResolvedValueBinding<unknown>>
  > as ResolvedValueBindingNode<ResolvedValueBinding<unknown>>;
}

describe(buildNoActivationsResolvedValueBindingNodeResolver, () => {
  describe('having node with zero arguments and areServiceActivations false', () => {
    let nodeFixture: ResolvedValueBindingNode<ResolvedValueBinding<unknown>>;
    let areServiceActivationsFixture: boolean;

    beforeAll(() => {
      nodeFixture = buildNodeFixture(0);
      areServiceActivationsFixture = false;
    });

    describe('when called', () => {
      let resolveNodeFixture: (params: ResolutionParams) => Resolved<unknown>;
      let scopedResolveFixture: (params: ResolutionParams) => Resolved<unknown>;

      let result: unknown;

      beforeAll(() => {
        resolveNodeFixture = vitest.fn();
        scopedResolveFixture = vitest.fn();

        vitest
          .mocked(buildZeroResolvedValueArgumentsResolver)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsResolvedValueBindingNodeResolver(
          nodeFixture,
          areServiceActivationsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should not call resolveServiceActivations()', () => {
        expect(resolveServiceActivations).not.toHaveBeenCalled();
      });

      it('should call buildZeroResolvedValueArgumentsResolver()', () => {
        expect(
          buildZeroResolvedValueArgumentsResolver,
        ).toHaveBeenCalledExactlyOnceWith(nodeFixture, undefined);
      });

      it('should not call other argument resolvers()', () => {
        expect(buildOneResolvedValueArgumentResolver).not.toHaveBeenCalled();
        expect(buildTwoResolvedValueArgumentResolver).not.toHaveBeenCalled();
        expect(buildThreeResolvedValueArgumentResolver).not.toHaveBeenCalled();
        expect(buildFourResolvedValueArgumentResolver).not.toHaveBeenCalled();
      });

      it('should call resolveScopedWithNoActivations()', () => {
        expect(resolveScopedWithNoActivations).toHaveBeenCalledExactlyOnceWith(
          nodeFixture.binding,
          resolveNodeFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(scopedResolveFixture);
      });
    });
  });

  describe('having node with one argument and areServiceActivations false', () => {
    let nodeFixture: ResolvedValueBindingNode<ResolvedValueBinding<unknown>>;
    let areServiceActivationsFixture: boolean;

    beforeAll(() => {
      nodeFixture = buildNodeFixture(1);
      areServiceActivationsFixture = false;
    });

    describe('when called', () => {
      let resolveNodeFixture: (params: ResolutionParams) => Resolved<unknown>;
      let scopedResolveFixture: (params: ResolutionParams) => Resolved<unknown>;

      let result: unknown;

      beforeAll(() => {
        resolveNodeFixture = vitest.fn();
        scopedResolveFixture = vitest.fn();

        vitest
          .mocked(buildOneResolvedValueArgumentResolver)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsResolvedValueBindingNodeResolver(
          nodeFixture,
          areServiceActivationsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildOneResolvedValueArgumentResolver()', () => {
        expect(
          buildOneResolvedValueArgumentResolver,
        ).toHaveBeenCalledExactlyOnceWith(nodeFixture, undefined);
      });

      it('should call resolveScopedWithNoActivations()', () => {
        expect(resolveScopedWithNoActivations).toHaveBeenCalledExactlyOnceWith(
          nodeFixture.binding,
          resolveNodeFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(scopedResolveFixture);
      });
    });
  });

  describe('having node with two arguments and areServiceActivations false', () => {
    let nodeFixture: ResolvedValueBindingNode<ResolvedValueBinding<unknown>>;
    let areServiceActivationsFixture: boolean;

    beforeAll(() => {
      nodeFixture = buildNodeFixture(2);
      areServiceActivationsFixture = false;
    });

    describe('when called', () => {
      let resolveNodeFixture: (params: ResolutionParams) => Resolved<unknown>;
      let scopedResolveFixture: (params: ResolutionParams) => Resolved<unknown>;

      let result: unknown;

      beforeAll(() => {
        resolveNodeFixture = vitest.fn();
        scopedResolveFixture = vitest.fn();

        vitest
          .mocked(buildTwoResolvedValueArgumentResolver)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsResolvedValueBindingNodeResolver(
          nodeFixture,
          areServiceActivationsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildTwoResolvedValueArgumentResolver()', () => {
        expect(
          buildTwoResolvedValueArgumentResolver,
        ).toHaveBeenCalledExactlyOnceWith(nodeFixture, undefined);
      });

      it('should call resolveScopedWithNoActivations()', () => {
        expect(resolveScopedWithNoActivations).toHaveBeenCalledExactlyOnceWith(
          nodeFixture.binding,
          resolveNodeFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(scopedResolveFixture);
      });
    });
  });

  describe('having node with three arguments and areServiceActivations false', () => {
    let nodeFixture: ResolvedValueBindingNode<ResolvedValueBinding<unknown>>;
    let areServiceActivationsFixture: boolean;

    beforeAll(() => {
      nodeFixture = buildNodeFixture(3);
      areServiceActivationsFixture = false;
    });

    describe('when called', () => {
      let resolveNodeFixture: (params: ResolutionParams) => Resolved<unknown>;
      let scopedResolveFixture: (params: ResolutionParams) => Resolved<unknown>;

      let result: unknown;

      beforeAll(() => {
        resolveNodeFixture = vitest.fn();
        scopedResolveFixture = vitest.fn();

        vitest
          .mocked(buildThreeResolvedValueArgumentResolver)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsResolvedValueBindingNodeResolver(
          nodeFixture,
          areServiceActivationsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildThreeResolvedValueArgumentResolver()', () => {
        expect(
          buildThreeResolvedValueArgumentResolver,
        ).toHaveBeenCalledExactlyOnceWith(nodeFixture, undefined);
      });

      it('should call resolveScopedWithNoActivations()', () => {
        expect(resolveScopedWithNoActivations).toHaveBeenCalledExactlyOnceWith(
          nodeFixture.binding,
          resolveNodeFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(scopedResolveFixture);
      });
    });
  });

  describe('having node with four arguments and areServiceActivations false', () => {
    let nodeFixture: ResolvedValueBindingNode<ResolvedValueBinding<unknown>>;
    let areServiceActivationsFixture: boolean;

    beforeAll(() => {
      nodeFixture = buildNodeFixture(4);
      areServiceActivationsFixture = false;
    });

    describe('when called', () => {
      let resolveNodeFixture: (params: ResolutionParams) => Resolved<unknown>;
      let scopedResolveFixture: (params: ResolutionParams) => Resolved<unknown>;

      let result: unknown;

      beforeAll(() => {
        resolveNodeFixture = vitest.fn();
        scopedResolveFixture = vitest.fn();

        vitest
          .mocked(buildFourResolvedValueArgumentResolver)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsResolvedValueBindingNodeResolver(
          nodeFixture,
          areServiceActivationsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildFourResolvedValueArgumentResolver()', () => {
        expect(
          buildFourResolvedValueArgumentResolver,
        ).toHaveBeenCalledExactlyOnceWith(nodeFixture, undefined);
      });

      it('should call resolveScopedWithNoActivations()', () => {
        expect(resolveScopedWithNoActivations).toHaveBeenCalledExactlyOnceWith(
          nodeFixture.binding,
          resolveNodeFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(scopedResolveFixture);
      });
    });
  });

  describe('having node with more than four arguments and areServiceActivations false', () => {
    let nodeFixture: ResolvedValueBindingNode<ResolvedValueBinding<unknown>>;
    let areServiceActivationsFixture: boolean;

    beforeAll(() => {
      nodeFixture = buildNodeFixture(5);
      areServiceActivationsFixture = false;
    });

    describe('when called', () => {
      let scopedResolveFixture: (params: ResolutionParams) => Resolved<unknown>;
      let resolveNode: (params: ResolutionParams) => Resolved<unknown>;

      let result: unknown;

      beforeAll(() => {
        scopedResolveFixture = vitest.fn();

        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsResolvedValueBindingNodeResolver(
          nodeFixture,
          areServiceActivationsFixture,
        );

        resolveNode = vitest.mocked(resolveScopedWithNoActivations).mock
          .calls[0]?.[1] as (params: ResolutionParams) => Resolved<unknown>;
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should not call specialized argument resolvers()', () => {
        expect(buildZeroResolvedValueArgumentsResolver).not.toHaveBeenCalled();
        expect(buildOneResolvedValueArgumentResolver).not.toHaveBeenCalled();
        expect(buildTwoResolvedValueArgumentResolver).not.toHaveBeenCalled();
        expect(buildThreeResolvedValueArgumentResolver).not.toHaveBeenCalled();
        expect(buildFourResolvedValueArgumentResolver).not.toHaveBeenCalled();
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
        let paramsFixture: ResolutionParams;
        let resolvedValueFixture: unknown;

        let resolveNodeResult: unknown;

        beforeAll(() => {
          paramsFixture = Symbol() as unknown as ResolutionParams;
          resolvedValueFixture = Symbol();

          vitest
            .mocked(resolveResolvedValueBindingNode)
            .mockReturnValueOnce(resolvedValueFixture);

          resolveNodeResult = resolveNode(paramsFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call resolveResolvedValueBindingNode()', () => {
          expect(
            resolveResolvedValueBindingNode,
          ).toHaveBeenCalledExactlyOnceWith(paramsFixture, nodeFixture);
        });

        it('should return expected result', () => {
          expect(resolveNodeResult).toBe(resolvedValueFixture);
        });
      });
    });
  });

  describe('having node with more than four arguments and areServiceActivations true', () => {
    let nodeFixture: ResolvedValueBindingNode<ResolvedValueBinding<unknown>>;
    let areServiceActivationsFixture: boolean;

    beforeAll(() => {
      nodeFixture = buildNodeFixture(5);
      areServiceActivationsFixture = true;
    });

    describe('when called', () => {
      let resolveActivationsFixture: Mock<
        (
          params: ResolutionParams,
          value: Resolved<unknown>,
        ) => Resolved<unknown>
      >;
      let scopedResolveFixture: (params: ResolutionParams) => Resolved<unknown>;
      let resolveNode: (params: ResolutionParams) => Resolved<unknown>;

      let result: unknown;

      beforeAll(() => {
        resolveActivationsFixture = vitest.fn();
        scopedResolveFixture = vitest.fn();

        vitest
          .mocked(resolveServiceActivations)
          .mockReturnValueOnce(resolveActivationsFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsResolvedValueBindingNodeResolver(
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
        let paramsFixture: ResolutionParams;
        let resolvedValueFixture: unknown;
        let activatedValueFixture: unknown;

        let resolveNodeResult: unknown;

        beforeAll(() => {
          paramsFixture = Symbol() as unknown as ResolutionParams;
          resolvedValueFixture = Symbol();
          activatedValueFixture = Symbol();

          vitest
            .mocked(resolveResolvedValueBindingNode)
            .mockReturnValueOnce(resolvedValueFixture);
          resolveActivationsFixture.mockReturnValueOnce(activatedValueFixture);

          resolveNodeResult = resolveNode(paramsFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call resolveResolvedValueBindingNode()', () => {
          expect(
            resolveResolvedValueBindingNode,
          ).toHaveBeenCalledExactlyOnceWith(paramsFixture, nodeFixture);
        });

        it('should call resolveActivations()', () => {
          expect(resolveActivationsFixture).toHaveBeenCalledExactlyOnceWith(
            paramsFixture,
            resolvedValueFixture,
          );
        });

        it('should return expected result', () => {
          expect(resolveNodeResult).toBe(activatedValueFixture);
        });
      });
    });
  });

  describe('having node with zero arguments and areServiceActivations true', () => {
    let nodeFixture: ResolvedValueBindingNode<ResolvedValueBinding<unknown>>;
    let areServiceActivationsFixture: boolean;

    beforeAll(() => {
      nodeFixture = buildNodeFixture(0);
      areServiceActivationsFixture = true;
    });

    describe('when called', () => {
      let resolveActivationsFixture: Mock<
        (
          params: ResolutionParams,
          value: Resolved<unknown>,
        ) => Resolved<unknown>
      >;
      let resolveNodeFixture: (params: ResolutionParams) => Resolved<unknown>;
      let scopedResolveFixture: (params: ResolutionParams) => Resolved<unknown>;

      let result: unknown;

      beforeAll(() => {
        resolveActivationsFixture = vitest.fn();
        resolveNodeFixture = vitest.fn();
        scopedResolveFixture = vitest.fn();

        vitest
          .mocked(resolveServiceActivations)
          .mockReturnValueOnce(resolveActivationsFixture);
        vitest
          .mocked(buildZeroResolvedValueArgumentsResolver)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsResolvedValueBindingNodeResolver(
          nodeFixture,
          areServiceActivationsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveServiceActivations()', () => {
        expect(resolveServiceActivations).toHaveBeenCalledExactlyOnceWith(
          nodeFixture.binding.serviceIdentifier,
        );
      });

      it('should call buildZeroResolvedValueArgumentsResolver()', () => {
        expect(
          buildZeroResolvedValueArgumentsResolver,
        ).toHaveBeenCalledExactlyOnceWith(
          nodeFixture,
          resolveActivationsFixture,
        );
      });

      it('should call resolveScopedWithNoActivations()', () => {
        expect(resolveScopedWithNoActivations).toHaveBeenCalledExactlyOnceWith(
          nodeFixture.binding,
          resolveNodeFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(scopedResolveFixture);
      });
    });
  });
});
