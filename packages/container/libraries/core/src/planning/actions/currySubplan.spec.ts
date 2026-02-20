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
  import('../calculations/tryBuildGetPlanOptionsFromManagedClassElementMetadata.js'),
);
vitest.mock(
  import('../calculations/tryBuildGetPlanOptionsFromResolvedValueElementMetadata.js'),
);
vitest.mock(import('./cacheNonRootPlanServiceNode.js'));

import { InstanceBindingFixtures } from '../../binding/fixtures/InstanceBindingFixtures.js';
import { ResolvedValueBindingFixtures } from '../../binding/fixtures/ResolvedValueBindingFixtures.js';
import { type InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation.js';
import { SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList.js';
import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { ClassMetadataFixtures } from '../../metadata/fixtures/ClassMetadataFixtures.js';
import { type ManagedClassElementMetadata } from '../../metadata/models/ManagedClassElementMetadata.js';
import { type ResolvedValueElementMetadata } from '../../metadata/models/ResolvedValueElementMetadata.js';
import { tryBuildGetPlanOptionsFromManagedClassElementMetadata } from '../calculations/tryBuildGetPlanOptionsFromManagedClassElementMetadata.js';
import { tryBuildGetPlanOptionsFromResolvedValueElementMetadata } from '../calculations/tryBuildGetPlanOptionsFromResolvedValueElementMetadata.js';
import { type GetPlanOptions } from '../models/GetPlanOptions.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';
import { LazyPlanServiceNode } from '../models/LazyPlanServiceNode.js';
import { type PlanParamsOperations } from '../models/PlanParamsOperations.js';
import { type PlanResult } from '../models/PlanResult.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { type ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode.js';
import { type SubplanParams } from '../models/SubplanParams.js';
import { cacheNonRootPlanServiceNode } from './cacheNonRootPlanServiceNode.js';
import { currySubplan } from './currySubplan.js';

describe(currySubplan, () => {
  let buildLazyPlanServiceNodeNodeFromClassElementMetadataMock: Mock<
    (
      params: SubplanParams,
      bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
      elementMetadata: ManagedClassElementMetadata,
    ) => PlanServiceNode
  >;
  let buildLazyPlanServiceNodeNodeFromResolvedValueElementMetadataMock: Mock<
    (
      params: SubplanParams,
      bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
      elementMetadata: ResolvedValueElementMetadata,
    ) => PlanServiceNode
  >;
  let buildPlanServiceNodeFromClassElementMetadataMock: Mock<
    (
      params: SubplanParams,
      bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
      elementMetadata: ManagedClassElementMetadata,
    ) => PlanServiceNode | undefined
  >;
  let buildPlanServiceNodeFromResolvedValueElementMetadataMock: Mock<
    (
      params: SubplanParams,
      bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
      elementMetadata: ResolvedValueElementMetadata,
    ) => PlanServiceNode | undefined
  >;

  beforeAll(() => {
    buildLazyPlanServiceNodeNodeFromClassElementMetadataMock = vitest.fn();
    buildLazyPlanServiceNodeNodeFromResolvedValueElementMetadataMock =
      vitest.fn();
    buildPlanServiceNodeFromClassElementMetadataMock = vitest.fn();
    buildPlanServiceNodeFromResolvedValueElementMetadataMock = vitest.fn();
  });

  describe('having BasePlanParams with InstanceBindingNode with unmanaged constructor arguments', () => {
    let instanceBindingNodeFixture: InstanceBindingNode;

    let subplanParamsFixture: SubplanParams;

    beforeAll(() => {
      instanceBindingNodeFixture = {
        binding: InstanceBindingFixtures.any,
        classMetadata: ClassMetadataFixtures.withUnmanagedConstructorArguments,
        constructorParams: [],
        propertyParams: new Map(),
      };

      subplanParamsFixture = {
        autobindOptions: undefined,
        node: instanceBindingNodeFixture,
        operations: {
          getPlan: vitest.fn(),
        } as Partial<PlanParamsOperations> as PlanParamsOperations,
        servicesBranch: [],
      };
    });

    describe('when called, and tryBuildGetPlanOptionsFromManagedClassElementMetadata() returns undefined', () => {
      let bindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;

      let result: unknown;

      beforeAll(() => {
        bindingConstraintsListFixture =
          new SingleImmutableLinkedList<InternalBindingConstraints>(
            {
              elem: Symbol() as unknown as InternalBindingConstraints,
              previous: undefined,
            },
            1,
          );

        result = currySubplan(
          buildLazyPlanServiceNodeNodeFromClassElementMetadataMock,
          buildLazyPlanServiceNodeNodeFromResolvedValueElementMetadataMock,
          buildPlanServiceNodeFromClassElementMetadataMock,
          buildPlanServiceNodeFromResolvedValueElementMetadataMock,
        )(subplanParamsFixture, bindingConstraintsListFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return PlanBindingNode', () => {
        expect(result).toBe(instanceBindingNodeFixture);
      });
    });
  });

  describe('having bindingConstraintsList with length exceeding MAX_PLAN_DEPTH', () => {
    let instanceBindingNodeFixture: InstanceBindingNode;

    let subplanParamsMock: SubplanParams;

    let bindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;

    beforeAll(() => {
      instanceBindingNodeFixture = {
        binding: InstanceBindingFixtures.any,
        classMetadata:
          ClassMetadataFixtures.withSingleInjectionConstructorArguments,
        constructorParams: [],
        propertyParams: new Map(),
      };

      subplanParamsMock = {
        autobindOptions: undefined,
        node: instanceBindingNodeFixture,
        operations: {
          getPlan: vitest.fn(),
        } as Partial<PlanParamsOperations> as PlanParamsOperations,
        servicesBranch: [],
      };

      bindingConstraintsListFixture =
        new SingleImmutableLinkedList<InternalBindingConstraints>(
          {
            elem: Symbol() as unknown as InternalBindingConstraints,
            previous: undefined,
          },
          501,
        );
    });

    describe('when called, and bindingConstraintsList length exceeds MAX_PLAN_DEPTH', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          currySubplan(
            buildLazyPlanServiceNodeNodeFromClassElementMetadataMock,
            buildLazyPlanServiceNodeNodeFromResolvedValueElementMetadataMock,
            buildPlanServiceNodeFromClassElementMetadataMock,
            buildPlanServiceNodeFromResolvedValueElementMetadataMock,
          )(subplanParamsMock, bindingConstraintsListFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw InversifyCoreError', () => {
        expect(result).toBeInstanceOf(InversifyCoreError);
        expect((result as InversifyCoreError).kind).toBe(
          InversifyCoreErrorKind.planningMaxDepthExceeded,
        );
        expect((result as InversifyCoreError).message).toBe(
          'Maximum plan depth exceeded. This is likely caused by a circular dependency.',
        );
      });
    });
  });

  describe('having BasePlanParams with InstanceBindingNode with single injection constructor arguments', () => {
    let instanceBindingNodeFixture: InstanceBindingNode;

    let subplanParamsMock: SubplanParams;

    beforeAll(() => {
      instanceBindingNodeFixture = {
        binding: InstanceBindingFixtures.any,
        classMetadata:
          ClassMetadataFixtures.withSingleInjectionConstructorArguments,
        constructorParams: [],
        propertyParams: new Map(),
      };

      subplanParamsMock = {
        autobindOptions: undefined,
        node: instanceBindingNodeFixture,
        operations: {
          getPlan: vitest.fn(),
        } as Partial<PlanParamsOperations> as PlanParamsOperations,
        servicesBranch: [],
      };
    });

    describe('when called, and tryBuildGetPlanOptionsFromManagedClassElementMetadata() returns undefined', () => {
      let bindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;

      let result: unknown;

      beforeAll(() => {
        bindingConstraintsListFixture =
          new SingleImmutableLinkedList<InternalBindingConstraints>(
            {
              elem: Symbol() as unknown as InternalBindingConstraints,
              previous: undefined,
            },
            1,
          );

        vitest
          .mocked(tryBuildGetPlanOptionsFromManagedClassElementMetadata)
          .mockReturnValueOnce(undefined);

        result = currySubplan(
          buildLazyPlanServiceNodeNodeFromClassElementMetadataMock,
          buildLazyPlanServiceNodeNodeFromResolvedValueElementMetadataMock,
          buildPlanServiceNodeFromClassElementMetadataMock,
          buildPlanServiceNodeFromResolvedValueElementMetadataMock,
        )(subplanParamsMock, bindingConstraintsListFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call tryBuildGetPlanOptionsFromManagedClassElementMetadata()', () => {
        expect(
          tryBuildGetPlanOptionsFromManagedClassElementMetadata,
        ).toHaveBeenCalledExactlyOnceWith(
          instanceBindingNodeFixture.classMetadata.constructorArguments[0],
        );
      });

      it('should call buildPlanServiceNodeFromClassElementMetadata()', () => {
        expect(
          buildPlanServiceNodeFromClassElementMetadataMock,
        ).toHaveBeenCalledExactlyOnceWith(
          subplanParamsMock,
          bindingConstraintsListFixture,
          instanceBindingNodeFixture.classMetadata.constructorArguments[0],
        );
      });

      it('should call cacheNonRootPlanServiceNode()', () => {
        expect(cacheNonRootPlanServiceNode).toHaveBeenCalledExactlyOnceWith(
          undefined,
          subplanParamsMock.operations,
          expect.any(LazyPlanServiceNode),
          {
            bindingConstraintsList: bindingConstraintsListFixture,
            chainedBindings: false,
            optionalBindings: false,
          },
        );
      });

      it('should return PlanBindingNode', () => {
        expect(result).toBe(instanceBindingNodeFixture);
      });
    });

    describe('when called, and tryBuildGetPlanOptionsFromManagedClassElementMetadata() returns GetPlanOptions and operations.getPlan() returns undefined', () => {
      let bindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;
      let getPlanOptionsFixture: GetPlanOptions;

      let result: unknown;

      beforeAll(() => {
        bindingConstraintsListFixture =
          new SingleImmutableLinkedList<InternalBindingConstraints>(
            {
              elem: Symbol() as unknown as InternalBindingConstraints,
              previous: undefined,
            },
            1,
          );

        getPlanOptionsFixture = Symbol() as unknown as GetPlanOptions;

        vitest
          .mocked(tryBuildGetPlanOptionsFromManagedClassElementMetadata)
          .mockReturnValueOnce(getPlanOptionsFixture);

        result = currySubplan(
          buildLazyPlanServiceNodeNodeFromClassElementMetadataMock,
          buildLazyPlanServiceNodeNodeFromResolvedValueElementMetadataMock,
          buildPlanServiceNodeFromClassElementMetadataMock,
          buildPlanServiceNodeFromResolvedValueElementMetadataMock,
        )(subplanParamsMock, bindingConstraintsListFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call tryBuildGetPlanOptionsFromManagedClassElementMetadata()', () => {
        expect(
          tryBuildGetPlanOptionsFromManagedClassElementMetadata,
        ).toHaveBeenCalledExactlyOnceWith(
          instanceBindingNodeFixture.classMetadata.constructorArguments[0],
        );
      });

      it('should call operations.getPlan()', () => {
        expect(
          subplanParamsMock.operations.getPlan,
        ).toHaveBeenCalledExactlyOnceWith(getPlanOptionsFixture);
      });

      it('should call buildPlanServiceNodeFromClassElementMetadata()', () => {
        expect(
          buildPlanServiceNodeFromClassElementMetadataMock,
        ).toHaveBeenCalledExactlyOnceWith(
          subplanParamsMock,
          bindingConstraintsListFixture,
          instanceBindingNodeFixture.classMetadata.constructorArguments[0],
        );
      });

      it('should call cacheNonRootPlanServiceNode()', () => {
        expect(cacheNonRootPlanServiceNode).toHaveBeenCalledExactlyOnceWith(
          getPlanOptionsFixture,
          subplanParamsMock.operations,
          expect.any(LazyPlanServiceNode),
          {
            bindingConstraintsList: bindingConstraintsListFixture,
            chainedBindings: false,
            optionalBindings: false,
          },
        );
      });

      it('should return PlanBindingNode', () => {
        expect(result).toBe(instanceBindingNodeFixture);
      });
    });

    describe('when called, and tryBuildGetPlanOptionsFromManagedClassElementMetadata() returns GetPlanOptions and operations.getPlan() returns context free plan', () => {
      let bindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;
      let getPlanOptionsFixture: GetPlanOptions;
      let planResultFixture: PlanResult;

      let result: unknown;

      beforeAll(() => {
        bindingConstraintsListFixture =
          new SingleImmutableLinkedList<InternalBindingConstraints>(
            {
              elem: Symbol() as unknown as InternalBindingConstraints,
              previous: undefined,
            },
            1,
          );

        getPlanOptionsFixture = Symbol() as unknown as GetPlanOptions;

        planResultFixture = {
          tree: {
            root: {
              bindings: [],
              isContextFree: true,
              serviceIdentifier: Symbol(),
            },
          },
        };

        vitest
          .mocked(tryBuildGetPlanOptionsFromManagedClassElementMetadata)
          .mockReturnValueOnce(getPlanOptionsFixture);

        vitest
          .mocked(subplanParamsMock.operations.getPlan)
          .mockReturnValueOnce(planResultFixture);

        result = currySubplan(
          buildLazyPlanServiceNodeNodeFromClassElementMetadataMock,
          buildLazyPlanServiceNodeNodeFromResolvedValueElementMetadataMock,
          buildPlanServiceNodeFromClassElementMetadataMock,
          buildPlanServiceNodeFromResolvedValueElementMetadataMock,
        )(subplanParamsMock, bindingConstraintsListFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call tryBuildGetPlanOptionsFromManagedClassElementMetadata()', () => {
        expect(
          tryBuildGetPlanOptionsFromManagedClassElementMetadata,
        ).toHaveBeenCalledExactlyOnceWith(
          instanceBindingNodeFixture.classMetadata.constructorArguments[0],
        );
      });

      it('should call operations.getPlan()', () => {
        expect(
          subplanParamsMock.operations.getPlan,
        ).toHaveBeenCalledExactlyOnceWith(getPlanOptionsFixture);
      });

      it('should not call buildPlanServiceNodeFromClassElementMetadata()', () => {
        expect(
          buildPlanServiceNodeFromClassElementMetadataMock,
        ).not.toHaveBeenCalled();
      });

      it('should not call cacheNonRootPlanServiceNode()', () => {
        expect(cacheNonRootPlanServiceNode).not.toHaveBeenCalled();
      });

      it('should return PlanBindingNode', () => {
        expect(result).toBe(instanceBindingNodeFixture);
      });
    });

    describe('when called, and tryBuildGetPlanOptionsFromManagedClassElementMetadata() returns GetPlanOptions and operations.getPlan() returns non context free plan', () => {
      let bindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;
      let getPlanOptionsFixture: GetPlanOptions;
      let planResultFixture: PlanResult;

      let result: unknown;

      beforeAll(() => {
        bindingConstraintsListFixture =
          new SingleImmutableLinkedList<InternalBindingConstraints>(
            {
              elem: Symbol() as unknown as InternalBindingConstraints,
              previous: undefined,
            },
            1,
          );

        getPlanOptionsFixture = Symbol() as unknown as GetPlanOptions;

        planResultFixture = {
          tree: {
            root: {
              bindings: [],
              isContextFree: false,
              serviceIdentifier: Symbol(),
            },
          },
        };

        vitest
          .mocked(tryBuildGetPlanOptionsFromManagedClassElementMetadata)
          .mockReturnValueOnce(getPlanOptionsFixture);

        vitest
          .mocked(subplanParamsMock.operations.getPlan)
          .mockReturnValueOnce(planResultFixture);

        result = currySubplan(
          buildLazyPlanServiceNodeNodeFromClassElementMetadataMock,
          buildLazyPlanServiceNodeNodeFromResolvedValueElementMetadataMock,
          buildPlanServiceNodeFromClassElementMetadataMock,
          buildPlanServiceNodeFromResolvedValueElementMetadataMock,
        )(subplanParamsMock, bindingConstraintsListFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call tryBuildGetPlanOptionsFromManagedClassElementMetadata()', () => {
        expect(
          tryBuildGetPlanOptionsFromManagedClassElementMetadata,
        ).toHaveBeenCalledExactlyOnceWith(
          instanceBindingNodeFixture.classMetadata.constructorArguments[0],
        );
      });

      it('should call operations.getPlan()', () => {
        expect(
          subplanParamsMock.operations.getPlan,
        ).toHaveBeenCalledExactlyOnceWith(getPlanOptionsFixture);
      });

      it('should call buildPlanServiceNodeFromClassElementMetadata()', () => {
        expect(
          buildPlanServiceNodeFromClassElementMetadataMock,
        ).toHaveBeenCalledExactlyOnceWith(
          subplanParamsMock,
          bindingConstraintsListFixture,
          instanceBindingNodeFixture.classMetadata.constructorArguments[0],
        );
      });

      it('should call cacheNonRootPlanServiceNode()', () => {
        expect(cacheNonRootPlanServiceNode).toHaveBeenCalledExactlyOnceWith(
          getPlanOptionsFixture,
          subplanParamsMock.operations,
          expect.any(LazyPlanServiceNode),
          {
            bindingConstraintsList: bindingConstraintsListFixture,
            chainedBindings: false,
            optionalBindings: false,
          },
        );
      });

      it('should return PlanBindingNode', () => {
        expect(result).toBe(instanceBindingNodeFixture);
      });
    });
  });

  describe('having BasePlanParams with InstanceBindingNode with single injection property', () => {
    let instanceBindingNodeFixture: InstanceBindingNode;

    let subplanParamsMock: SubplanParams;

    beforeAll(() => {
      instanceBindingNodeFixture = {
        binding: InstanceBindingFixtures.any,
        classMetadata: ClassMetadataFixtures.withSingleInjectionProperty,
        constructorParams: [],
        propertyParams: new Map(),
      };

      subplanParamsMock = {
        autobindOptions: undefined,
        node: instanceBindingNodeFixture,
        operations: {
          getPlan: vitest.fn(),
        } as Partial<PlanParamsOperations> as PlanParamsOperations,
        servicesBranch: [],
      };
    });

    describe('when called, and tryBuildGetPlanOptionsFromManagedClassElementMetadata() returns undefined', () => {
      let bindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;

      let result: unknown;

      beforeAll(() => {
        bindingConstraintsListFixture =
          new SingleImmutableLinkedList<InternalBindingConstraints>(
            {
              elem: Symbol() as unknown as InternalBindingConstraints,
              previous: undefined,
            },
            1,
          );

        vitest
          .mocked(tryBuildGetPlanOptionsFromManagedClassElementMetadata)
          .mockReturnValueOnce(undefined);

        result = currySubplan(
          buildLazyPlanServiceNodeNodeFromClassElementMetadataMock,
          buildLazyPlanServiceNodeNodeFromResolvedValueElementMetadataMock,
          buildPlanServiceNodeFromClassElementMetadataMock,
          buildPlanServiceNodeFromResolvedValueElementMetadataMock,
        )(subplanParamsMock, bindingConstraintsListFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call tryBuildGetPlanOptionsFromManagedClassElementMetadata()', () => {
        const [property]: [string | symbol] = [
          ...instanceBindingNodeFixture.classMetadata.properties.keys(),
        ] as [string | symbol];

        expect(
          tryBuildGetPlanOptionsFromManagedClassElementMetadata,
        ).toHaveBeenCalledExactlyOnceWith(
          instanceBindingNodeFixture.classMetadata.properties.get(property),
        );
      });

      it('should call buildPlanServiceNodeFromClassElementMetadata()', () => {
        const [property]: [string | symbol] = [
          ...instanceBindingNodeFixture.classMetadata.properties.keys(),
        ] as [string | symbol];

        expect(
          buildPlanServiceNodeFromClassElementMetadataMock,
        ).toHaveBeenCalledExactlyOnceWith(
          subplanParamsMock,
          bindingConstraintsListFixture,
          instanceBindingNodeFixture.classMetadata.properties.get(property),
        );
      });

      it('should call cacheNonRootPlanServiceNode()', () => {
        expect(cacheNonRootPlanServiceNode).toHaveBeenCalledExactlyOnceWith(
          undefined,
          subplanParamsMock.operations,
          expect.any(LazyPlanServiceNode),
          {
            bindingConstraintsList: bindingConstraintsListFixture,
            chainedBindings: false,
            optionalBindings: false,
          },
        );
      });

      it('should return PlanBindingNode', () => {
        expect(result).toBe(instanceBindingNodeFixture);
      });
    });

    describe('when called, and tryBuildGetPlanOptionsFromManagedClassElementMetadata() returns GetPlanOptions and operations.getPlan() returns undefined', () => {
      let bindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;
      let getPlanOptionsFixture: GetPlanOptions;

      let result: unknown;

      beforeAll(() => {
        bindingConstraintsListFixture =
          new SingleImmutableLinkedList<InternalBindingConstraints>(
            {
              elem: Symbol() as unknown as InternalBindingConstraints,
              previous: undefined,
            },
            1,
          );

        getPlanOptionsFixture = Symbol() as unknown as GetPlanOptions;

        vitest
          .mocked(tryBuildGetPlanOptionsFromManagedClassElementMetadata)
          .mockReturnValueOnce(getPlanOptionsFixture);

        result = currySubplan(
          buildLazyPlanServiceNodeNodeFromClassElementMetadataMock,
          buildLazyPlanServiceNodeNodeFromResolvedValueElementMetadataMock,
          buildPlanServiceNodeFromClassElementMetadataMock,
          buildPlanServiceNodeFromResolvedValueElementMetadataMock,
        )(subplanParamsMock, bindingConstraintsListFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call tryBuildGetPlanOptionsFromManagedClassElementMetadata()', () => {
        const [property]: [string | symbol] = [
          ...instanceBindingNodeFixture.classMetadata.properties.keys(),
        ] as [string | symbol];

        expect(
          tryBuildGetPlanOptionsFromManagedClassElementMetadata,
        ).toHaveBeenCalledExactlyOnceWith(
          instanceBindingNodeFixture.classMetadata.properties.get(property),
        );
      });

      it('should call operations.getPlan()', () => {
        expect(
          subplanParamsMock.operations.getPlan,
        ).toHaveBeenCalledExactlyOnceWith(getPlanOptionsFixture);
      });

      it('should call buildPlanServiceNodeFromClassElementMetadata()', () => {
        const [property]: [string | symbol] = [
          ...instanceBindingNodeFixture.classMetadata.properties.keys(),
        ] as [string | symbol];

        expect(
          buildPlanServiceNodeFromClassElementMetadataMock,
        ).toHaveBeenCalledExactlyOnceWith(
          subplanParamsMock,
          bindingConstraintsListFixture,
          instanceBindingNodeFixture.classMetadata.properties.get(property),
        );
      });

      it('should call cacheNonRootPlanServiceNode()', () => {
        expect(cacheNonRootPlanServiceNode).toHaveBeenCalledExactlyOnceWith(
          getPlanOptionsFixture,
          subplanParamsMock.operations,
          expect.any(LazyPlanServiceNode),
          {
            bindingConstraintsList: bindingConstraintsListFixture,
            chainedBindings: false,
            optionalBindings: false,
          },
        );
      });

      it('should return PlanBindingNode', () => {
        expect(result).toBe(instanceBindingNodeFixture);
      });
    });

    describe('when called, and tryBuildGetPlanOptionsFromManagedClassElementMetadata() returns GetPlanOptions and operations.getPlan() returns context free plan', () => {
      let bindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;
      let getPlanOptionsFixture: GetPlanOptions;
      let planResultFixture: PlanResult;

      let result: unknown;

      beforeAll(() => {
        bindingConstraintsListFixture =
          new SingleImmutableLinkedList<InternalBindingConstraints>(
            {
              elem: Symbol() as unknown as InternalBindingConstraints,
              previous: undefined,
            },
            1,
          );

        getPlanOptionsFixture = Symbol() as unknown as GetPlanOptions;

        planResultFixture = {
          tree: {
            root: {
              bindings: [],
              isContextFree: true,
              serviceIdentifier: Symbol(),
            },
          },
        };

        vitest
          .mocked(tryBuildGetPlanOptionsFromManagedClassElementMetadata)
          .mockReturnValueOnce(getPlanOptionsFixture);

        vitest
          .mocked(subplanParamsMock.operations.getPlan)
          .mockReturnValueOnce(planResultFixture);

        result = currySubplan(
          buildLazyPlanServiceNodeNodeFromClassElementMetadataMock,
          buildLazyPlanServiceNodeNodeFromResolvedValueElementMetadataMock,
          buildPlanServiceNodeFromClassElementMetadataMock,
          buildPlanServiceNodeFromResolvedValueElementMetadataMock,
        )(subplanParamsMock, bindingConstraintsListFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call tryBuildGetPlanOptionsFromManagedClassElementMetadata()', () => {
        const [property]: [string | symbol] = [
          ...instanceBindingNodeFixture.classMetadata.properties.keys(),
        ] as [string | symbol];

        expect(
          tryBuildGetPlanOptionsFromManagedClassElementMetadata,
        ).toHaveBeenCalledExactlyOnceWith(
          instanceBindingNodeFixture.classMetadata.properties.get(property),
        );
      });

      it('should call operations.getPlan()', () => {
        expect(
          subplanParamsMock.operations.getPlan,
        ).toHaveBeenCalledExactlyOnceWith(getPlanOptionsFixture);
      });

      it('should not call buildPlanServiceNodeFromClassElementMetadata()', () => {
        expect(
          buildPlanServiceNodeFromClassElementMetadataMock,
        ).not.toHaveBeenCalled();
      });

      it('should not call cacheNonRootPlanServiceNode()', () => {
        expect(cacheNonRootPlanServiceNode).not.toHaveBeenCalled();
      });

      it('should return PlanBindingNode', () => {
        expect(result).toBe(instanceBindingNodeFixture);
      });
    });

    describe('when called, and tryBuildGetPlanOptionsFromManagedClassElementMetadata() returns GetPlanOptions and operations.getPlan() returns non context free plan', () => {
      let bindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;
      let getPlanOptionsFixture: GetPlanOptions;
      let planResultFixture: PlanResult;

      let result: unknown;

      beforeAll(() => {
        bindingConstraintsListFixture =
          new SingleImmutableLinkedList<InternalBindingConstraints>(
            {
              elem: Symbol() as unknown as InternalBindingConstraints,
              previous: undefined,
            },
            1,
          );

        getPlanOptionsFixture = Symbol() as unknown as GetPlanOptions;

        planResultFixture = {
          tree: {
            root: {
              bindings: [],
              isContextFree: false,
              serviceIdentifier: Symbol(),
            },
          },
        };

        vitest
          .mocked(tryBuildGetPlanOptionsFromManagedClassElementMetadata)
          .mockReturnValueOnce(getPlanOptionsFixture);

        vitest
          .mocked(subplanParamsMock.operations.getPlan)
          .mockReturnValueOnce(planResultFixture);

        result = currySubplan(
          buildLazyPlanServiceNodeNodeFromClassElementMetadataMock,
          buildLazyPlanServiceNodeNodeFromResolvedValueElementMetadataMock,
          buildPlanServiceNodeFromClassElementMetadataMock,
          buildPlanServiceNodeFromResolvedValueElementMetadataMock,
        )(subplanParamsMock, bindingConstraintsListFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call tryBuildGetPlanOptionsFromManagedClassElementMetadata()', () => {
        const [property]: [string | symbol] = [
          ...instanceBindingNodeFixture.classMetadata.properties.keys(),
        ] as [string | symbol];

        expect(
          tryBuildGetPlanOptionsFromManagedClassElementMetadata,
        ).toHaveBeenCalledExactlyOnceWith(
          instanceBindingNodeFixture.classMetadata.properties.get(property),
        );
      });

      it('should call operations.getPlan()', () => {
        expect(
          subplanParamsMock.operations.getPlan,
        ).toHaveBeenCalledExactlyOnceWith(getPlanOptionsFixture);
      });

      it('should call buildPlanServiceNodeFromClassElementMetadata()', () => {
        const [property]: [string | symbol] = [
          ...instanceBindingNodeFixture.classMetadata.properties.keys(),
        ] as [string | symbol];

        expect(
          buildPlanServiceNodeFromClassElementMetadataMock,
        ).toHaveBeenCalledExactlyOnceWith(
          subplanParamsMock,
          bindingConstraintsListFixture,
          instanceBindingNodeFixture.classMetadata.properties.get(property),
        );
      });

      it('should call cacheNonRootPlanServiceNode()', () => {
        expect(cacheNonRootPlanServiceNode).toHaveBeenCalledExactlyOnceWith(
          getPlanOptionsFixture,
          subplanParamsMock.operations,
          expect.any(LazyPlanServiceNode),
          {
            bindingConstraintsList: bindingConstraintsListFixture,
            chainedBindings: false,
            optionalBindings: false,
          },
        );
      });

      it('should return PlanBindingNode', () => {
        expect(result).toBe(instanceBindingNodeFixture);
      });
    });
  });

  describe('having BasePlanParams with ResolvedValueBindingNode with single injection metadata binding', () => {
    let resolvedValueBindingNodeFixture: ResolvedValueBindingNode;

    let subplanParamsMock: SubplanParams;

    beforeAll(() => {
      resolvedValueBindingNodeFixture = {
        binding: ResolvedValueBindingFixtures.withSingleInjectionMetadata,
        params: [],
      };

      subplanParamsMock = {
        autobindOptions: undefined,
        node: resolvedValueBindingNodeFixture,
        operations: {
          getPlan: vitest.fn(),
        } as Partial<PlanParamsOperations> as PlanParamsOperations,
        servicesBranch: [],
      };
    });

    describe('when called, and tryBuildGetPlanOptionsFromResolvedValueElementMetadata() returns undefined', () => {
      let bindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;

      let result: unknown;

      beforeAll(() => {
        bindingConstraintsListFixture =
          new SingleImmutableLinkedList<InternalBindingConstraints>(
            {
              elem: Symbol() as unknown as InternalBindingConstraints,
              previous: undefined,
            },
            1,
          );

        vitest
          .mocked(tryBuildGetPlanOptionsFromResolvedValueElementMetadata)
          .mockReturnValueOnce(undefined);

        result = currySubplan(
          buildLazyPlanServiceNodeNodeFromClassElementMetadataMock,
          buildLazyPlanServiceNodeNodeFromResolvedValueElementMetadataMock,
          buildPlanServiceNodeFromClassElementMetadataMock,
          buildPlanServiceNodeFromResolvedValueElementMetadataMock,
        )(subplanParamsMock, bindingConstraintsListFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call tryBuildGetPlanOptionsFromResolvedValueElementMetadata()', () => {
        expect(
          tryBuildGetPlanOptionsFromResolvedValueElementMetadata,
        ).toHaveBeenCalledExactlyOnceWith(
          resolvedValueBindingNodeFixture.binding.metadata.arguments[0],
        );
      });

      it('should call buildPlanServiceNodeFromResolvedValueElementMetadata()', () => {
        expect(
          buildPlanServiceNodeFromResolvedValueElementMetadataMock,
        ).toHaveBeenCalledExactlyOnceWith(
          subplanParamsMock,
          bindingConstraintsListFixture,
          resolvedValueBindingNodeFixture.binding.metadata.arguments[0],
        );
      });

      it('should call cacheNonRootPlanServiceNode()', () => {
        expect(cacheNonRootPlanServiceNode).toHaveBeenCalledExactlyOnceWith(
          undefined,
          subplanParamsMock.operations,
          expect.any(LazyPlanServiceNode),
          {
            bindingConstraintsList: bindingConstraintsListFixture,
            chainedBindings: false,
            optionalBindings: false,
          },
        );
      });

      it('should return PlanBindingNode', () => {
        expect(result).toBe(resolvedValueBindingNodeFixture);
      });
    });
  });
});
