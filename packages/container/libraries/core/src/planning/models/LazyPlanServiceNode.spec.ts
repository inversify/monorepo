import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

import { ServiceIdentifier } from '@inversifyjs/common';

import { LazyPlanServiceNode } from './LazyPlanServiceNode';
import { PlanBindingNode } from './PlanBindingNode';
import { PlanServiceNode } from './PlanServiceNode';

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

describe(LazyPlanServiceNode, () => {
  let buildPlanServiceNodeMock: Mock<() => PlanServiceNode>;

  beforeAll(() => {
    buildPlanServiceNodeMock = vitest.fn();
  });

  describe('.bindings', () => {
    describe('having a LazyPlanServiceNode with no node', () => {
      describe('when called', () => {
        let lazyPlanServiceNode: LazyPlanServiceNodeTest;

        let planServiceNodeFixture: PlanServiceNode;

        let result: unknown;

        beforeAll(() => {
          lazyPlanServiceNode = new LazyPlanServiceNodeTest(
            Symbol() as unknown as PlanServiceNode,
            Symbol(),
            buildPlanServiceNodeMock,
          );
          lazyPlanServiceNode.invalidate();

          planServiceNodeFixture = {
            bindings: Symbol() as unknown as PlanBindingNode,
            isContextFree: true,
            serviceIdentifier: Symbol(),
          };

          vitest
            .mocked(buildPlanServiceNodeMock)
            .mockReturnValueOnce(planServiceNodeFixture);

          result = lazyPlanServiceNode.bindings;
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call buildPlanServiceNode()', () => {
          expect(buildPlanServiceNodeMock).toHaveBeenCalledExactlyOnceWith();
        });

        it('should return expected value', () => {
          expect(result).toBe(planServiceNodeFixture.bindings);
        });
      });
    });

    describe('having a LazyPlanServiceNode with node', () => {
      describe('when called', () => {
        let planServiceNodeFixture: PlanServiceNode;
        let lazyPlanServiceNode: LazyPlanServiceNode;

        let result: unknown;

        beforeAll(() => {
          planServiceNodeFixture = {
            bindings: Symbol() as unknown as PlanBindingNode,
            isContextFree: true,
            serviceIdentifier: Symbol(),
          };

          lazyPlanServiceNode = new LazyPlanServiceNodeTest(
            planServiceNodeFixture,
            Symbol(),
            buildPlanServiceNodeMock,
          );

          result = lazyPlanServiceNode.bindings;
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should not call buildPlanServiceNode()', () => {
          expect(buildPlanServiceNodeMock).not.toHaveBeenCalled();
        });

        it('should return expected value', () => {
          expect(result).toBe(planServiceNodeFixture.bindings);
        });
      });
    });
  });

  describe('.isContextFree', () => {
    describe('having a LazyPlanServiceNode with no node', () => {
      describe('when called', () => {
        let lazyPlanServiceNode: LazyPlanServiceNodeTest;

        let planServiceNodeFixture: PlanServiceNode;

        let result: unknown;

        beforeAll(() => {
          lazyPlanServiceNode = new LazyPlanServiceNodeTest(
            Symbol() as unknown as PlanServiceNode,
            Symbol(),
            buildPlanServiceNodeMock,
          );
          lazyPlanServiceNode.invalidate();

          planServiceNodeFixture = {
            bindings: Symbol() as unknown as PlanBindingNode,
            isContextFree: true,
            serviceIdentifier: Symbol(),
          };

          vitest
            .mocked(buildPlanServiceNodeMock)
            .mockReturnValueOnce(planServiceNodeFixture);

          result = lazyPlanServiceNode.isContextFree;
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call buildPlanServiceNode()', () => {
          expect(buildPlanServiceNodeMock).toHaveBeenCalledExactlyOnceWith();
        });

        it('should return expected value', () => {
          expect(result).toBe(planServiceNodeFixture.isContextFree);
        });
      });
    });

    describe('having a LazyPlanServiceNode with node', () => {
      describe('when called', () => {
        let planServiceNodeFixture: PlanServiceNode;
        let lazyPlanServiceNode: LazyPlanServiceNode;

        let result: unknown;

        beforeAll(() => {
          planServiceNodeFixture = {
            bindings: Symbol() as unknown as PlanBindingNode,
            isContextFree: true,
            serviceIdentifier: Symbol(),
          };

          lazyPlanServiceNode = new LazyPlanServiceNodeTest(
            planServiceNodeFixture,
            Symbol(),
            buildPlanServiceNodeMock,
          );

          result = lazyPlanServiceNode.isContextFree;
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should not call buildPlanServiceNode()', () => {
          expect(buildPlanServiceNodeMock).not.toHaveBeenCalled();
        });

        it('should return expected value', () => {
          expect(result).toBe(planServiceNodeFixture.isContextFree);
        });
      });
    });
  });

  describe('.serviceIdentifier', () => {
    describe('when called', () => {
      let planServiceNodeFixture: PlanServiceNode;
      let serviceIdentifierFixture: ServiceIdentifier;
      let lazyPlanServiceNode: LazyPlanServiceNode;

      let result: unknown;

      beforeAll(() => {
        planServiceNodeFixture = {
          bindings: Symbol() as unknown as PlanBindingNode,
          isContextFree: true,
          serviceIdentifier: Symbol(),
        };
        serviceIdentifierFixture = Symbol();

        lazyPlanServiceNode = new LazyPlanServiceNodeTest(
          planServiceNodeFixture,
          serviceIdentifierFixture,
          buildPlanServiceNodeMock,
        );

        result = lazyPlanServiceNode.serviceIdentifier;
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should not call buildPlanServiceNode()', () => {
        expect(buildPlanServiceNodeMock).not.toHaveBeenCalled();
      });

      it('should return expected value', () => {
        expect(result).toBe(serviceIdentifierFixture);
      });
    });
  });
});
