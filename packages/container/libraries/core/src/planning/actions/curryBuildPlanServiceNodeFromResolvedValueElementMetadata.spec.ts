import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

vitest.mock(import('../calculations/buildFilteredServiceBindings.js'));
vitest.mock(
  import('../calculations/checkServiceNodeSingleInjectionBindings.js'),
);

import { type ServiceIdentifier } from '@inversifyjs/common';

import { type Binding } from '../../binding/models/Binding.js';
import {
  BindingConstraintsImplementation,
  type InternalBindingConstraints,
} from '../../binding/models/BindingConstraintsImplementation.js';
import {
  SingleImmutableLinkedList,
  type SingleImmutableLinkedListNode,
} from '../../common/models/SingleImmutableLinkedList.js';
import { MultipleInjectionResolvedValueElementMetadataFixtures } from '../../metadata/fixtures/MultipleInjectionResolvedValueElementMetadataFixtures.js';
import { SingleInjectionResolvedValueElementMetadataFixtures } from '../../metadata/fixtures/SingleInjectionResolvedValueElementMetadataFixtures.js';
import { type MultipleInjectionResolvedValueElementMetadata } from '../../metadata/models/MultipleInjectionResolvedValueElementMetadata.js';
import { type SingleInjectionResolvedValueElementMetadata } from '../../metadata/models/SingleInjectionResolvedValueElementMetadata.js';
import { buildFilteredServiceBindings } from '../calculations/buildFilteredServiceBindings.js';
import { checkServiceNodeSingleInjectionBindings } from '../calculations/checkServiceNodeSingleInjectionBindings.js';
import { type BasePlanParams } from '../models/BasePlanParams.js';
import { type BindingNodeParent } from '../models/BindingNodeParent.js';
import { type PlanBindingNode } from '../models/PlanBindingNode.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { type SubplanParams } from '../models/SubplanParams.js';
import { curryBuildPlanServiceNodeFromResolvedValueElementMetadata } from './curryBuildPlanServiceNodeFromResolvedValueElementMetadata.js';

describe(curryBuildPlanServiceNodeFromResolvedValueElementMetadata, () => {
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
    let elementMetadataFixture: MultipleInjectionResolvedValueElementMetadata;

    beforeAll(() => {
      paramsFixture = Symbol() as unknown as SubplanParams;
      bindingConstraintsListFixture = new SingleImmutableLinkedList({
        elem: Symbol() as unknown as InternalBindingConstraints,
        previous: undefined,
      });
      elementMetadataFixture =
        MultipleInjectionResolvedValueElementMetadataFixtures.any;
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

        result = curryBuildPlanServiceNodeFromResolvedValueElementMetadata(
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
    let elementMetadataFixture: SingleInjectionResolvedValueElementMetadata;

    beforeAll(() => {
      paramsFixture = Symbol() as unknown as SubplanParams;
      bindingConstraintsListFixture = new SingleImmutableLinkedList({
        elem: Symbol() as unknown as InternalBindingConstraints,
        previous: undefined,
      });
      elementMetadataFixture =
        SingleInjectionResolvedValueElementMetadataFixtures.any;
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

        buildServiceNodeBindingsMock.mockReturnValueOnce([
          serviceNodeBindingFixture,
        ]);

        result = curryBuildPlanServiceNodeFromResolvedValueElementMetadata(
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
