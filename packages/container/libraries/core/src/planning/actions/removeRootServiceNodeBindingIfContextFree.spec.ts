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

vitest.mock(import('../calculations/buildPlanBindingConstraintsList.js'));
vitest.mock(import('./removeServiceNodeBindingIfContextFree.js'));

import { type ServiceIdentifier } from '@inversifyjs/common';

import { type Binding } from '../../binding/models/Binding.js';
import { type InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation.js';
import { bindingScopeValues } from '../../binding/models/BindingScope.js';
import { bindingTypeValues } from '../../binding/models/BindingType.js';
import { SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList.js';
import { type PlanServiceNodeBindingRemovedResult } from '../../metadata/models/PlanServiceNodeBindingRemovedResult.js';
import { buildPlanBindingConstraintsList } from '../calculations/buildPlanBindingConstraintsList.js';
import { LazyPlanServiceNode } from '../models/LazyPlanServiceNode.js';
import { type PlanParams } from '../models/PlanParams.js';
import { type PlanParamsOperations } from '../models/PlanParamsOperations.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { removeRootServiceNodeBindingIfContextFree } from './removeRootServiceNodeBindingIfContextFree.js';
import { removeServiceNodeBindingIfContextFree } from './removeServiceNodeBindingIfContextFree.js';

class LazyPlanServiceNodeTest extends LazyPlanServiceNode {
  readonly #buildPlanServiceNodeMock: Mock<() => PlanServiceNode>;

  constructor(
    serviceNode: PlanServiceNode | undefined,
    serviceIdentifier: ServiceIdentifier,
    buildPlanServiceNode: Mock<() => PlanServiceNode>,
  ) {
    super(serviceNode, serviceIdentifier);

    this.#buildPlanServiceNodeMock = buildPlanServiceNode;
  }

  protected _buildPlanServiceNode(): PlanServiceNode {
    return this.#buildPlanServiceNodeMock();
  }
}

describe(removeRootServiceNodeBindingIfContextFree, () => {
  describe('having a non expanded lazy service node', () => {
    let lazyPlanServiceNodeFixture: LazyPlanServiceNode;

    beforeAll(() => {
      lazyPlanServiceNodeFixture = new LazyPlanServiceNodeTest(
        undefined,
        Symbol(),
        vitest.fn(),
      );
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = removeRootServiceNodeBindingIfContextFree(
          Symbol() as unknown as PlanParams,
          lazyPlanServiceNodeFixture,
          Symbol() as unknown as Binding<unknown>,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return expected value', () => {
        const expected: PlanServiceNodeBindingRemovedResult = {
          bindingNodeRemoved: undefined,
          isContextFreeBinding: true,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having an expanded lazy service node with an array of bindings', () => {
    let paramsFixture: PlanParams;
    let lazyPlanServiceNodeFixture: LazyPlanServiceNode;
    let bindingMock: Mocked<Binding<unknown>>;

    beforeAll(() => {
      paramsFixture = {
        autobindOptions: undefined,
        operations: Symbol() as unknown as PlanParamsOperations,
        rootConstraints: {
          chained: false,
          isMultiple: true,
          serviceIdentifier: Symbol(),
        },
        servicesBranch: [],
      };

      const serviceIdentifier: ServiceIdentifier = Symbol();

      lazyPlanServiceNodeFixture = new LazyPlanServiceNodeTest(
        {
          bindings: [],
          isContextFree: true,
          serviceIdentifier: serviceIdentifier,
        },
        serviceIdentifier,
        vitest.fn(),
      );

      bindingMock = {
        cache: {
          isRight: false,
          value: undefined,
        },
        id: 1,
        isSatisfiedBy: vitest.fn(),
        moduleId: undefined,
        onActivation: vitest.fn(),
        onDeactivation: vitest.fn(),
        scope: bindingScopeValues.Singleton,
        serviceIdentifier,
        type: bindingTypeValues.ConstantValue,
        value: Symbol(),
      };
    });

    describe('when called', () => {
      let buildPlanBindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;
      let planServiceNodeBindingRemovedResultFixture: PlanServiceNodeBindingRemovedResult;

      let result: unknown;

      beforeAll(() => {
        buildPlanBindingConstraintsListFixture = new SingleImmutableLinkedList({
          elem: Symbol() as unknown as InternalBindingConstraints,
          previous: undefined,
        });

        planServiceNodeBindingRemovedResultFixture = {
          bindingNodeRemoved: undefined,
          isContextFreeBinding: true,
        };

        vitest
          .mocked(buildPlanBindingConstraintsList)
          .mockReturnValueOnce(buildPlanBindingConstraintsListFixture);

        vitest
          .mocked(removeServiceNodeBindingIfContextFree)
          .mockReturnValueOnce(planServiceNodeBindingRemovedResultFixture);

        result = removeRootServiceNodeBindingIfContextFree(
          paramsFixture,
          lazyPlanServiceNodeFixture,
          bindingMock,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call removeServiceNodeBindingIfContextFree()', () => {
        expect(
          removeServiceNodeBindingIfContextFree,
        ).toHaveBeenCalledExactlyOnceWith(
          lazyPlanServiceNodeFixture,
          bindingMock,
          buildPlanBindingConstraintsListFixture,
          false,
        );
      });

      it('should return expected value', () => {
        expect(result).toStrictEqual(
          planServiceNodeBindingRemovedResultFixture,
        );
      });
    });
  });
});
