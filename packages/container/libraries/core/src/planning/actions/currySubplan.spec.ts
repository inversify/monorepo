import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

vitest.mock(
  '../calculations/tryBuildGetPlanOptionsFromManagedClassElementMetadata',
);
vitest.mock(
  '../calculations/tryBuildGetPlanOptionsFromResolvedValueElementMetadata',
);
vitest.mock('./cacheNonRootPlanServiceNode');

import { InstanceBindingFixtures } from '../../binding/fixtures/InstanceBindingFixtures';
import { ResolvedValueBindingFixtures } from '../../binding/fixtures/ResolvedValueBindingFixtures';
import { InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation';
import { SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList';
import { ClassMetadataFixtures } from '../../metadata/fixtures/ClassMetadataFixtures';
import { ManagedClassElementMetadata } from '../../metadata/models/ManagedClassElementMetadata';
import { ResolvedValueElementMetadata } from '../../metadata/models/ResolvedValueElementMetadata';
import { tryBuildGetPlanOptionsFromManagedClassElementMetadata } from '../calculations/tryBuildGetPlanOptionsFromManagedClassElementMetadata';
import { tryBuildGetPlanOptionsFromResolvedValueElementMetadata } from '../calculations/tryBuildGetPlanOptionsFromResolvedValueElementMetadata';
import { GetPlanOptions } from '../models/GetPlanOptions';
import { InstanceBindingNode } from '../models/InstanceBindingNode';
import { LazyPlanServiceNode } from '../models/LazyPlanServiceNode';
import { PlanParamsOperations } from '../models/PlanParamsOperations';
import { PlanResult } from '../models/PlanResult';
import { PlanServiceNode } from '../models/PlanServiceNode';
import { ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode';
import { SubplanParams } from '../models/SubplanParams';
import { cacheNonRootPlanServiceNode } from './cacheNonRootPlanServiceNode';
import { currySubplan } from './currySubplan';

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
          new SingleImmutableLinkedList<InternalBindingConstraints>({
            elem: Symbol() as unknown as InternalBindingConstraints,
            previous: undefined,
          });

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
          new SingleImmutableLinkedList<InternalBindingConstraints>({
            elem: Symbol() as unknown as InternalBindingConstraints,
            previous: undefined,
          });

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
          new SingleImmutableLinkedList<InternalBindingConstraints>({
            elem: Symbol() as unknown as InternalBindingConstraints,
            previous: undefined,
          });

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
          new SingleImmutableLinkedList<InternalBindingConstraints>({
            elem: Symbol() as unknown as InternalBindingConstraints,
            previous: undefined,
          });

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
          new SingleImmutableLinkedList<InternalBindingConstraints>({
            elem: Symbol() as unknown as InternalBindingConstraints,
            previous: undefined,
          });

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
          new SingleImmutableLinkedList<InternalBindingConstraints>({
            elem: Symbol() as unknown as InternalBindingConstraints,
            previous: undefined,
          });

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
          new SingleImmutableLinkedList<InternalBindingConstraints>({
            elem: Symbol() as unknown as InternalBindingConstraints,
            previous: undefined,
          });

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
          new SingleImmutableLinkedList<InternalBindingConstraints>({
            elem: Symbol() as unknown as InternalBindingConstraints,
            previous: undefined,
          });

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
          new SingleImmutableLinkedList<InternalBindingConstraints>({
            elem: Symbol() as unknown as InternalBindingConstraints,
            previous: undefined,
          });

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
          new SingleImmutableLinkedList<InternalBindingConstraints>({
            elem: Symbol() as unknown as InternalBindingConstraints,
            previous: undefined,
          });

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
