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

vitest.mock('./curryBuildServiceNodeBindings', () => {
  const buildServiceNodeBindingsMock: Mock<
    (
      params: BasePlanParams,
      bindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints>,
      serviceBindings: Binding<unknown>[],
      parentNode: BindingNodeParent,
      chainedBindings: boolean,
    ) => PlanBindingNode[]
  > = vitest.fn();

  return {
    curryBuildServiceNodeBindings: vitest
      .fn()
      .mockReturnValue(buildServiceNodeBindingsMock),
  };
});
vitest.mock('./curryLazyBuildPlanServiceNodeFromClassElementMetadata');
vitest.mock('./curryLazyBuildPlanServiceNodeFromResolvedValueElementMetadata');
vitest.mock('./currySubplan');
vitest.mock('./plan');

import { ServiceIdentifier } from '@inversifyjs/common';

import { Binding } from '../../binding/models/Binding';
import {
  BindingConstraintsImplementation,
  InternalBindingConstraints,
} from '../../binding/models/BindingConstraintsImplementation';
import { bindingScopeValues } from '../../binding/models/BindingScope';
import { bindingTypeValues } from '../../binding/models/BindingType';
import { SingleInmutableLinkedList } from '../../common/models/SingleInmutableLinkedList';
import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { PlanServiceNodeBindingAddedResult } from '../../metadata/models/PlanServiceNodeUpdateResult';
import { BasePlanParams } from '../models/BasePlanParams';
import { BindingNodeParent } from '../models/BindingNodeParent';
import { LazyPlanServiceNode } from '../models/LazyPlanServiceNode';
import { PlanBindingNode } from '../models/PlanBindingNode';
import { PlanServiceNode } from '../models/PlanServiceNode';
import { addServiceNodeBindingIfContextFree } from './addServiceNodeBindingIfContextFree';
import { curryBuildServiceNodeBindings } from './curryBuildServiceNodeBindings';

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

