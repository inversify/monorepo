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
  import('../calculations/throwErrorWhenUnexpectedBindingsAmountFound.js'),
);

import { type Binding } from '../../binding/models/Binding.js';
import {
  BindingConstraintsImplementation,
  type InternalBindingConstraints,
} from '../../binding/models/BindingConstraintsImplementation.js';
import {
  SingleImmutableLinkedList,
  type SingleImmutableLinkedListNode,
} from '../../common/models/SingleImmutableLinkedList.js';
import { buildFilteredServiceBindings } from '../calculations/buildFilteredServiceBindings.js';
import { throwErrorWhenUnexpectedBindingsAmountFound } from '../calculations/throwErrorWhenUnexpectedBindingsAmountFound.js';
import { BuildMultipleBindingServiceNodeOptionsFixtures } from '../fixtures/BuildMultipleBindingServiceNodeOptionsFixtures.js';
import { BuildSingleBindingServiceNodeOptionsFixtures } from '../fixtures/BuildSingleBindingServiceNodeOptionsFixtures.js';
import { type BasePlanParams } from '../models/BasePlanParams.js';
import { type BindingNodeParent } from '../models/BindingNodeParent.js';
import { type BuildMultipleBindingServiceNodeOptions } from '../models/BuildMultipleBindingServiceNodeOptions.js';
import { type BuildServiceNodeOptions } from '../models/BuildServiceNodeOptions.js';
import { type BuildSingleBindingServiceNodeOptions } from '../models/BuildSingleBindingServiceNodeOptions.js';
import { type PlanBindingNode } from '../models/PlanBindingNode.js';
import { PlanMultipleBindingServiceNodeImplementation } from '../models/PlanMultipleBindingServiceNodeImplementation.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { PlanSingleBindingServiceNodeImplementation } from '../models/PlanSingleBindingServiceNode.js';
import { type SubplanParams } from '../models/SubplanParams.js';
import { curryBuildPlanServiceNodeFromOptions } from './curryBuildPlanServiceNodeFromOptions.js';

describe(curryBuildPlanServiceNodeFromOptions, () => {
  let buildServiceNodeBindingsMock: Mock<
    (
      params: BasePlanParams,
      bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
      serviceBindings: Binding<unknown>[],
      parentNode: BindingNodeParent,
      options: BuildServiceNodeOptions,
    ) => PlanBindingNode[]
  >;

  beforeAll(() => {
    buildServiceNodeBindingsMock = vitest.fn();
  });

  describe('having multiple injection class element metadata', () => {
    let paramsFixture: SubplanParams;
    let bindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;
    let optionsFixture: BuildMultipleBindingServiceNodeOptions;

    beforeAll(() => {
      paramsFixture = Symbol() as unknown as SubplanParams;
      bindingConstraintsListFixture = new SingleImmutableLinkedList(
        {
          elem: Symbol() as unknown as InternalBindingConstraints,
          previous: undefined,
        },
        1,
      );
      optionsFixture = BuildMultipleBindingServiceNodeOptionsFixtures.any;
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

        result = curryBuildPlanServiceNodeFromOptions(
          buildServiceNodeBindingsMock,
        )(paramsFixture, bindingConstraintsListFixture, optionsFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildFilteredServiceBindings()', () => {
        expect(buildFilteredServiceBindings).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
          expect.any(BindingConstraintsImplementation),
          { chained: optionsFixture.chained },
        );
      });

      it('should call buildServiceNodeBindings()', () => {
        expect(buildServiceNodeBindingsMock).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
          new SingleImmutableLinkedList(
            {
              elem: {
                getAncestorsCalled: false,
                name: optionsFixture.name,
                serviceIdentifier: optionsFixture.serviceIdentifier,
                tags: optionsFixture.tags,
              },
              previous: bindingConstraintsListFixture.last,
            },
            2,
          ),
          bindingsFixture,
          result as BindingNodeParent,
          optionsFixture,
        );
      });

      it('should not call throwErrorWhenUnexpectedBindingsAmountFound()', () => {
        expect(
          throwErrorWhenUnexpectedBindingsAmountFound,
        ).not.toHaveBeenCalled();
      });

      it('should return a PlanServiceNode', () => {
        const expectedServiceNode: PlanServiceNode =
          new PlanMultipleBindingServiceNodeImplementation(
            serviceNodeBindingsFixture,
            optionsFixture.serviceIdentifier,
          );

        expect(result).toStrictEqual(expectedServiceNode);
      });
    });
  });

  describe('having single injection class element metadata', () => {
    let paramsFixture: SubplanParams;
    let bindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;
    let optionsFixture: BuildSingleBindingServiceNodeOptions;

    beforeAll(() => {
      paramsFixture = Symbol() as unknown as SubplanParams;
      bindingConstraintsListFixture = new SingleImmutableLinkedList(
        {
          elem: Symbol() as unknown as InternalBindingConstraints,
          previous: undefined,
        },
        1,
      );
      optionsFixture = BuildSingleBindingServiceNodeOptionsFixtures.any;
    });

    describe('when called', () => {
      let bindingsFixture: Binding<unknown>[];
      let serviceNodeBindingFixture: PlanBindingNode;

      let result: unknown;

      beforeAll(() => {
        bindingsFixture = [Symbol() as unknown as Binding<unknown>];
        serviceNodeBindingFixture = {
          resolve: vitest.fn(),
        } as Partial<PlanBindingNode> as PlanBindingNode;

        vitest
          .mocked(buildFilteredServiceBindings)
          .mockReturnValueOnce(bindingsFixture);

        vitest
          .mocked(buildServiceNodeBindingsMock)
          .mockReturnValueOnce([serviceNodeBindingFixture]);

        result = curryBuildPlanServiceNodeFromOptions(
          buildServiceNodeBindingsMock,
        )(paramsFixture, bindingConstraintsListFixture, optionsFixture);
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
        expect(buildServiceNodeBindingsMock).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
          new SingleImmutableLinkedList(
            {
              elem: {
                getAncestorsCalled: false,
                name: optionsFixture.name,
                serviceIdentifier: optionsFixture.serviceIdentifier,
                tags: optionsFixture.tags,
              },
              previous: bindingConstraintsListFixture.last,
            },
            2,
          ),
          bindingsFixture,
          result as BindingNodeParent,
          optionsFixture,
        );
      });

      it('should call throwErrorWhenUnexpectedBindingsAmountFound()', () => {
        const expectedBindingConstraintsListNode: SingleImmutableLinkedListNode<InternalBindingConstraints> =
          {
            elem: {
              getAncestorsCalled: false,
              name: optionsFixture.name,
              serviceIdentifier: optionsFixture.serviceIdentifier,
              tags: optionsFixture.tags,
            },
            previous: bindingConstraintsListFixture.last,
          };

        expect(
          throwErrorWhenUnexpectedBindingsAmountFound,
        ).toHaveBeenCalledExactlyOnceWith(
          [serviceNodeBindingFixture],
          optionsFixture.optional,
          expectedBindingConstraintsListNode,
        );
      });

      it('should return a PlanServiceNode', () => {
        expect(result).toBeInstanceOf(
          PlanSingleBindingServiceNodeImplementation,
        );

        const resultServiceNode: PlanServiceNode = result as PlanServiceNode;

        expect(resultServiceNode.bindings).toBe(serviceNodeBindingFixture);
        expect(resultServiceNode.isContextFree).toBe(true);
        expect(resultServiceNode.serviceIdentifier).toBe(
          optionsFixture.serviceIdentifier,
        );
      });
    });
  });
});
