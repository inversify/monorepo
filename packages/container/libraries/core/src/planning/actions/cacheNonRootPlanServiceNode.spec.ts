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

import { type ServiceIdentifier } from '@inversifyjs/common';

import { GetPlanOptionsFixtures } from '../fixtures/GetPlanOptionsFixtures.js';
import { type GetPlanOptions } from '../models/GetPlanOptions.js';
import { LazyPlanServiceNode } from '../models/LazyPlanServiceNode.js';
import { type NonCachedServiceNodeContext } from '../models/NonCachedServiceNodeContext.js';
import { type PlanParamsOperations } from '../models/PlanParamsOperations.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { cacheNonRootPlanServiceNode } from './cacheNonRootPlanServiceNode.js';

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

describe(cacheNonRootPlanServiceNode, () => {
  let operationsMock: Mocked<PlanParamsOperations>;

  beforeAll(() => {
    operationsMock = {
      setNonCachedServiceNode: vitest.fn(),
      setPlan: vitest.fn(),
    } as Partial<Mocked<PlanParamsOperations>> as Mocked<PlanParamsOperations>;
  });

  describe('having GetPlanOptions undefined', () => {
    let planServiceNodeFixture: PlanServiceNode;
    let contextFixture: NonCachedServiceNodeContext;

    beforeAll(() => {
      planServiceNodeFixture = Symbol() as unknown as PlanServiceNode;
      contextFixture = Symbol() as unknown as NonCachedServiceNodeContext;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = cacheNonRootPlanServiceNode(
          undefined,
          operationsMock,
          planServiceNodeFixture,
          contextFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call operations.setNonCachedServiceNode()', () => {
        expect(
          operationsMock.setNonCachedServiceNode,
        ).toHaveBeenCalledExactlyOnceWith(
          planServiceNodeFixture,
          contextFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having PlanServiceNode with isContextFree false', () => {
    let getPlanOptionsFixture: GetPlanOptions;
    let planServiceNodeFixture: PlanServiceNode;
    let contextFixture: NonCachedServiceNodeContext;

    beforeAll(() => {
      getPlanOptionsFixture = GetPlanOptionsFixtures.any;
      planServiceNodeFixture = {
        bindings: undefined,
        isContextFree: false,
        serviceIdentifier: Symbol(),
      };
      contextFixture = Symbol() as unknown as NonCachedServiceNodeContext;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = cacheNonRootPlanServiceNode(
          getPlanOptionsFixture,
          operationsMock,
          planServiceNodeFixture,
          contextFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call operations.setNonCachedServiceNode()', () => {
        expect(
          operationsMock.setNonCachedServiceNode,
        ).toHaveBeenCalledExactlyOnceWith(
          planServiceNodeFixture,
          contextFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having PlanServiceNode with isContextFree true', () => {
    let getPlanOptionsFixture: GetPlanOptions;
    let planServiceNodeFixture: PlanServiceNode;
    let contextFixture: NonCachedServiceNodeContext;

    beforeAll(() => {
      getPlanOptionsFixture = GetPlanOptionsFixtures.any;
      planServiceNodeFixture = {
        bindings: undefined,
        isContextFree: true,
        serviceIdentifier: Symbol(),
      };
      contextFixture = Symbol() as unknown as NonCachedServiceNodeContext;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = cacheNonRootPlanServiceNode(
          getPlanOptionsFixture,
          operationsMock,
          planServiceNodeFixture,
          contextFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call operations.setPlan()', () => {
        expect(operationsMock.setPlan).toHaveBeenCalledExactlyOnceWith(
          getPlanOptionsFixture,
          {
            tree: {
              root: planServiceNodeFixture,
            },
          },
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having non expanded LazyPlanServiceNode', () => {
    let getPlanOptionsFixture: GetPlanOptions;
    let planServiceNodeFixture: PlanServiceNode;
    let contextFixture: NonCachedServiceNodeContext;

    beforeAll(() => {
      getPlanOptionsFixture = GetPlanOptionsFixtures.any;
      planServiceNodeFixture = new LazyPlanServiceNodeTest(
        undefined,
        Symbol(),
        vitest.fn(),
      );
      contextFixture = Symbol() as unknown as NonCachedServiceNodeContext;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = cacheNonRootPlanServiceNode(
          getPlanOptionsFixture,
          operationsMock,
          planServiceNodeFixture,
          contextFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call operations.setPlan()', () => {
        expect(operationsMock.setPlan).toHaveBeenCalledExactlyOnceWith(
          getPlanOptionsFixture,
          {
            tree: {
              root: planServiceNodeFixture,
            },
          },
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
