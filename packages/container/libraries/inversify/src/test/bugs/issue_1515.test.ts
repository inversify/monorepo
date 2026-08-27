import { describe, expect, it } from 'vitest';

import {
  Container,
  type Inject,
  type Injectable,
  type InjectMulti,
} from '../../index.js';

describe('Issue 1515', () => {
  it('should properly throw on circular dependency', () => {
    class Circle1 implements Injectable {
      constructor(public readonly circle2: Inject<Circle2>) {}
    }

    class Circle2 implements Injectable {
      constructor(public circle1: Inject<Circle1>) {}
    }

    abstract class Multi implements Injectable {}
    class Multi1 extends Multi {}
    class Multi2 extends Multi {}
    class Multi3 extends Multi {}

    class Top implements Injectable {
      constructor(
        public readonly multis: InjectMulti<Multi>,
        public readonly circle1: Inject<Circle1>,
      ) {}
    }

    const container: Container = new Container();

    container.bind(Multi).to(Multi1);
    container.bind(Multi).to(Multi2);
    container.bind(Multi).to(Multi3);
    container.bind(Circle1).toSelf();
    container.bind(Circle2).toSelf();
    container.bind(Top).toSelf();

    expect(() => {
      container.get(Top);
    }).toThrow(
      'Circular dependency found: Top -> Circle1 -> Circle2 -> Circle1',
    );
  });
});
