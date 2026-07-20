import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container, inject, injectable } from '../../index.js';

const CHILD_CONTAINER_ITERATIONS: number = 50_000;
/*
 * A retained PlanResultCacheService / plan graph per child grows into the
 * hundreds of MB at this iteration count (see issue #1810). Allow some V8
 * heap noise, but fail well below a real subscriber leak.
 */
const MAX_HEAP_GROWTH_MB: number = 32;

async function collectGarbage(): Promise<void> {
  /*
   * Child plan-cache subscribers are weakly held. Yielding to the event loop
   * before GC matches the collection conditions described when fixing #1810.
   */
  await new Promise<void>((resolve: () => void) => {
    setImmediate(resolve);
  });

  if (globalThis.gc === undefined) {
    throw new Error(
      'Garbage collector is not exposed. Run the tests with the --expose-gc flag.',
    );
  }

  globalThis.gc();
}

function getHeapUsedMb(): number {
  return Math.round(process.memoryUsage().heapUsed / 1e6);
}

describe('Issue 1810', () => {
  describe('when many temporary child containers resolve instance bindings', () => {
    @injectable()
    class Dependency {}

    @injectable()
    class Service {
      constructor(
        @inject(Dependency)
        public readonly dependency: Dependency,
      ) {}
    }

    let parentContainer: Container;
    let heapUsedAfterChildrenMb: number;
    let heapUsedBaselineMb: number;

    beforeAll(async () => {
      parentContainer = new Container();
      parentContainer.bind(Dependency).toSelf();
      parentContainer.bind(Service).toSelf();

      {
        const warmupChild: Container = new Container({
          parent: parentContainer,
        });
        warmupChild.get(Service);
      }

      await collectGarbage();

      heapUsedBaselineMb = getHeapUsedMb();

      for (let i: number = 0; i < CHILD_CONTAINER_ITERATIONS; ++i) {
        const childContainer: Container = new Container({
          parent: parentContainer,
        });

        /*
         * Resolving an instance binding builds PlanSingleBindingServiceNode
         * handlers over dynamically resolvable binding nodes (WeakRef-based).
         */
        childContainer.get(Service);
      }

      await collectGarbage();

      heapUsedAfterChildrenMb = getHeapUsedMb();
    }, 120_000);

    afterAll(() => {
      parentContainer = undefined as unknown as Container;
    });

    it('should not retain a large amount of heap after child containers are discarded', () => {
      const heapGrowthMb: number = heapUsedAfterChildrenMb - heapUsedBaselineMb;

      expect(
        heapGrowthMb,
        `heap grew by ${String(heapGrowthMb)}MB (baseline=${String(heapUsedBaselineMb)}MB, after=${String(heapUsedAfterChildrenMb)}MB)`,
      ).toBeLessThan(MAX_HEAP_GROWTH_MB);
    });
  });

  describe('when cache plans are regenerated over time', () => {
    @injectable()
    class Dependency {}

    @injectable()
    class Service {
      constructor(
        @inject(Dependency)
        public readonly dependency: Dependency,
      ) {}
    }

    let container: Container;
    let heapUsedAfterChildrenMb: number;
    let heapUsedBaselineMb: number;

    beforeAll(async () => {
      container = new Container();

      await collectGarbage();

      heapUsedBaselineMb = getHeapUsedMb();

      for (let i: number = 0; i < CHILD_CONTAINER_ITERATIONS; ++i) {
        container.bind(Dependency).toSelf();
        container.bind(Service).toSelf();
        /*
         * Resolving an instance binding builds PlanSingleBindingServiceNode
         * handlers over dynamically resolvable binding nodes (WeakRef-based).
         */
        container.get(Service);

        container.unbind(Dependency);
        container.unbind(Service);
      }

      await collectGarbage();

      heapUsedAfterChildrenMb = getHeapUsedMb();
    }, 120_000);

    afterAll(() => {
      container = undefined as unknown as Container;
    });

    it('should not retain a large amount of heap after child containers are discarded', () => {
      const heapGrowthMb: number = heapUsedAfterChildrenMb - heapUsedBaselineMb;

      expect(
        heapGrowthMb,
        `heap grew by ${String(heapGrowthMb)}MB (baseline=${String(heapUsedBaselineMb)}MB, after=${String(heapUsedAfterChildrenMb)}MB)`,
      ).toBeLessThan(MAX_HEAP_GROWTH_MB);
    });
  });
});