describe(addServiceNodeBindingIfContextFree, () => {
  let buildServiceNodeBindingsMock: Mock<
    (
      params: BasePlanParams,
      bindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints>,
      serviceBindings: Binding<unknown>[],
      parentNode: BindingNodeParent,
      chainedBindings: boolean,
    ) => PlanBindingNode[]
  >;

  beforeAll(() => {
    buildServiceNodeBindingsMock = vitest.mocked(
      curryBuildServiceNodeBindings(vitest.fn()),
    );
  });

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
        result = addServiceNodeBindingIfContextFree(
          Symbol() as unknown as BasePlanParams,
          lazyPlanServiceNodeFixture,
          Symbol() as unknown as Binding<unknown>,
          Symbol() as unknown as SingleInmutableLinkedList<InternalBindingConstraints>,
          false,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return expected value', () => {
        const expected: PlanServiceNodeBindingAddedResult = {
          isContextFreeBinding: true,
          shouldInvalidateServiceNode: false,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having an expanded lazy service node with an array of bindings and bindingConstraintsList with elems with getAncestorsCalled false', () => {
    let paramsFixture: BasePlanParams;
    let lazyPlanServiceNodeFixture: LazyPlanServiceNode;
    let bindingMock: Mocked<Binding<unknown>>;
    let bindingConstraintsListFixture: SingleInmutableLinkedList<InternalBindingConstraints>;
    let chainedBindings: boolean;

    beforeAll(() => {
      paramsFixture = Symbol() as unknown as BasePlanParams;

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
        new SingleInmutableLinkedList<InternalBindingConstraints>({
          elem: {
            getAncestorsCalled: false,
            name: undefined,
            serviceIdentifier,
            tags: new Map(),
          },
          previous: undefined,
        });

      chainedBindings = false;
    });

    describe('when called, and binding.isSatisfiedBy() returns false', () => {
      let result: unknown;

      beforeAll(() => {
        bindingMock.isSatisfiedBy.mockReturnValueOnce(false);

        result = addServiceNodeBindingIfContextFree(
          paramsFixture,
          lazyPlanServiceNodeFixture,
          bindingMock,
          bindingConstraintsListFixture,
          chainedBindings,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call binding.isSatisfiedBy()', () => {
        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledTimes(1);
        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledWith(
          new BindingConstraintsImplementation(
            bindingConstraintsListFixture.last,
          ),
        );
      });

      it('should return expected value', () => {
        const expected: PlanServiceNodeBindingAddedResult = {
          isContextFreeBinding:
            !bindingConstraintsListFixture.last.elem.getAncestorsCalled,
          shouldInvalidateServiceNode: false,
        };

        expect(result).toStrictEqual(expected);
      });
    });

    describe('when called, and binding.isSatisfiedBy() returns true', () => {
      let planBindingNodeFixture: PlanBindingNode;

      let result: unknown;

      beforeAll(() => {
        planBindingNodeFixture = Symbol() as unknown as PlanBindingNode;

        bindingMock.isSatisfiedBy.mockReturnValueOnce(true);

        buildServiceNodeBindingsMock.mockReturnValueOnce([
          planBindingNodeFixture,
        ]);

        result = addServiceNodeBindingIfContextFree(
          paramsFixture,
          lazyPlanServiceNodeFixture,
          bindingMock,
          bindingConstraintsListFixture,
          chainedBindings,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call binding.isSatisfiedBy()', () => {
        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledTimes(1);
        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledWith(
          new BindingConstraintsImplementation(
            bindingConstraintsListFixture.last,
          ),
        );
      });

      it('should call buildServiceNodeBindings()', () => {
        expect(buildServiceNodeBindingsMock).toHaveBeenCalledTimes(1);
        expect(buildServiceNodeBindingsMock).toHaveBeenCalledWith(
          paramsFixture,
          bindingConstraintsListFixture,
          [bindingMock],
          lazyPlanServiceNodeFixture,
          chainedBindings,
        );
      });

      it('should return expected value', () => {
        const expected: PlanServiceNodeBindingAddedResult = {
          isContextFreeBinding:
            !bindingConstraintsListFixture.last.elem.getAncestorsCalled,
          shouldInvalidateServiceNode: false,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having an expanded lazy service node with an array of bindings and bindingConstraintsList with elems with getAncestorsCalled true', () => {
    let paramsFixture: BasePlanParams;
    let lazyPlanServiceNodeFixture: LazyPlanServiceNode;
    let bindingMock: Mocked<Binding<unknown>>;
    let bindingConstraintsListFixture: SingleInmutableLinkedList<InternalBindingConstraints>;
    let chainedBindings: boolean;

    beforeAll(() => {
      paramsFixture = Symbol() as unknown as BasePlanParams;

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
        new SingleInmutableLinkedList<InternalBindingConstraints>({
          elem: {
            getAncestorsCalled: true,
            name: undefined,
            serviceIdentifier,
            tags: new Map(),
          },
          previous: undefined,
        });

      chainedBindings = false;
    });

    describe('when called, and binding.isSatisfiedBy() returns true', () => {
      let result: unknown;

      beforeAll(() => {
        bindingMock.isSatisfiedBy.mockReturnValueOnce(true);

        result = addServiceNodeBindingIfContextFree(
          paramsFixture,
          lazyPlanServiceNodeFixture,
          bindingMock,
          bindingConstraintsListFixture,
          chainedBindings,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call binding.isSatisfiedBy()', () => {
        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledTimes(1);
        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledWith(
          new BindingConstraintsImplementation(
            bindingConstraintsListFixture.last,
          ),
        );
      });

      it('should return expected value', () => {
        const expected: PlanServiceNodeBindingAddedResult = {
          isContextFreeBinding:
            !bindingConstraintsListFixture.last.elem.getAncestorsCalled,
          shouldInvalidateServiceNode: false,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having an expanded lazy service node with undefined bindings and bindingConstraintsList with elems with getAncestorsCalled false', () => {
    let paramsFixture: BasePlanParams;
    let lazyPlanServiceNodeFixture: LazyPlanServiceNode;
    let bindingMock: Mocked<Binding<unknown>>;
    let bindingConstraintsListFixture: SingleInmutableLinkedList<InternalBindingConstraints>;
    let chainedBindings: boolean;

    beforeAll(() => {
      paramsFixture = Symbol() as unknown as BasePlanParams;

      const serviceIdentifier: ServiceIdentifier = Symbol();

      lazyPlanServiceNodeFixture = new LazyPlanServiceNodeTest(
        {
          bindings: undefined,
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
        new SingleInmutableLinkedList<InternalBindingConstraints>({
          elem: {
            getAncestorsCalled: false,
            name: undefined,
            serviceIdentifier,
            tags: new Map(),
          },
          previous: undefined,
        });

      chainedBindings = false;
    });

    describe('when called, and binding.isSatisfiedBy() returns true', () => {
      let planBindingNodeFixture: PlanBindingNode;

      let result: unknown;

      beforeAll(() => {
        planBindingNodeFixture = Symbol() as unknown as PlanBindingNode;

        bindingMock.isSatisfiedBy.mockReturnValueOnce(true);

        buildServiceNodeBindingsMock.mockReturnValueOnce([
          planBindingNodeFixture,
        ]);

        result = addServiceNodeBindingIfContextFree(
          paramsFixture,
          lazyPlanServiceNodeFixture,
          bindingMock,
          bindingConstraintsListFixture,
          chainedBindings,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call binding.isSatisfiedBy()', () => {
        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledTimes(1);
        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledWith(
          new BindingConstraintsImplementation(
            bindingConstraintsListFixture.last,
          ),
        );
      });

      it('should call buildServiceNodeBindings()', () => {
        expect(buildServiceNodeBindingsMock).toHaveBeenCalledTimes(1);
        expect(buildServiceNodeBindingsMock).toHaveBeenCalledWith(
          paramsFixture,
          bindingConstraintsListFixture,
          [bindingMock],
          lazyPlanServiceNodeFixture,
          chainedBindings,
        );
      });

      it('should return expected value', () => {
        const expected: PlanServiceNodeBindingAddedResult = {
          isContextFreeBinding:
            !bindingConstraintsListFixture.last.elem.getAncestorsCalled,
          shouldInvalidateServiceNode: false,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having an expanded lazy service node with single binding and bindingConstraintsList with elems with getAncestorsCalled false', () => {
    let paramsFixture: BasePlanParams;
    let lazyPlanServiceNodeFixture: LazyPlanServiceNode;
    let bindingMock: Mocked<Binding<unknown>>;
    let bindingConstraintsListFixture: SingleInmutableLinkedList<InternalBindingConstraints>;
    let chainedBindings: boolean;

    beforeAll(() => {
      paramsFixture = Symbol() as unknown as BasePlanParams;

      const serviceIdentifier: ServiceIdentifier = Symbol();

      lazyPlanServiceNodeFixture = new LazyPlanServiceNodeTest(
        {
          bindings: Symbol() as unknown as PlanBindingNode,
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
        new SingleInmutableLinkedList<InternalBindingConstraints>({
          elem: {
            getAncestorsCalled: false,
            name: undefined,
            serviceIdentifier,
            tags: new Map(),
          },
          previous: undefined,
        });

      chainedBindings = false;
    });

    describe('when called, and binding.isSatisfiedBy() returns true', () => {
      let planBindingNodeFixture: PlanBindingNode;

      let result: unknown;

      beforeAll(() => {
        planBindingNodeFixture = Symbol() as unknown as PlanBindingNode;

        bindingMock.isSatisfiedBy.mockReturnValueOnce(true);

        buildServiceNodeBindingsMock.mockReturnValueOnce([
          planBindingNodeFixture,
        ]);

        result = addServiceNodeBindingIfContextFree(
          paramsFixture,
          lazyPlanServiceNodeFixture,
          bindingMock,
          bindingConstraintsListFixture,
          chainedBindings,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call binding.isSatisfiedBy()', () => {
        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledTimes(1);
        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledWith(
          new BindingConstraintsImplementation(
            bindingConstraintsListFixture.last,
          ),
        );
      });

      it('should call buildServiceNodeBindings()', () => {
        expect(buildServiceNodeBindingsMock).toHaveBeenCalledTimes(1);
        expect(buildServiceNodeBindingsMock).toHaveBeenCalledWith(
          paramsFixture,
          bindingConstraintsListFixture,
          [bindingMock],
          lazyPlanServiceNodeFixture,
          chainedBindings,
        );
      });

      it('should return expected value', () => {
        const expected: PlanServiceNodeBindingAddedResult = {
          isContextFreeBinding:
            !bindingConstraintsListFixture.last.elem.getAncestorsCalled,
          shouldInvalidateServiceNode: true,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a non lazy service node with single binding and bindingConstraintsList with elems with getAncestorsCalled false', () => {
    let paramsFixture: BasePlanParams;
    let planServiceNodeFixture: PlanServiceNode;
    let bindingMock: Mocked<Binding<unknown>>;
    let bindingConstraintsListFixture: SingleInmutableLinkedList<InternalBindingConstraints>;
    let chainedBindings: boolean;

    beforeAll(() => {
      paramsFixture = Symbol() as unknown as BasePlanParams;

      const serviceIdentifier: ServiceIdentifier = Symbol();

      planServiceNodeFixture = {
        bindings: Symbol() as unknown as PlanBindingNode,
        isContextFree: true,
        serviceIdentifier: serviceIdentifier,
      };

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
        new SingleInmutableLinkedList<InternalBindingConstraints>({
          elem: {
            getAncestorsCalled: false,
            name: undefined,
            serviceIdentifier,
            tags: new Map(),
          },
          previous: undefined,
        });

      chainedBindings = false;
    });

    describe('when called, and binding.isSatisfiedBy() returns true', () => {
      let planBindingNodeFixture: PlanBindingNode;

      let result: unknown;

      beforeAll(() => {
        planBindingNodeFixture = Symbol() as unknown as PlanBindingNode;

        bindingMock.isSatisfiedBy.mockReturnValueOnce(true);

        buildServiceNodeBindingsMock.mockReturnValueOnce([
          planBindingNodeFixture,
        ]);

        try {
          addServiceNodeBindingIfContextFree(
            paramsFixture,
            planServiceNodeFixture,
            bindingMock,
            bindingConstraintsListFixture,
            chainedBindings,
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call binding.isSatisfiedBy()', () => {
        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledTimes(1);
        expect(bindingMock.isSatisfiedBy).toHaveBeenCalledWith(
          new BindingConstraintsImplementation(
            bindingConstraintsListFixture.last,
          ),
        );
      });

      it('should call buildServiceNodeBindings()', () => {
        expect(buildServiceNodeBindingsMock).toHaveBeenCalledTimes(1);
        expect(buildServiceNodeBindingsMock).toHaveBeenCalledWith(
          paramsFixture,
          bindingConstraintsListFixture,
          [bindingMock],
          planServiceNodeFixture,
          chainedBindings,
        );
      });

      it('should return expected error', () => {
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
});
