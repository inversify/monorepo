import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  Mocked,
  vitest,
} from 'vitest';

vitest.mock('../calculations/buildFilteredServiceBindings');

import { InstanceBindingFixtures } from '../../binding/fixtures/InstanceBindingFixtures';
import { ResolvedValueBindingFixtures } from '../../binding/fixtures/ResolvedValueBindingFixtures';
import { ServiceRedirectionBindingFixtures } from '../../binding/fixtures/ServiceRedirectionBindingFixtures';
import { BindingConstraints } from '../../binding/models/BindingConstraints';
import {
  BindingConstraintsImplementation,
  InternalBindingConstraints,
} from '../../binding/models/BindingConstraintsImplementation';
import { bindingScopeValues } from '../../binding/models/BindingScope';
import { InstanceBinding } from '../../binding/models/InstanceBinding';
import { ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding';
import { ServiceRedirectionBinding } from '../../binding/models/ServiceRedirectionBinding';
import { SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList';
import { ClassMetadataFixtures } from '../../metadata/fixtures/ClassMetadataFixtures';
import { ClassMetadata } from '../../metadata/models/ClassMetadata';
import { buildFilteredServiceBindings } from '../calculations/buildFilteredServiceBindings';
import { BasePlanParams } from '../models/BasePlanParams';
import { PlanBindingNode } from '../models/PlanBindingNode';
import { PlanParamsOperations } from '../models/PlanParamsOperations';
import { PlanServiceNode } from '../models/PlanServiceNode';
import { SubplanParams } from '../models/SubplanParams';
import { curryBuildServiceNodeBindings } from './curryBuildServiceNodeBindings';

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
        new SingleImmutableLinkedList<InternalBindingConstraints>({
          elem: Symbol() as unknown as InternalBindingConstraints,
          previous: undefined,
        });

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
          false,
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

      it('should call subplan with correct params', () => {
        const expectedSubplanParams: SubplanParams = {
          autobindOptions: basePlanParamsMock.autobindOptions,
          node: {
            binding: instanceBindingFixture,
            classMetadata: classMetadataFixture,
            constructorParams: [],
            propertyParams: new Map(),
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
        new SingleImmutableLinkedList<InternalBindingConstraints>({
          elem: Symbol() as unknown as InternalBindingConstraints,
          previous: undefined,
        });

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
          false,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call subplan with correct params', () => {
        const expectedSubplanParams: SubplanParams = {
          autobindOptions: basePlanParamsMock.autobindOptions,
          node: {
            binding: resolvedValueBindingFixture,
            params: [],
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
        new SingleImmutableLinkedList<InternalBindingConstraints>({
          elem: Symbol() as unknown as InternalBindingConstraints,
          previous: undefined,
        });

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

        vitest.mocked(buildFilteredServiceBindings).mockReturnValueOnce([]);

        result = curryBuildServiceNodeBindings(subplanMock)(
          basePlanParamsMock,
          bindingConstraintsListFixture,
          [serviceRedirectionBindingFixture],
          parentNodeFixture,
          false,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildFilteredServiceBindings()', () => {
        const expectedBindingConstraints: BindingConstraints =
          new BindingConstraintsImplementation(
            bindingConstraintsListFixture.last,
          );

        expect(buildFilteredServiceBindings).toHaveBeenCalledExactlyOnceWith(
          basePlanParamsMock,
          expectedBindingConstraints,
          {
            chained: false,
            customServiceIdentifier:
              serviceRedirectionBindingFixture.targetServiceIdentifier,
          },
        );
      });

      it('should return PlanBindingNode[]', () => {
        const expectedPlanBindingNodes: PlanBindingNode[] = [
          {
            binding: serviceRedirectionBindingFixture,
            redirections: [],
          },
        ];

        expect(result).toStrictEqual(expectedPlanBindingNodes);
      });
    });
  });
});
