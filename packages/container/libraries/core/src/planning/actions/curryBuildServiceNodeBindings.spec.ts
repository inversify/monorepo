import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  type Mocked,
  vitest,
} from 'vitest';

import { InstanceBindingFixtures } from '../../binding/fixtures/InstanceBindingFixtures.js';
import { ResolvedValueBindingFixtures } from '../../binding/fixtures/ResolvedValueBindingFixtures.js';
import { ServiceRedirectionBindingFixtures } from '../../binding/fixtures/ServiceRedirectionBindingFixtures.js';
import { type InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation.js';
import { bindingScopeValues } from '../../binding/models/BindingScope.js';
import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ServiceRedirectionBinding } from '../../binding/models/ServiceRedirectionBinding.js';
import { SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList.js';
import { ClassMetadataFixtures } from '../../metadata/fixtures/ClassMetadataFixtures.js';
import { type ClassMetadata } from '../../metadata/models/ClassMetadata.js';
import { type BasePlanParams } from '../models/BasePlanParams.js';
import { type BuildServiceNodeOptions } from '../models/BuildServiceNodeOptions.js';
import { type PlanBindingNode } from '../models/PlanBindingNode.js';
import { type PlanParamsOperations } from '../models/PlanParamsOperations.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { PlanServiceRedirectionBindingNodeImplementation } from '../models/PlanServiceRedirectionBindingNodeImplementation.js';
import { type SubplanParams } from '../models/SubplanParams.js';
import { curryBuildServiceNodeBindings } from './curryBuildServiceNodeBindings.js';

describe(curryBuildServiceNodeBindings, () => {
  let subplanMock: Mock<
    (
      params: SubplanParams,
      bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    ) => PlanBindingNode
  >;

  beforeAll(() => {
    subplanMock = vitest.fn();
  });

  describe('having serviceBindings with InstanceBinding and PlanServiceNode parent node', () => {
    let basePlanParamsMock: Mocked<BasePlanParams>;
    let instanceBindingFixture: InstanceBinding<unknown>;
    let bindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;
    let parentNodeFixture: PlanServiceNode;

    beforeAll(() => {
      basePlanParamsMock = {
        autobindOptions: {
          scope: bindingScopeValues.Transient,
        },
        operations: {
          getClassMetadata: vitest.fn(),
        } as Partial<PlanParamsOperations> as PlanParamsOperations,
        servicesBranch: [],
      };

      instanceBindingFixture = InstanceBindingFixtures.any;

      bindingConstraintsListFixture =
        new SingleImmutableLinkedList<InternalBindingConstraints>(
          {
            elem: Symbol() as unknown as InternalBindingConstraints,
            previous: undefined,
          },
          1,
        );

      parentNodeFixture = {
        bindings: [],
        isContextFree: true,
        serviceIdentifier: Symbol(),
      };
    });

    describe('when called', () => {
      let classMetadataFixture: ClassMetadata;
      let planBindingNodeFixture: PlanBindingNode;

      let result: unknown;

      beforeAll(() => {
        classMetadataFixture = ClassMetadataFixtures.any;
        planBindingNodeFixture = Symbol() as unknown as PlanBindingNode;

        vitest
          .mocked(basePlanParamsMock.operations.getClassMetadata)
          .mockReturnValueOnce(classMetadataFixture);

        subplanMock.mockReturnValueOnce(planBindingNodeFixture);

        result = curryBuildServiceNodeBindings(subplanMock)(
          basePlanParamsMock,
          bindingConstraintsListFixture,
          [instanceBindingFixture],
          parentNodeFixture,
          {
            chained: false,
            isMultiple: true,
            name: undefined,
            optional: false,
            serviceIdentifier: Symbol(),
            tags: new Map(),
          },
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getClassMetadata()', () => {
        expect(
          basePlanParamsMock.operations.getClassMetadata,
        ).toHaveBeenCalledExactlyOnceWith(
          instanceBindingFixture.implementationType,
        );
      });

      it('should call subplan()', () => {
        const expectedSubplanParams: SubplanParams = {
          autobindOptions: basePlanParamsMock.autobindOptions,
          node: {
            binding: instanceBindingFixture,
            classMetadata: classMetadataFixture,
            constructorParams: [],
            propertyParams: new Map(),
            resolve: expect.any(Function),
          },
          operations: basePlanParamsMock.operations,
          servicesBranch: basePlanParamsMock.servicesBranch,
        };

        expect(subplanMock).toHaveBeenCalledExactlyOnceWith(
          expectedSubplanParams,
          bindingConstraintsListFixture,
        );
      });

      it('should return PlanBindingNode[]', () => {
        expect(result).toStrictEqual([planBindingNodeFixture]);
      });
    });
  });

  describe('having serviceBindings with ResolvedValueBinding and PlanServiceNode parent node', () => {
    let basePlanParamsMock: Mocked<BasePlanParams>;
    let resolvedValueBindingFixture: ResolvedValueBinding<unknown>;
    let bindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;
    let parentNodeFixture: PlanServiceNode;

    beforeAll(() => {
      basePlanParamsMock = {
        autobindOptions: {
          scope: bindingScopeValues.Transient,
        },
        operations: {
          getClassMetadata: vitest.fn(),
        } as Partial<PlanParamsOperations> as PlanParamsOperations,
        servicesBranch: [],
      };

      resolvedValueBindingFixture = ResolvedValueBindingFixtures.any;

      bindingConstraintsListFixture =
        new SingleImmutableLinkedList<InternalBindingConstraints>(
          {
            elem: Symbol() as unknown as InternalBindingConstraints,
            previous: undefined,
          },
          1,
        );

      parentNodeFixture = {
        bindings: [],
        isContextFree: true,
        serviceIdentifier: Symbol(),
      };
    });

    describe('when called', () => {
      let planBindingNodeFixture: PlanBindingNode;

      let result: unknown;

      beforeAll(() => {
        planBindingNodeFixture = Symbol() as unknown as PlanBindingNode;

        subplanMock.mockReturnValueOnce(planBindingNodeFixture);

        result = curryBuildServiceNodeBindings(subplanMock)(
          basePlanParamsMock,
          bindingConstraintsListFixture,
          [resolvedValueBindingFixture],
          parentNodeFixture,
          {
            chained: false,
            isMultiple: true,
            name: undefined,
            optional: false,
            serviceIdentifier: Symbol(),
            tags: new Map(),
          },
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call subplan()', () => {
        const expectedSubplanParams: SubplanParams = {
          autobindOptions: basePlanParamsMock.autobindOptions,
          node: {
            binding: resolvedValueBindingFixture,
            params: [],
            resolve: expect.any(Function),
          },
          operations: basePlanParamsMock.operations,
          servicesBranch: basePlanParamsMock.servicesBranch,
        };

        expect(subplanMock).toHaveBeenCalledExactlyOnceWith(
          expectedSubplanParams,
          bindingConstraintsListFixture,
        );
      });

      it('should return PlanBindingNode[]', () => {
        expect(result).toStrictEqual([planBindingNodeFixture]);
      });
    });
  });

  describe('having serviceBindings with ServiceRedirectionBinding and PlanServiceNode parent node', () => {
    let basePlanParamsMock: Mocked<BasePlanParams>;
    let serviceRedirectionBindingFixture: ServiceRedirectionBinding<unknown>;
    let bindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;
    let parentNodeFixture: PlanServiceNode;

    beforeAll(() => {
      basePlanParamsMock = {
        autobindOptions: {
          scope: bindingScopeValues.Transient,
        },
        operations: {
          getClassMetadata: vitest.fn(),
        } as Partial<PlanParamsOperations> as PlanParamsOperations,
        servicesBranch: [],
      };

      serviceRedirectionBindingFixture = ServiceRedirectionBindingFixtures.any;

      bindingConstraintsListFixture =
        new SingleImmutableLinkedList<InternalBindingConstraints>(
          {
            elem: Symbol() as unknown as InternalBindingConstraints,
            previous: undefined,
          },
          1,
        );

      parentNodeFixture = {
        bindings: [],
        isContextFree: true,
        serviceIdentifier: Symbol(),
      };
    });

    describe('when called', () => {
      let buildServiceNodeOptionsFixture: BuildServiceNodeOptions;
      let planBindingNodeFixture: PlanBindingNode;

      let result: unknown;

      beforeAll(() => {
        buildServiceNodeOptionsFixture = {
          chained: false,
          isMultiple: true,
          name: undefined,
          optional: false,
          serviceIdentifier: Symbol(),
          tags: new Map(),
        };
        planBindingNodeFixture = Symbol() as unknown as PlanBindingNode;

        subplanMock.mockReturnValueOnce(planBindingNodeFixture);

        result = curryBuildServiceNodeBindings(subplanMock)(
          basePlanParamsMock,
          bindingConstraintsListFixture,
          [serviceRedirectionBindingFixture],
          parentNodeFixture,
          buildServiceNodeOptionsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call subplan()', () => {
        const expectedSubplanParams: SubplanParams = {
          autobindOptions: basePlanParamsMock.autobindOptions,
          buildServiceNodeOptions: {
            ...buildServiceNodeOptionsFixture,
            serviceIdentifier:
              serviceRedirectionBindingFixture.targetServiceIdentifier,
          },
          node: new PlanServiceRedirectionBindingNodeImplementation(
            serviceRedirectionBindingFixture,
          ),
          operations: basePlanParamsMock.operations,
          servicesBranch: basePlanParamsMock.servicesBranch,
        };

        expect(subplanMock).toHaveBeenCalledExactlyOnceWith(
          expectedSubplanParams,
          bindingConstraintsListFixture,
        );
      });

      it('should return PlanBindingNode[]', () => {
        const expectedPlanBindingNodes: PlanBindingNode[] = [
          planBindingNodeFixture,
        ];

        expect(result).toStrictEqual(expectedPlanBindingNodes);
      });
    });
  });
});
