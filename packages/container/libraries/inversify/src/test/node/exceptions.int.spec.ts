import { describe, expect, it } from 'vitest';

import { Container, type Injectable } from '../../index.js';

describe('Node', () => {
  it('Should throw if circular dependencies found', () => {
    class A implements Injectable {
      public b: unknown;
      public c: unknown;
      constructor(b: B, c: C) {
        this.b = b;
        this.c = c;
      }
    }

    class B implements Injectable {}

    class C implements Injectable {
      public d: unknown;
      constructor(d: D) {
        this.d = d;
      }
    }

    class D implements Injectable {
      public a: unknown;
      constructor(a: A) {
        this.a = a;
      }
    }

    const container: Container = new Container();
    container.bind(A).toSelf();
    container.bind(B).toSelf();
    container.bind(C).toSelf();
    container.bind(D).toSelf();

    function willThrow() {
      const a: A = container.get(A);
      return a;
    }

    expect(willThrow).toThrow('Circular dependency found: A -> C -> D -> A');
  });
});
