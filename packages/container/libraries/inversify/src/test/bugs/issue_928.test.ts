import { describe, expect, it } from 'vitest';

import {
  Container,
  type Injectable,
  type InjectOptional,
  Newable,
} from '../../index.js';

describe('Issue 928', () => {
  it('should inject the right instances', () => {
    let injectedA: unknown;
    let injectedB: unknown;
    let injectedC: unknown;

    class DepA implements Injectable {
      public a: number = 1;
    }
    class DepB implements Injectable {
      public b: number = 1;
    }
    class DepC implements Injectable {
      public c: number = 1;
    }

    abstract class AbstractCls implements Injectable {
      constructor(
        a: DepA,
        b: InjectOptional<DepB> = { b: 0 },
      ) {
        injectedA = a;
        injectedB = b;
      }
    }

    class Cls extends AbstractCls implements Injectable {
      constructor(
        c: DepC,
        b: InjectOptional<DepB> = { b: 0 },
        a: DepA,
      ) {
        super(a, b);

        injectedC = c;
      }
    }

    const container: Container = new Container();
    [DepA, DepB, DepC, Cls].forEach((i: Newable<unknown>) =>
      container.bind(i).toSelf().inSingletonScope(),
    );

    container.get(Cls);

    expect(injectedA).toStrictEqual(new DepA());
    expect(injectedB).toStrictEqual(new DepB());
    expect(injectedC).toStrictEqual(new DepC());
  });
});
