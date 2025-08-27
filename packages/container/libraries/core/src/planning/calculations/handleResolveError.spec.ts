import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('../../error/calculations/isStackOverflowError');

import { bindingTypeValues } from '../../binding/models/BindingType';
import { isStackOverflowError } from '../../error/calculations/isStackOverflowError';
import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { ResolutionParams } from '../../resolution/models/ResolutionParams';
import { InstanceBindingNode } from '../models/InstanceBindingNode';
import { PlanResult } from '../models/PlanResult';
import { PlanServiceNode } from '../models/PlanServiceNode';
import { PlanServiceRedirectionBindingNode } from '../models/PlanServiceRedirectionBindingNode';
import { ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode';
import { handleResolveError } from './handleResolveError';

function buildInstanceBindingNode(
  constructorChildren: (PlanServiceNode | undefined)[],
  propertyChildren?: Record<string | symbol, PlanServiceNode>,
): InstanceBindingNode {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    binding: { type: bindingTypeValues.Instance } as any,
    classMetadata: {
      constructorArguments: [],
      lifecycle: 'managed',
      properties: new Map(),
      scope: undefined,
    },
    constructorParams: constructorChildren,
    propertyParams: new Map(
      Object.entries(propertyChildren ?? {}).map(
        ([k, v]: [string, PlanServiceNode]) => [k, v],
      ),
    ),
  } as unknown as InstanceBindingNode;
}

function buildResolvedValueBindingNode(
  children: PlanServiceNode[],
): ResolvedValueBindingNode {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    binding: { type: bindingTypeValues.ResolvedValue } as any,
    params: children,
  } as unknown as ResolvedValueBindingNode;
}

function buildServiceRedirectionBindingNode(
  redirections: PlanServiceRedirectionBindingNode['redirections'],
): PlanServiceRedirectionBindingNode {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    binding: { type: bindingTypeValues.Instance } as any,
    redirections,
  } as unknown as PlanServiceRedirectionBindingNode;
}

function buildParams(root: PlanServiceNode): ResolutionParams {
  const planResult: PlanResult = { tree: { root } } as PlanResult;
  return {
    context: {} as unknown,
    getActivations: vitest.fn(),
    planResult,
    requestScopeCache: new Map(),
  } as unknown as ResolutionParams;
}

