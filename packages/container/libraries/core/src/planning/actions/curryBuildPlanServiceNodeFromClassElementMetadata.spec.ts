import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

vitest.mock('../calculations/buildFilteredServiceBindings');
vitest.mock('../calculations/checkServiceNodeSingleInjectionBindings');

import { ServiceIdentifier } from '@inversifyjs/common';

import { Binding } from '../../binding/models/Binding';
import {
  BindingConstraintsImplementation,
  InternalBindingConstraints,
} from '../../binding/models/BindingConstraintsImplementation';
import {
  SingleImmutableLinkedList,
  SingleImmutableLinkedListNode,
} from '../../common/models/SingleImmutableLinkedList';
import { MultipleInjectionManagedClassElementMetadataFixtures } from '../../metadata/fixtures/MultipleInjectionManagedClassElementMetadataFixtures';
import { SingleInjectionManagedClassElementMetadataFixtures } from '../../metadata/fixtures/SingleInjectionManagedClassElementMetadataFixtures';
import { MultipleInjectionManagedClassElementMetadata } from '../../metadata/models/MultipleInjectionManagedClassElementMetadata';
import { SingleInjectionManagedClassElementMetadata } from '../../metadata/models/SingleInjectionManagedClassElementMetadata';
import { buildFilteredServiceBindings } from '../calculations/buildFilteredServiceBindings';
import { checkServiceNodeSingleInjectionBindings } from '../calculations/checkServiceNodeSingleInjectionBindings';
import { BasePlanParams } from '../models/BasePlanParams';
import { BindingNodeParent } from '../models/BindingNodeParent';
import { PlanBindingNode } from '../models/PlanBindingNode';
import { PlanServiceNode } from '../models/PlanServiceNode';
import { SubplanParams } from '../models/SubplanParams';
import { curryBuildPlanServiceNodeFromClassElementMetadata } from './curryBuildPlanServiceNodeFromClassElementMetadata';

