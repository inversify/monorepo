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
vitest.mock(import('./buildOneResolvedValueArgumentResolverJit.js'));
vitest.mock(import('./buildResolvedValueArgumentsResolverJit.js'));
vitest.mock(import('./buildZeroResolvedValueArgumentsResolverJit.js'));

import { ResolvedValueBindingFixtures } from '../../binding/fixtures/ResolvedValueBindingFixtures.js';
import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ResolvedValueElementMetadata } from '../../metadata/models/ResolvedValueElementMetadata.js';
import { resolveScopedWithNoActivations } from '../../resolution/actions/resolveScopedWithNoActivations.js';
import { resolveServiceActivations } from '../../resolution/actions/resolveServiceActivations.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode.js';
import { buildNoActivationsResolvedValueBindingNodeResolverJit } from './buildNoActivationsResolvedValueBindingNodeResolverJit.js';
import { buildOneResolvedValueArgumentResolverJit } from './buildOneResolvedValueArgumentResolverJit.js';
import { buildResolvedValueArgumentsResolverJit } from './buildResolvedValueArgumentsResolverJit.js';
import { buildZeroResolvedValueArgumentsResolverJit } from './buildZeroResolvedValueArgumentsResolverJit.js';
import { resolveFour } from './resolveFour.js';
import { resolveMany } from './resolveMany.js';
import { resolveThree } from './resolveThree.js';
import { resolveTwo } from './resolveTwo.js';

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

describe(buildNoActivationsResolvedValueBindingNodeResolverJit, () => {
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
          .mocked(buildZeroResolvedValueArgumentsResolverJit)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsResolvedValueBindingNodeResolverJit(
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

      it('should call buildZeroResolvedValueArgumentsResolverJit()', () => {
        expect(
          buildZeroResolvedValueArgumentsResolverJit,
        ).toHaveBeenCalledExactlyOnceWith(nodeFixture, undefined);
      });

      it('should not call other argument resolvers()', () => {
        expect(buildOneResolvedValueArgumentResolverJit).not.toHaveBeenCalled();
        expect(buildResolvedValueArgumentsResolverJit).not.toHaveBeenCalled();
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
          .mocked(buildOneResolvedValueArgumentResolverJit)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsResolvedValueBindingNodeResolverJit(
          nodeFixture,
          areServiceActivationsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildOneResolvedValueArgumentResolverJit()', () => {
        expect(
          buildOneResolvedValueArgumentResolverJit,
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
          .mocked(buildResolvedValueArgumentsResolverJit)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsResolvedValueBindingNodeResolverJit(
          nodeFixture,
          areServiceActivationsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildResolvedValueArgumentsResolverJit()', () => {
        expect(
          buildResolvedValueArgumentsResolverJit,
        ).toHaveBeenCalledExactlyOnceWith(nodeFixture, resolveTwo, undefined);
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
          .mocked(buildResolvedValueArgumentsResolverJit)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsResolvedValueBindingNodeResolverJit(
          nodeFixture,
          areServiceActivationsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildResolvedValueArgumentsResolverJit()', () => {
        expect(
          buildResolvedValueArgumentsResolverJit,
        ).toHaveBeenCalledExactlyOnceWith(nodeFixture, resolveThree, undefined);
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
          .mocked(buildResolvedValueArgumentsResolverJit)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsResolvedValueBindingNodeResolverJit(
          nodeFixture,
          areServiceActivationsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildResolvedValueArgumentsResolverJit()', () => {
        expect(
          buildResolvedValueArgumentsResolverJit,
        ).toHaveBeenCalledExactlyOnceWith(nodeFixture, resolveFour, undefined);
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
      let resolveNodeFixture: (params: ResolutionParams) => Resolved<unknown>;
      let scopedResolveFixture: (params: ResolutionParams) => Resolved<unknown>;

      let result: unknown;

      beforeAll(() => {
        resolveNodeFixture = vitest.fn();
        scopedResolveFixture = vitest.fn();

        vitest
          .mocked(buildResolvedValueArgumentsResolverJit)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsResolvedValueBindingNodeResolverJit(
          nodeFixture,
          areServiceActivationsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildResolvedValueArgumentsResolverJit()', () => {
        expect(
          buildResolvedValueArgumentsResolverJit,
        ).toHaveBeenCalledExactlyOnceWith(nodeFixture, resolveMany, undefined);
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
          .mocked(buildZeroResolvedValueArgumentsResolverJit)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsResolvedValueBindingNodeResolverJit(
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

      it('should call buildZeroResolvedValueArgumentsResolverJit()', () => {
        expect(
          buildZeroResolvedValueArgumentsResolverJit,
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
