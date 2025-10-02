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

import { ServiceIdentifier } from '@inversifyjs/common';

import { Binding } from '../../binding/models/Binding';
import {
  BindingConstraintsImplementation,
  InternalBindingConstraints,
} from '../../binding/models/BindingConstraintsImplementation';
import { bindingScopeValues } from '../../binding/models/BindingScope';
import { bindingTypeValues } from '../../binding/models/BindingType';
import { SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList';
import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { PlanServiceNodeBindingRemovedResult } from '../../metadata/models/PlanServiceNodeBindingRemovedResult';
import { LazyPlanServiceNode } from '../models/LazyPlanServiceNode';
import { PlanBindingNode } from '../models/PlanBindingNode';
import { PlanServiceNode } from '../models/PlanServiceNode';
import { removeServiceNodeBindingIfContextFree } from './removeServiceNodeBindingIfContextFree';

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

describe(removeServiceNodeBindingIfContextFree, () => {
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
        result = removeServiceNodeBindingIfContextFree(
          lazyPlanServiceNodeFixture,
          Symbol() as unknown as Binding<unknown>,
          Symbol() as unknown as SingleImmutableLinkedList<InternalBindingConstraints>,
          false,
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

  describe('having an expanded lazy service node with an array with a single binding and bindingConstraintsList with elems with getAncestorsCalled false', () => {
    let serviceIdentifierFixture: ServiceIdentifier;
    let bindingMock: Mocked<Binding<unknown>>;
    let planBindingNodeFixture: PlanBindingNode;
    let bindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;
    let optionalBindings: boolean;

    beforeAll(() => {
      serviceIdentifierFixture = Symbol();

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
        serviceIdentifier: serviceIdentifierFixture,
        type: bindingTypeValues.ConstantValue,
        value: Symbol(),
      };

      planBindingNodeFixture = {
        binding: bindingMock,
      } as PlanBindingNode;

      bindingConstraintsListFixture =
        new SingleImmutableLinkedList<InternalBindingConstraints>({
          elem: {
            getAncestorsCalled: false,
            name: undefined,
            serviceIdentifier: serviceIdentifierFixture,
            tags: new Map(),
          },
          previous: undefined,
        });

      optionalBindings = false;
    });

    describe('when called, and binding.isSatisfiedBy() returns false', () => {
      let lazyPlanServiceNodeFixture: LazyPlanServiceNode;

      let result: unknown;

      beforeAll(() => {
        lazyPlanServiceNodeFixture = new LazyPlanServiceNodeTest(
          {
            bindings: [planBindingNodeFixture],
            isContextFree: true,
            serviceIdentifier: serviceIdentifierFixture,
          },
          serviceIdentifierFixture,
          vitest.fn(),
        );

        bindingMock.isSatisfiedBy.mockReturnValueOnce(false);

        result = removeServiceNodeBindingIfContextFree(
          lazyPlanServiceNodeFixture,
          bindingMock,
          bindingConstraintsListFixture,
          optionalBindings,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call binding.isSatisfiedBy()', () => {
        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledExactlyOnceWith(
          new BindingConstraintsImplementation(
            bindingConstraintsListFixture.last,
          ),
        );
      });

      it('should return expected value', () => {
        const expected: PlanServiceNodeBindingRemovedResult = {
          bindingNodeRemoved: undefined,
          isContextFreeBinding:
            !bindingConstraintsListFixture.last.elem.getAncestorsCalled,
        };

        expect(result).toStrictEqual(expected);
      });

      it('should not remove binding from service node bindings', () => {
        expect(lazyPlanServiceNodeFixture.bindings).toStrictEqual([
          planBindingNodeFixture,
        ]);
      });
    });

    describe('when called, and binding.isSatisfiedBy() returns true', () => {
      let lazyPlanServiceNodeFixture: LazyPlanServiceNode;

      let result: unknown;

      beforeAll(() => {
        lazyPlanServiceNodeFixture = new LazyPlanServiceNodeTest(
          {
            bindings: [planBindingNodeFixture],
            isContextFree: true,
            serviceIdentifier: serviceIdentifierFixture,
          },
          serviceIdentifierFixture,
          vitest.fn(),
        );

        bindingMock.isSatisfiedBy.mockReturnValueOnce(true);

        result = removeServiceNodeBindingIfContextFree(
          lazyPlanServiceNodeFixture,
          bindingMock,
          bindingConstraintsListFixture,
          optionalBindings,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call binding.isSatisfiedBy()', () => {
        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledExactlyOnceWith(
          new BindingConstraintsImplementation(
            bindingConstraintsListFixture.last,
          ),
        );
      });

      it('should return expected value', () => {
        const expected: PlanServiceNodeBindingRemovedResult = {
          bindingNodeRemoved: planBindingNodeFixture,
          isContextFreeBinding:
            !bindingConstraintsListFixture.last.elem.getAncestorsCalled,
        };

        expect(result).toStrictEqual(expected);
      });

      it('should remove binding from service node bindings', () => {
        expect(lazyPlanServiceNodeFixture.bindings).toStrictEqual([]);
      });
    });
  });

  describe('having an expanded lazy service node with an array of bindings and bindingConstraintsList with elems with getAncestorsCalled true', () => {
    let lazyPlanServiceNodeFixture: LazyPlanServiceNode;
    let bindingMock: Mocked<Binding<unknown>>;
    let bindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;
    let optionalBindings: boolean;

    beforeAll(() => {
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

      bindingConstraintsListFixture =
        new SingleImmutableLinkedList<InternalBindingConstraints>({
          elem: {
            getAncestorsCalled: true,
            name: undefined,
            serviceIdentifier,
            tags: new Map(),
          },
          previous: undefined,
        });

      optionalBindings = false;
    });

    describe('when called, and binding.isSatisfiedBy() returns true', () => {
      let result: unknown;

      beforeAll(() => {
        bindingMock.isSatisfiedBy.mockReturnValueOnce(true);

        result = removeServiceNodeBindingIfContextFree(
          lazyPlanServiceNodeFixture,
          bindingMock,
          bindingConstraintsListFixture,
          optionalBindings,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call binding.isSatisfiedBy()', () => {
        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledExactlyOnceWith(
          new BindingConstraintsImplementation(
            bindingConstraintsListFixture.last,
          ),
        );
      });

      it('should return expected value', () => {
        const expected: PlanServiceNodeBindingRemovedResult = {
          bindingNodeRemoved: undefined,
          isContextFreeBinding:
            !bindingConstraintsListFixture.last.elem.getAncestorsCalled,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having an expanded lazy service node with a single binding and bindingConstraintsList with elems with getAncestorsCalled false', () => {
    let serviceIdentifierFixture: ServiceIdentifier;
    let bindingMock: Mocked<Binding<unknown>>;
    let planBindingNodeFixture: PlanBindingNode;
    let bindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;
    let optionalBindings: boolean;

    beforeAll(() => {
      serviceIdentifierFixture = Symbol();

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
        serviceIdentifier: serviceIdentifierFixture,
        type: bindingTypeValues.ConstantValue,
        value: Symbol(),
      };

      planBindingNodeFixture = {
        binding: bindingMock,
      } as PlanBindingNode;

      bindingConstraintsListFixture =
        new SingleImmutableLinkedList<InternalBindingConstraints>({
          elem: {
            getAncestorsCalled: false,
            name: undefined,
            serviceIdentifier: serviceIdentifierFixture,
            tags: new Map(),
          },
          previous: undefined,
        });

      optionalBindings = false;
    });

    describe('when called, and binding.isSatisfiedBy() returns true', () => {
      let lazyPlanServiceNodeFixture: LazyPlanServiceNode;

      let result: unknown;

      beforeAll(() => {
        lazyPlanServiceNodeFixture = new LazyPlanServiceNodeTest(
          {
            bindings: planBindingNodeFixture,
            isContextFree: true,
            serviceIdentifier: serviceIdentifierFixture,
          },
          serviceIdentifierFixture,
          vitest.fn(),
        );

        bindingMock.isSatisfiedBy.mockReturnValueOnce(true);

        result = removeServiceNodeBindingIfContextFree(
          lazyPlanServiceNodeFixture,
          bindingMock,
          bindingConstraintsListFixture,
          optionalBindings,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call binding.isSatisfiedBy()', () => {
        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledExactlyOnceWith(
          new BindingConstraintsImplementation(
            bindingConstraintsListFixture.last,
          ),
        );
      });

      it('should return expected value', () => {
        const expected: PlanServiceNodeBindingRemovedResult = {
          bindingNodeRemoved: planBindingNodeFixture,
          isContextFreeBinding:
            !bindingConstraintsListFixture.last.elem.getAncestorsCalled,
        };

        expect(result).toStrictEqual(expected);
      });

      it('should remove binding from service node bindings', () => {
        expect(lazyPlanServiceNodeFixture.isExpanded()).toBe(false);
      });
    });
  });

  describe('having a non lazy service node with a single binding and bindingConstraintsList with elems with getAncestorsCalled false', () => {
    let serviceIdentifierFixture: ServiceIdentifier;
    let bindingMock: Mocked<Binding<unknown>>;
    let planBindingNodeFixture: PlanBindingNode;
    let bindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;
    let optionalBindings: boolean;

    beforeAll(() => {
      serviceIdentifierFixture = Symbol();

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
        serviceIdentifier: serviceIdentifierFixture,
        type: bindingTypeValues.ConstantValue,
        value: Symbol(),
      };

      planBindingNodeFixture = {
        binding: bindingMock,
      } as PlanBindingNode;

      bindingConstraintsListFixture =
        new SingleImmutableLinkedList<InternalBindingConstraints>({
          elem: {
            getAncestorsCalled: false,
            name: undefined,
            serviceIdentifier: serviceIdentifierFixture,
            tags: new Map(),
          },
          previous: undefined,
        });

      optionalBindings = false;
    });

    describe('when called, and binding.isSatisfiedBy() returns true', () => {
      let planServiceNodeFixture: PlanServiceNode;

      let result: unknown;

      beforeAll(() => {
        planServiceNodeFixture = {
          bindings: planBindingNodeFixture,
          isContextFree: true,
          serviceIdentifier: serviceIdentifierFixture,
        };

        bindingMock.isSatisfiedBy.mockReturnValueOnce(true);

        try {
          removeServiceNodeBindingIfContextFree(
            planServiceNodeFixture,
            bindingMock,
            bindingConstraintsListFixture,
            optionalBindings,
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call binding.isSatisfiedBy()', () => {
        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledExactlyOnceWith(
          new BindingConstraintsImplementation(
            bindingConstraintsListFixture.last,
          ),
        );
      });

      it('should throw expected error', () => {
        const expectedErrorProperties: Partial<InversifyCoreError> = {
          kind: InversifyCoreErrorKind.planning,
          message:
            'Unexpected non-lazy plan service node. This is likely a bug in the planning logic. Please, report this issue',
        };

        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });
  });

  describe('having an expanded lazy service node with a single binding and bindingConstraintsList with elems with getAncestorsCalled false and optional bindings', () => {
    let serviceIdentifierFixture: ServiceIdentifier;
    let bindingMock: Mocked<Binding<unknown>>;
    let planBindingNodeFixture: PlanBindingNode;
    let bindingConstraintsListFixture: SingleImmutableLinkedList<InternalBindingConstraints>;
    let optionalBindings: boolean;

    beforeAll(() => {
      serviceIdentifierFixture = Symbol();

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
        serviceIdentifier: serviceIdentifierFixture,
        type: bindingTypeValues.ConstantValue,
        value: Symbol(),
      };

      planBindingNodeFixture = {
        binding: bindingMock,
      } as PlanBindingNode;

      bindingConstraintsListFixture =
        new SingleImmutableLinkedList<InternalBindingConstraints>({
          elem: {
            getAncestorsCalled: false,
            name: undefined,
            serviceIdentifier: serviceIdentifierFixture,
            tags: new Map(),
          },
          previous: undefined,
        });

      optionalBindings = true;
    });

    describe('when called, and binding.isSatisfiedBy() returns true', () => {
      let lazyPlanServiceNodeFixture: LazyPlanServiceNode;

      let result: unknown;

      beforeAll(() => {
        lazyPlanServiceNodeFixture = new LazyPlanServiceNodeTest(
          {
            bindings: planBindingNodeFixture,
            isContextFree: true,
            serviceIdentifier: serviceIdentifierFixture,
          },
          serviceIdentifierFixture,
          vitest.fn(),
        );

        bindingMock.isSatisfiedBy.mockReturnValueOnce(true);

        result = removeServiceNodeBindingIfContextFree(
          lazyPlanServiceNodeFixture,
          bindingMock,
          bindingConstraintsListFixture,
          optionalBindings,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call binding.isSatisfiedBy()', () => {
        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledExactlyOnceWith(
          new BindingConstraintsImplementation(
            bindingConstraintsListFixture.last,
          ),
        );
      });

      it('should return expected value', () => {
        const expected: PlanServiceNodeBindingRemovedResult = {
          bindingNodeRemoved: planBindingNodeFixture,
          isContextFreeBinding:
            !bindingConstraintsListFixture.last.elem.getAncestorsCalled,
        };

        expect(result).toStrictEqual(expected);
      });

      it('should remove binding from service node bindings', () => {
        expect(lazyPlanServiceNodeFixture.bindings).toBeUndefined();
      });
    });
  });
});