describe(handleResolveError, () => {
  let errorFixture: unknown;

  beforeAll(() => {
    errorFixture = Symbol('error');
  });

  describe('having a plan tree with no circular dependency', () => {
    let paramsFixture: ResolutionParams;

    beforeAll(() => {
      const serviceNodeC: PlanServiceNode = {
        bindings: undefined,
        isContextFree: true,
        serviceIdentifier: 'C',
      };
      const serviceNodeB: PlanServiceNode = {
        bindings: buildInstanceBindingNode([serviceNodeC]),
        isContextFree: true,
        serviceIdentifier: 'B',
      };
      const serviceNodeA: PlanServiceNode = {
        bindings: buildInstanceBindingNode([serviceNodeB]),
        isContextFree: true,
        serviceIdentifier: 'A',
      };
      paramsFixture = buildParams(serviceNodeA);
    });

    describe('when called, and isStackOverflowError() returns false', () => {
      let result: unknown;

      beforeAll(() => {
        vitest.mocked(isStackOverflowError).mockReturnValueOnce(false);
        try {
          handleResolveError(paramsFixture, errorFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw the original error', () => {
        expect(result).toBe(errorFixture);
      });
    });

    describe('when called, and isStackOverflowError() returns true', () => {
      let result: unknown;

      beforeAll(() => {
        vitest.mocked(isStackOverflowError).mockReturnValueOnce(true);
        try {
          handleResolveError(paramsFixture, errorFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw an InversifyCoreError with no dependency trace', () => {
        expect(result).toStrictEqual(
          expect.objectContaining<Partial<InversifyCoreError>>({
            cause: errorFixture,
            kind: InversifyCoreErrorKind.planning,
            message: 'Circular dependency found: (No dependency trace)',
          }),
        );
      });
    });
  });

  describe('having a plan tree with a simple A -> B -> A circular dependency', () => {
    let paramsFixture: ResolutionParams;

    beforeAll(() => {
      const serviceNodeA: PlanServiceNode = {
        bindings: undefined, // temp placeholder, will set later
        isContextFree: true,
        serviceIdentifier: 'A',
      };
      const serviceNodeB: PlanServiceNode = {
        bindings: buildInstanceBindingNode([serviceNodeA]),
        isContextFree: true,
        serviceIdentifier: 'B',
      };
      (serviceNodeA as { bindings: InstanceBindingNode }).bindings =
        buildInstanceBindingNode([serviceNodeB]);
      paramsFixture = buildParams(serviceNodeA);
    });

    describe('when called, and isStackOverflowError() returns true', () => {
      let result: unknown;

      beforeAll(() => {
        vitest.mocked(isStackOverflowError).mockReturnValueOnce(true);
        try {
          handleResolveError(paramsFixture, errorFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw an InversifyCoreError with dependency trace A -> B -> A', () => {
        expect(result).toStrictEqual(
          expect.objectContaining<Partial<InversifyCoreError>>({
            cause: errorFixture,
            kind: InversifyCoreErrorKind.planning,
            message: 'Circular dependency found: A -> B -> A',
          }),
        );
      });
    });
  });

  describe('having a plan tree with A -> B -> C -> B (inner cycle)', () => {
    let paramsFixture: ResolutionParams;

    beforeAll(() => {
      const serviceNodeB: PlanServiceNode = {
        bindings: undefined,
        isContextFree: true,
        serviceIdentifier: 'B',
      };
      const serviceNodeC: PlanServiceNode = {
        bindings: buildInstanceBindingNode([serviceNodeB]),
        isContextFree: true,
        serviceIdentifier: 'C',
      };
      (serviceNodeB as { bindings: InstanceBindingNode }).bindings =
        buildInstanceBindingNode([serviceNodeC]);
      const serviceNodeA: PlanServiceNode = {
        bindings: buildResolvedValueBindingNode([serviceNodeB]),
        isContextFree: true,
        serviceIdentifier: 'A',
      };
      paramsFixture = buildParams(serviceNodeA);
    });

    describe('when called, and isStackOverflowError() returns true', () => {
      let result: unknown;

      beforeAll(() => {
        vitest.mocked(isStackOverflowError).mockReturnValueOnce(true);
        try {
          handleResolveError(paramsFixture, errorFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw an InversifyCoreError with inner cycle trace B -> C -> B', () => {
        expect(result).toStrictEqual(
          expect.objectContaining<Partial<InversifyCoreError>>({
            cause: errorFixture,
            kind: InversifyCoreErrorKind.planning,
            message: 'Circular dependency found: B -> C -> B',
          }),
        );
      });
    });
  });

  describe('having a plan tree with a service redirection chain A -> (redir to B,C) -> B -> C -> B', () => {
    let paramsFixture: ResolutionParams;

    beforeAll(() => {
      const serviceNodeB: PlanServiceNode = {
        bindings: undefined,
        isContextFree: true,
        serviceIdentifier: 'B',
      };
      const serviceNodeC: PlanServiceNode = {
        bindings: undefined,
        isContextFree: true,
        serviceIdentifier: 'C',
      };
      // Assign bindings after nodes exist so they can reference each other
      (serviceNodeB as { bindings: InstanceBindingNode }).bindings =
        buildInstanceBindingNode([serviceNodeC]);
      (serviceNodeC as { bindings: InstanceBindingNode }).bindings =
        buildInstanceBindingNode([serviceNodeB]);

      // Redirection binding that redirects A to either B or C
      const redirectionBinding: PlanServiceRedirectionBindingNode =
        buildServiceRedirectionBindingNode([
          (serviceNodeB as { bindings: InstanceBindingNode }).bindings,
          (serviceNodeC as { bindings: InstanceBindingNode }).bindings,
        ]);

      const serviceNodeA: PlanServiceNode = {
        bindings: redirectionBinding,
        isContextFree: true,
        serviceIdentifier: 'A',
      };
      paramsFixture = buildParams(serviceNodeA);
    });

    describe('when called, and isStackOverflowError() returns true', () => {
      let result: unknown;

      beforeAll(() => {
        vitest.mocked(isStackOverflowError).mockReturnValueOnce(true);
        try {
          handleResolveError(paramsFixture, errorFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw an InversifyCoreError with inner cycle trace C -> B -> C', () => {
        expect(result).toStrictEqual(
          expect.objectContaining<Partial<InversifyCoreError>>({
            cause: errorFixture,
            kind: InversifyCoreErrorKind.planning,
            message: 'Circular dependency found: C -> B -> C',
          }),
        );
      });
    });
  });

  describe('having a plan tree with a property param cycle A.(prop)->B.(prop)->A', () => {
    let paramsFixture: ResolutionParams;

    beforeAll(() => {
      const serviceNodeA: PlanServiceNode = {
        bindings: undefined,
        isContextFree: true,
        serviceIdentifier: 'A',
      };
      const serviceNodeB: PlanServiceNode = {
        bindings: buildInstanceBindingNode([], { a: serviceNodeA }),
        isContextFree: true,
        serviceIdentifier: 'B',
      };
      (serviceNodeA as { bindings: InstanceBindingNode }).bindings =
        buildInstanceBindingNode([], { b: serviceNodeB });
      paramsFixture = buildParams(serviceNodeA);
    });

    describe('when called, and isStackOverflowError() returns true', () => {
      let result: unknown;

      beforeAll(() => {
        vitest.mocked(isStackOverflowError).mockReturnValueOnce(true);
        try {
          handleResolveError(paramsFixture, errorFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw an InversifyCoreError with dependency trace A -> B -> A', () => {
        expect(result).toStrictEqual(
          expect.objectContaining<Partial<InversifyCoreError>>({
            cause: errorFixture,
            kind: InversifyCoreErrorKind.planning,
            message: 'Circular dependency found: A -> B -> A',
          }),
        );
      });
    });
  });
});