describe(curryBuildPlanServiceNodeFromClassElementMetadata, () => {
  let buildServiceNodeBindingsMock: Mock<
    (
      params: BasePlanParams,
      bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
      serviceBindings: Binding<unknown>[],
      parentNode: BindingNodeParent,
      chainedBindings: boolean,
    ) => PlanBindingNode[]
  >;

  beforeAll(() => {
    buildServiceNodeBindingsMock = vitest.fn();
  });

  describe('having multiple injection class element metadata', () => {
    let paramsFixture: SubplanParams;
    let bindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;
    let elementMetadataFixture: MultipleInjectionManagedClassElementMetadata;

    beforeAll(() => {
      paramsFixture = Symbol() as unknown as SubplanParams;
      bindingConstraintsListFixture = new SingleImmutableLinkedList({
        elem: Symbol() as unknown as InternalBindingConstraints,
        previous: undefined,
      });
      elementMetadataFixture =
        MultipleInjectionManagedClassElementMetadataFixtures.any;
    });

    describe('when called', () => {
      let bindingsFixture: Binding<unknown>[];
      let serviceNodeBindingsFixture: PlanBindingNode[];

      let result: unknown;

      beforeAll(() => {
        bindingsFixture = [Symbol() as unknown as Binding<unknown>];
        serviceNodeBindingsFixture = [Symbol() as unknown as PlanBindingNode];

        vitest
          .mocked(buildFilteredServiceBindings)
          .mockReturnValueOnce(bindingsFixture);

        buildServiceNodeBindingsMock.mockReturnValueOnce(
          serviceNodeBindingsFixture,
        );

        result = curryBuildPlanServiceNodeFromClassElementMetadata(
          buildServiceNodeBindingsMock,
        )(paramsFixture, bindingConstraintsListFixture, elementMetadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildFilteredServiceBindings()', () => {
        expect(buildFilteredServiceBindings).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
          expect.any(BindingConstraintsImplementation),
          { chained: elementMetadataFixture.chained },
        );
      });

      it('should call buildServiceNodeBindings()', () => {
        const expectedServiceNode: PlanServiceNode = {
          bindings: serviceNodeBindingsFixture,
          isContextFree: true,
          serviceIdentifier: elementMetadataFixture.value as ServiceIdentifier,
        };

        expect(buildServiceNodeBindingsMock).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
          new SingleImmutableLinkedList({
            elem: {
              getAncestorsCalled: false,
              name: elementMetadataFixture.name,
              serviceIdentifier: expectedServiceNode.serviceIdentifier,
              tags: elementMetadataFixture.tags,
            },
            previous: bindingConstraintsListFixture.last,
          }),
          bindingsFixture,
          expectedServiceNode,
          elementMetadataFixture.chained,
        );
      });

      it('should return a PlanServiceNode', () => {
        const expectedServiceNode: PlanServiceNode = {
          bindings: serviceNodeBindingsFixture,
          isContextFree: true,
          serviceIdentifier: elementMetadataFixture.value as ServiceIdentifier,
        };

        expect(result).toStrictEqual(expectedServiceNode);
      });
    });
  });

  describe('having single injection class element metadata', () => {
    let paramsFixture: SubplanParams;
    let bindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;
    let elementMetadataFixture: SingleInjectionManagedClassElementMetadata;

    beforeAll(() => {
      paramsFixture = Symbol() as unknown as SubplanParams;
      bindingConstraintsListFixture = new SingleImmutableLinkedList({
        elem: Symbol() as unknown as InternalBindingConstraints,
        previous: undefined,
      });
      elementMetadataFixture =
        SingleInjectionManagedClassElementMetadataFixtures.any;
    });

    describe('when called', () => {
      let bindingsFixture: Binding<unknown>[];
      let serviceNodeBindingFixture: PlanBindingNode;

      let result: unknown;

      beforeAll(() => {
        bindingsFixture = [Symbol() as unknown as Binding<unknown>];
        serviceNodeBindingFixture = Symbol() as unknown as PlanBindingNode;

        vitest
          .mocked(buildFilteredServiceBindings)
          .mockReturnValueOnce(bindingsFixture);

        vitest
          .mocked(buildServiceNodeBindingsMock)
          .mockReturnValueOnce([serviceNodeBindingFixture]);

        result = curryBuildPlanServiceNodeFromClassElementMetadata(
          buildServiceNodeBindingsMock,
        )(paramsFixture, bindingConstraintsListFixture, elementMetadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildFilteredServiceBindings()', () => {
        expect(buildFilteredServiceBindings).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
          expect.any(BindingConstraintsImplementation),
          { chained: false },
        );
      });

      it('should call buildServiceNodeBindings()', () => {
        const expectedServiceNode: PlanServiceNode = {
          bindings: serviceNodeBindingFixture,
          isContextFree: true,
          serviceIdentifier: elementMetadataFixture.value as ServiceIdentifier,
        };

        expect(buildServiceNodeBindingsMock).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
          new SingleImmutableLinkedList({
            elem: {
              getAncestorsCalled: false,
              name: elementMetadataFixture.name,
              serviceIdentifier: expectedServiceNode.serviceIdentifier,
              tags: elementMetadataFixture.tags,
            },
            previous: bindingConstraintsListFixture.last,
          }),
          bindingsFixture,
          expectedServiceNode,
          false,
        );
      });

      it('should call checkServiceNodeSingleInjectionBindings()', () => {
        const expectedServiceNode: PlanServiceNode = {
          bindings: serviceNodeBindingFixture,
          isContextFree: true,
          serviceIdentifier: elementMetadataFixture.value as ServiceIdentifier,
        };

        const expectedBindingConstraintsListNode: SingleImmutableLinkedListNode<InternalBindingConstraints> =
          {
            elem: {
              getAncestorsCalled: false,
              name: elementMetadataFixture.name,
              serviceIdentifier: expectedServiceNode.serviceIdentifier,
              tags: elementMetadataFixture.tags,
            },
            previous: bindingConstraintsListFixture.last,
          };

        expect(
          checkServiceNodeSingleInjectionBindings,
        ).toHaveBeenCalledExactlyOnceWith(
          expectedServiceNode,
          elementMetadataFixture.optional,
          expectedBindingConstraintsListNode,
        );
      });

      it('should return a PlanServiceNode', () => {
        const expectedServiceNode: PlanServiceNode = {
          bindings: serviceNodeBindingFixture,
          isContextFree: true,
          serviceIdentifier: elementMetadataFixture.value as ServiceIdentifier,
        };

        expect(result).toStrictEqual(expectedServiceNode);
      });
    });
  });
});
